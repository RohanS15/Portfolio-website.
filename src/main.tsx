import React from "react";
import { createRoot } from "react-dom/client";
import { MotionConfig } from "motion/react";
import App from "./App";
import "./styles.css";
import "./extras.css";
import "./premium.css";
import "./theme.css";
import "./sidebar.css";
import "./playground.css";
import "./terminal.css";
import "./cyberlab.css";
import "./arcade.css";
import "./playground-contrast.css";
import "./home-hero.css";
import { ThemeProvider } from "./components/theme/ThemeProvider";
import ErrorBoundary from "./components/ErrorBoundary";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <MotionConfig reducedMotion="user">
      <ThemeProvider>
        <ErrorBoundary label="Portfolio"><App /></ErrorBoundary>
      </ThemeProvider>
    </MotionConfig>
  </React.StrictMode>,
);
