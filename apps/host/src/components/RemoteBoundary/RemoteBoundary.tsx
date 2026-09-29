import { Component, type ReactNode } from "react";

interface RemoteBoundaryProps {
  fallback: ReactNode;
  children: ReactNode;
}

/**
 * Si un remoto está caído, el import falla: este error boundary evita que
 * eso tumbe también al host. Los error boundaries todavía requieren clases.
 */
export default class RemoteBoundary extends Component<
  RemoteBoundaryProps,
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.error("Error al cargar un micro-frontend", error);
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
