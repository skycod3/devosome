"use client";

import { Component, type ReactNode } from "react";

interface PdfErrorBoundaryProps {
  children: ReactNode;
}

interface PdfErrorBoundaryState {
  error: string | null;
}

export class PdfErrorBoundary extends Component<
  PdfErrorBoundaryProps,
  PdfErrorBoundaryState
> {
  state: PdfErrorBoundaryState = { error: null };

  static getDerivedStateFromError(e: Error) {
    return { error: e?.message ?? String(e) };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-3 p-4 text-center">
          <p className="font-semibold text-destructive">
            PDF failed to initialize
          </p>
          <p className="max-w-xs break-all rounded bg-muted px-3 py-2 text-xs text-muted-foreground">
            {this.state.error}
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}
