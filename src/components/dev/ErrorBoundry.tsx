import React from "react";

export class ErrorBoundary extends React.Component<
  { name: string; children: React.ReactNode },
  { error?: any }
> {
  state = { error: undefined as any };

  static getDerivedStateFromError(error: any) {
    return { error };
  }

  componentDidCatch(error: any, info: any) {
    console.error(`[ErrorBoundary:${this.props.name}]`, error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            padding: 12,
            margin: 8,
            border: "1px solid #f87171",
            background: "#fee2e2",
            color: "#7f1d1d",
            borderRadius: 8,
          }}
        >
          <strong>{this.props.name}</strong>: {String(this.state.error)}
        </div>
      );
    }
    return this.props.children;
  }
}
