"use client";

import { useState, useEffect, type ComponentType } from "react";

interface LazyPdfViewerProps {
  iconId: string;
}

export function LazyPdfViewer({ iconId }: LazyPdfViewerProps) {
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [PdfComponent, setPdfComponent] = useState<ComponentType<{
    iconId: string;
  }> | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  useEffect(() => {
    import("./pdf-viewer")
      .then((m) => {
        setPdfComponent(() => m.PdfViewer);
        setStatus("ready");
      })
      .catch((e: unknown) => {
        setImportError((e as Error)?.message ?? String(e));
        setStatus("error");
      });
  }, []);

  if (status === "error") {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-4 text-center">
        <p className="font-semibold text-destructive">
          PDF module failed to load
        </p>
        <p className="max-w-xs break-all rounded bg-muted px-3 py-2 text-xs text-muted-foreground">
          {importError}
        </p>
      </div>
    );
  }

  if (status === "loading") {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        Loading viewer…
      </div>
    );
  }

  if (!PdfComponent) return null;
  return <PdfComponent iconId={iconId} />;
}
