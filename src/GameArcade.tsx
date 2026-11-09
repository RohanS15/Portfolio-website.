import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { bugs, gameNames, securityQuestions, shellPuzzles } from "./features/arcade/arcadeData";

type RoundReview = {
  prompt: string;
  userAnswer: string;
  correctAnswer: string;
  explanation: string;
  correct: boolean;
};

export default function GameArcade() {
  const [game, setGame] = useState(gameNames[0]);
  const [launched, setLaunched] = useState(false);
  const [level, setLevel] = useState("Standard");
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState("Choose a challenge to begin.");
  const [target, setTarget] = useState(23);
  const [sequence, setSequence] = useState<number[]>([]);
  const [showSequence, setShowSequence] = useState(false);
  const [started, setStarted] = useState(false);
  const [reactionAt, setReactionAt] = useState(0);
  const [lastReaction, setLastReaction] = useState<number | null>(null);
  const [bestReaction, setBestReaction] = useState(0);
  const [roundReport, setRoundReport] = useState<RoundReview[]>([]);
  const [timeLeft, setTimeLeft] = useState(15);
  const timer = useRef<number | undefined>(undefined);
  const roundResolved = useRef(false);
  const binary = target.toString(2);
  const binaryBreakdown = binary.split("").reverse().flatMap((bit, index) => bit === "1" ? [2 ** index] : []).join(" + ");
  const maxRounds = 10;
  const finished = round >= maxRounds;
  const challenge = securityQuestions[round % securityQuestions.length];
  const terminal = shellPuzzles[round % shellPuzzles.length];
  const bug = bugs[round % bugs.length];

  useEffect(() => {
    try {
      setBestReaction(Number(localStorage.getItem("portfolio-reaction-best")) || 0);
    } catch {
      // The best score is optional when storage is unavailable.
    }
    return () => window.clearTimeout(timer.current);
  }, []);
  useEffect(() => {
    if (game !== "Binary Puzzle" || !started || finished) return;
    roundResolved.current = false;
    let remaining = 15;
    setTimeLeft(remaining);
    const interval = window.setInterval(() => {
      if (roundResolved.current) return;
      remaining -= 1;
      setTimeLeft(remaining);
      if (remaining <= 0) {
        roundResolved.current = true;
        window.clearInterval(interval);
        const nextRound = round + 1;
        setStarted(nextRound < maxRounds);
        setFeedback(nextRound < maxRounds ? "Time elapsed. Moving to the next conversion." : "Time elapsed. Session complete.");
        setRoundReport((items) => [...items, {
          prompt: `Convert ${binary} from binary to decimal`,
          userAnswer: "No answer (time expired)",
          correctAnswer: String(target),
          explanation: `${binary}₂ = ${binaryBreakdown} = ${target}₁₀. Each 1 bit contributes its matching power of 2.`,
          correct: false,
        }]);
        setRound(nextRound);
        const max = level === "Easy" ? 15 : level === "Expert" ? 255 : 63;
        setTarget(Math.floor(Math.random() * max) + 1);
      }
    }, 1000);
    return () => window.clearInterval(interval);
  }, [game, started, round, finished, level]);
  const nextTarget = () => {
    const max = level === "Easy" ? 15 : level === "Expert" ? 255 : 63;
    setTarget(Math.floor(Math.random() * max) + 1);
  };
  const answer = (good: boolean, message: string, review?: Omit<RoundReview, "correct">) => {
    if (roundResolved.current || finished) return;
    roundResolved.current = true;
    if (good) setScore((value) => value + 1);
    if (review && game !== "Reaction") setRoundReport((items) => [...items, { ...review, correct: good }]);
    const nextRound = round + 1;
    setRound(nextRound);
    if (nextRound < maxRounds) start(nextRound, message);
    else { setStarted(false); setFeedback(message); }
    nextTarget();
  };
  const restart = () => {
    window.clearTimeout(timer.current);
    roundResolved.current = false;
    setRound(0);
    setScore(0);
    setSequence([]);
    setRoundReport([]);
    setShowSequence(false);
    setStarted(false);
    setReactionAt(0);
    setLastReaction(null);
    setFeedback("Ready when you are.");
    nextTarget();
  };
  const start = (roundNumber = round, resultMessage?: string) => {
    window.clearTimeout(timer.current);
    roundResolved.current = false;
    setStarted(true);
    setFeedback(resultMessage ?? "Challenge active.");
    if (game === "Memory Matrix") {
      const base = level === "Easy" ? 3 : level === "Expert" ? 5 : 4;
      const length = Math.min(8, base + Math.floor(roundNumber / 2));
      const next = Array.from(
        { length },
        () => Math.floor(Math.random() * 9) + 1,
      );
      setSequence(next);
      setShowSequence(true);
      if (!resultMessage) setFeedback("Watch the sequence, then repeat it.");
      timer.current = window.setTimeout(
        () => setShowSequence(false),
        level === "Expert" ? 1200 : 1900,
      );
    }
    if (game === "Reaction") {
      setLastReaction(null);
      setReactionAt(0);
      if (!resultMessage) setFeedback("Wait for the signal.");
      timer.current = window.setTimeout(
        () => {
          if (roundResolved.current) return;
          setReactionAt(Date.now());
          setFeedback("SIGNAL — tap the panel.");
        },
        900 + Math.random() * 2400,
      );
    }
  };
  useEffect(() => {
    if (launched && !started && !finished) {
      if (game === "Binary Puzzle") nextTarget();
      start(0);
    }
  }, [launched, game, level]);
  const finishReaction = () => {
    if (roundResolved.current || finished) return;
    if (!reactionAt) {
      if (feedback.includes("SIGNAL"))
        setFeedback("Too soon—wait for the signal, then tap.");
      return;
    }
    roundResolved.current = true;
    window.clearTimeout(timer.current);
    const elapsed = Date.now() - reactionAt;
    setReactionAt(0);
    setLastReaction(elapsed);
    const nextBest = bestReaction ? Math.min(bestReaction, elapsed) : elapsed;
    setBestReaction(nextBest);
    try {
      localStorage.setItem("portfolio-reaction-best", String(nextBest));
    } catch {
      /* storage is optional */
    }
    setScore(
      (value) =>
        value +
        (elapsed < (level === "Expert" ? 260 : level === "Easy" ? 500 : 350)
          ? 1
          : 0),
    );
    const nextRound = round + 1;
    const resultMessage = `Recorded ${elapsed} ms. ${nextRound < maxRounds ? "Next trial loading." : "Session complete."}`;
    setRound(nextRound);
    if (nextRound < maxRounds) start(nextRound, resultMessage);
    else { setStarted(false); setFeedback(resultMessage); }
  };

  const content = () => {
    if (finished)
      return (
        <div className="challenge-complete" key={`complete-${game}`}>
          <span>SESSION COMPLETE</span>
          <b>{score} / 10</b>
          <p>
            {score >= 8
              ? "Sharp work. You read the signals well."
              : "Good practice. Try another round and see what changes."}
          </p>
          <button className="button-primary small" onClick={() => { restart(); start(0); }}>
            ↻ &nbsp; Play again
          </button>
          {game !== "Reaction" && game !== "Memory Matrix" && <section className="arcade-round-report" aria-label={`${game} answer report`}>
            <div className="arcade-report-heading">
              <span>RUN REVIEW</span>
              <h4>Answers &amp; explanations</h4>
              <p>Review each question, your response, and the reasoning behind the correct answer.</p>
            </div>
            <ol className="arcade-report-list">
              {roundReport.map((item, index) => <li className={item.correct ? "arcade-report-item is-correct" : "arcade-report-item is-incorrect"} key={`${game}-${index}`}>
                <div className="arcade-report-item-head"><span>QUESTION {String(index + 1).padStart(2, "0")}</span><b>{item.correct ? "CORRECT" : "REVIEW"}</b></div>
                <h5>{item.prompt}</h5>
                <dl>
                  <div><dt>Your answer</dt><dd>{item.userAnswer}</dd></div>
                  <div><dt>Correct answer</dt><dd>{item.correctAnswer}</dd></div>
                </dl>
                <p>{item.explanation}</p>
              </li>)}
            </ol>
          </section>}
        </div>
      );
    switch (game) {
      case "Cyber Defense":
        return (
          <div className="challenge cyber-defense-challenge" key={round}>
            <div className="challenge-meta">
              <span>AUTHENTICATION LOG · QUESTION {round + 1} / 10</span>
              <span>SCORE {score} / 10</span>
            </div>
            <div className="log-line">
              <b>09:{String(41 + round).padStart(2, "0")}:12</b>
              <code>{challenge.log}</code>
            </div>
            <p>
              Investigate the sample pattern, or close it as expected activity.
            </p>
            <div className="answer-row">
              <button
                onClick={() => answer(challenge.suspicious, "Response recorded.", {
                  prompt: challenge.log,
                  userAnswer: "Investigate",
                  correctAnswer: challenge.suspicious ? "Investigate" : "Close as expected",
                  explanation: challenge.suspicious
                    ? "Repeated failures followed by a successful login, a new device, or denied MFA can indicate account compromise. Investigate the sign-in context and verify with the user through a trusted channel."
                    : "This sign-in matches an expected host or active change window. Confirm the context and document the evidence before closing the alert.",
                })}
              >
                Investigate
              </button>
              <button
                onClick={() => answer(!challenge.suspicious, "Response recorded.", {
                  prompt: challenge.log,
                  userAnswer: "Close as expected",
                  correctAnswer: challenge.suspicious ? "Investigate" : "Close as expected",
                  explanation: challenge.suspicious
                    ? "Repeated failures followed by a successful login, a new device, or denied MFA can indicate account compromise. Investigate the sign-in context and verify with the user through a trusted channel."
                    : "This sign-in matches an expected host or active change window. Confirm the context and document the evidence before closing the alert.",
                })}
              >
                Close as expected
              </button>
            </div>
          </div>
        );
      case "Binary Puzzle":
        return (
          <div className="challenge center" key={round}>
            <div className="challenge-meta">
              <span>BASE CONVERSION · QUESTION {round + 1} / 10</span>
              <span>
                TIME {timeLeft}s · SCORE {score} / 10
              </span>
            </div>
            <div className="binary">
              {binary}
              <small>BASE 2</small>
            </div>
            <p>Convert this value to decimal before the timer ends.</p>
            <div className="answer-row">
              {[target, target + 3, Math.max(0, target - 2)]
                .sort((a, b) => a - b)
                .map((value) => (
                  <button
                    key={value}
                    onClick={() =>
                      answer(
                        value === target,
                        value === target
                          ? "Correct conversion."
                          : "Not quite. Add the place values for each set bit.",
                      {
                        prompt: `Convert ${binary} from binary to decimal`,
                        userAnswer: String(value),
                        correctAnswer: String(target),
                        explanation: `${binary}₂ = ${binaryBreakdown} = ${target}₁₀. Each 1 bit contributes its matching power of 2.`,
                      },
                      )
                    }
                  >
                    {value}
                  </button>
                ))}
            </div>
          </div>
        );
      case "Memory Matrix":
        return (
          <div className="challenge center memory-challenge" key={round}>
            <div className="challenge-meta">
              <span>SEQUENCE RECALL · QUESTION {round + 1} / 10</span>
              <span>SCORE {score} / 10</span>
            </div>
            <p>
              {showSequence
                ? `Remember: ${sequence.join(" · ")}`
                : feedback || "Repeat the hidden sequence in order."}
            </p>
            <div className="matrix">
              {Array.from({ length: 9 }, (_, i) => (
                <button
                  key={i}
                  aria-label={`Sequence tile ${i + 1}`}
                  onClick={() => {
                    if (!sequence.length || showSequence || roundResolved.current) return;
                    if (i + 1 === sequence[0]) {
                      const rest = sequence.slice(1);
                      setSequence(rest);
                      if (!rest.length) {
                        roundResolved.current = true;
                        setScore((value) => value + 1);
                        const nextRound = round + 1;
                        setRound(nextRound);
                        if (nextRound < maxRounds) start(nextRound, "Sequence complete. Next pattern loading.");
                        else { setStarted(false); setFeedback("Sequence complete. Session complete."); }
                      }
                    } else {
                      roundResolved.current = true;
                      setSequence([]);
                      const nextRound = round + 1;
                      setRound(nextRound);
                      if (nextRound < maxRounds) start(nextRound, "Pattern missed. Moving to the next sequence.");
                      else { setStarted(false); setFeedback("Pattern missed. Session complete."); }
                    }
                  }}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        );
      case "Terminal":
        return (
          <div className="challenge" key={round}>
            <div className="challenge-meta">
              <span>SIMULATED SHELL · QUESTION {round + 1} / 10</span>
              <span>SCORE {score} / 10</span>
            </div>
            <div className="binary terminal-prompt">{terminal.prompt}</div>
            <p>Choose the command that completes the task.</p>
            <div className="answer-row">
              {terminal.choices.map((value) => (
                <button
                  key={value}
                  onClick={() =>
                    answer(
                      value === terminal.answer,
                      value === terminal.answer
                        ? `Correct. ${terminal.why}`
                        : "That command does a different job. Review the prompt and try the next one.",
                      { prompt: terminal.prompt, userAnswer: value, correctAnswer: terminal.answer, explanation: terminal.why },
                    )
                  }
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
        );
      case "Debugging":
        return (
          <div className="challenge debugging-challenge" key={round}>
            <div className="challenge-meta">
              <span>CODE REVIEW · QUESTION {round + 1} / 10</span>
              <span>SCORE {score} / 10</span>
            </div>
            <pre className="snippet">{bug.code}</pre>
            <p>What is the issue in this snippet?</p>
            <div className="answer-row">
              <button
                onClick={() =>
                    answer(
                    bug.answer === "Assignment instead of comparison",
                    `Right. ${bug.fix}`,
                      { prompt: bug.code, userAnswer: "Assignment instead of comparison", correctAnswer: bug.answer, explanation: bug.fix },
                  )
                }
              >
                Assignment instead of comparison
              </button>
              <button
                onClick={() =>
                    answer(
                    bug.answer === "Off-by-one result",
                    `Right. ${bug.fix}`,
                      { prompt: bug.code, userAnswer: "Off-by-one result", correctAnswer: bug.answer, explanation: bug.fix },
                  )
                }
              >
                Off-by-one result
              </button>
              <button
                onClick={() =>
                    answer(
                    bug.answer === "Missing function call",
                    `Right. ${bug.fix}`,
                      { prompt: bug.code, userAnswer: "Missing function call", correctAnswer: bug.answer, explanation: bug.fix },
                  )
                }
              >
                Missing function call
              </button>
            </div>
          </div>
        );
      default:
        return (
          <div className="challenge center reaction-challenge" key={round}>
            <div className="challenge-meta">
              <span>REACTION TEST · QUESTION {round + 1} / 10</span>
              <span>BEST {bestReaction ? `${bestReaction} ms` : "—"}</span>
            </div>
            <button
              className={reactionAt ? "reaction-zone signal" : "reaction-zone"}
              onClick={finishReaction}
            >
              {reactionAt ? "SIGNAL — TAP" : "WAIT"}
            </button>
            <p>
              {lastReaction === null
                ? feedback
                : `Last reaction: ${lastReaction} ms`}
            </p>
          </div>
        );
    }
  };

  const description = (name: string) =>
    name === "Memory Matrix"
      ? "Remember a short sequence, then repeat it with the numbered tiles."
      : name === "Reaction"
        ? "Wait for the signal, then tap as quickly as you can."
        : name === "Terminal"
          ? "Solve simulated shell tasks using the right command."
          : name === "Binary Puzzle"
            ? "Convert each binary value into decimal before time runs out."
            : name === "Debugging"
              ? "Spot the specific issue in short code samples."
              : "Inspect synthetic sign-in events and choose a response.";
  const chooseGame = (name: string) => {
    window.clearTimeout(timer.current);
    roundResolved.current = false;
    setGame(name);
    if (name === "Binary Puzzle") nextTarget();
    setRound(0);
    setScore(0);
    setSequence([]);
    setShowSequence(false);
    setRoundReport([]);
    setReactionAt(0);
    setLastReaction(null);
    setStarted(false);
    setFeedback("Ready when you are.");
  };
  const renderGameTabs = () => (
    <div className="game-tabs" role="tablist" aria-label="Digital playground challenges">
      {gameNames.map((name, i) => (
        <button
          type="button"
          role="tab"
          id={`arcade-tab-${i}`}
          aria-controls="arcade-panel"
          aria-selected={game === name}
          tabIndex={game === name ? 0 : -1}
          className={game === name ? "game-tab active" : "game-tab"}
          key={name}
          onClick={() => chooseGame(name)}
          onKeyDown={(event) => {
            if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) return;
            event.preventDefault();
            const next = event.key === "Home" ? 0 : event.key === "End" ? gameNames.length - 1 : (i + (event.key === "ArrowRight" ? 1 : -1) + gameNames.length) % gameNames.length;
            chooseGame(gameNames[next]);
            document.getElementById(`arcade-tab-${next}`)?.focus();
          }}
        >
          {game === name && (
            <motion.span
              className="game-tab-indicator"
              layoutId="arcade-tab-indicator"
              transition={{ type: "spring", stiffness: 360, damping: 34 }}
              aria-hidden="true"
            />
          )}
          <span className="game-tab-index">0{i + 1}</span>
          <span className="game-tab-symbol" aria-hidden="true">{["⌁", ">_", "01", "▦", "{}", "◷"][i]}</span>
          <span className="game-tab-name">{name}</span>
        </button>
      ))}
    </div>
  );
  if (!launched)
    return (
      <div className="arcade arcade-landing">
        <div className="arcade-landing-head">
          <div>
            <span className="arcade-overline">SIX SHORT CHALLENGES</span>
            <h3>Pick a side quest.</h3>
            <p>
              Choose a challenge and difficulty. Answer once to begin; each response moves straight to the next question. Build your score out of 10.
            </p>
          </div>
          <label className="difficulty-control">
            DIFFICULTY
            <select value={level} onChange={(e) => setLevel(e.target.value)}>
              <option>Easy</option>
              <option>Standard</option>
              <option>Expert</option>
            </select>
          </label>
        </div>
        {renderGameTabs()}
        <div className="game-tab-panel" id="arcade-panel" role="tabpanel" aria-labelledby={`arcade-tab-${gameNames.indexOf(game)}`} tabIndex={0}>
          <div className="game-panel-symbol" aria-hidden="true">{["⌁", ">_", "01", "▦", "{}", "◷"][gameNames.indexOf(game)]}</div>
          <div className="game-panel-copy">
            <span className="game-card-index">CHALLENGE 0{gameNames.indexOf(game) + 1} / 06 · {level.toUpperCase()}</span>
            <h4>{game}</h4>
            <p>{description(game)}</p>
          </div>
          <span className="game-panel-badge"><span>10 QUESTION RUN</span><b>SCORE {String(score).padStart(2,"0")} / 10</b></span>
        </div>
        <div className="arcade-landing-foot">
          <span>10 QUESTIONS · SCORE OUT OF 10 · {level.toUpperCase()}</span>
          <button
            className="button-primary"
            onClick={() => {
              restart();
              setLaunched(true);
            }}
          >
            Begin {game} run ↗
          </button>
        </div>
      </div>
    );
  return (
    <div className="arcade arcade-session">
      <div className="arcade-session-head">
        <button className="back-games" onClick={() => setLaunched(false)}>
          ← All challenges
        </button>
        <label className="difficulty-control">
          DIFFICULTY
          <select
            value={level}
            onChange={(e) => {
              setLevel(e.target.value);
              restart();
            }}
          >
            <option>Easy</option>
            <option>Standard</option>
            <option>Expert</option>
          </select>
        </label>
      </div>
      {renderGameTabs()}
      <div className="arcade-game" id="arcade-panel" role="tabpanel" aria-labelledby={`arcade-tab-${gameNames.indexOf(game)}`} tabIndex={0}>
        <div className="arcade-workspace-head">
          <div>
            <span className="arcade-overline">
              CHALLENGE · {level.toUpperCase()}
            </span>
            <h3>{game}</h3>
          </div>
          <span className="arcade-score" key={score}><small>SCORE</small><b>{String(score).padStart(2,"0")}<i> / 10</i></b></span>
        </div>
        <div className="arcade-session-progress"><span>QUESTION {Math.min(round + 1,maxRounds)} / {maxRounds}</span><div role="progressbar" aria-label="Challenge progress" aria-valuemin={0} aria-valuemax={maxRounds} aria-valuenow={round}><i style={{ width:`${Math.min(100,(round/maxRounds)*100)}%` }} /></div></div>
        <p className="game-instructions">{description(game)}</p>
        {content()}
        <div className="game-footer">
          <span>{feedback}</span>
          {!started && !finished && <button
            className="button-primary small"
            onClick={() => start(round)}
          >
            Start run →
          </button>}
        </div>
      </div>
    </div>
  );
}
