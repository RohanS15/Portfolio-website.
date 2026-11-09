import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = { children: ReactNode; label?: string };
type State = { failed: boolean };

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) console.error(`Render failed in ${this.props.label ?? "portfolio section"}`, error, info.componentStack);
  }

  render() {
    if (this.state.failed) {
      return (
        <div className="section-error" role="alert">
          <b>{this.props.label ?? "This section"} could not be displayed.</b>
          <p>Other parts of the portfolio are still available. Try refreshing this page.</p>
          <button className="button-secondary" type="button" onClick={() => this.setState({ failed: false })}>Try again</button>
        </div>
      );
    }
    return this.props.children;
  }
}
