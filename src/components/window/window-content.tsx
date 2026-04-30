"use client";

import {
  useState,
  useEffect,
  Component,
  type ReactNode,
  type ComponentType,
} from "react";
import { APPLICATIONS } from "@/constants/applications";
import { IMAGE_FILES } from "@/constants/image-files";
import { DOCUMENTS_FILES } from "@/constants/documents-files";
import { ImageViewer } from "../image-viewer";
import { useWindows } from "@/hooks/useWindows";

// ---------------------------------------------------------------------------
// Error boundary — surfaces silent render crashes (e.g. pdfjs on desktop)
// ---------------------------------------------------------------------------
class PdfErrorBoundary extends Component<
  { children: ReactNode },
  { error: string | null }
> {
  state = { error: null };
  static getDerivedStateFromError(e: Error) {
    return { error: e?.message ?? String(e) };
  }
  render() {
    if (this.state.error) {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-3 p-4 text-center">
          <p className="font-semibold text-destructive">PDF failed to initialize</p>
          <p className="max-w-xs break-all rounded bg-muted px-3 py-2 text-xs text-muted-foreground">
            {this.state.error}
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

// ---------------------------------------------------------------------------
// NativePdfViewer — <iframe> backed by the browser's built-in PDF engine.
// Used on mobile (iOS Safari renders PDFs natively; no JS library needed).
// ---------------------------------------------------------------------------
function NativePdfViewer({ file, title }: { file: string; title?: string }) {
  return (
    <div className="flex h-full flex-col">
      <iframe
        src={file}
        className="min-h-0 w-full flex-1 border-0"
        title={title ?? "PDF Document"}
      />
      <div className="flex justify-end border-t px-3 py-2">
        <a
          href={file}
          download
          className="rounded bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Download
        </a>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// LazyPdfViewer — manual dynamic import for desktop.
// next/dynamic silently hangs when the import() rejects in Turbopack dev mode;
// this component catches both rejections and render errors.
// ---------------------------------------------------------------------------
function LazyPdfViewer({ iconId }: { iconId: string }) {
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [PdfComponent, setPdfComponent] = useState<ComponentType<{
    iconId: string;
  }> | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  useEffect(() => {
    import("../pdf-viewer")
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
        <p className="font-semibold text-destructive">PDF module failed to load</p>
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

// ---------------------------------------------------------------------------
// WindowContent
// ---------------------------------------------------------------------------
interface WindowContentProps {
  iconId: string;
  parentId?: string;
}

export function WindowContent({ iconId, parentId }: WindowContentProps) {
  const { isMobile } = useWindows();
  const application = APPLICATIONS[iconId];

  // Standard application with a registered component
  if (application?.component) {
    const AppComponent = application.component;
    return (
      <section className="flex-2">
        <PdfErrorBoundary>
          <AppComponent iconId={iconId} />
        </PdfErrorBoundary>
      </section>
    );
  }

  // Image viewer
  const imageFile = IMAGE_FILES[iconId];
  if (imageFile) {
    return (
      <section className="flex-2">
        <ImageViewer iconId={iconId} parentId={parentId} />
      </section>
    );
  }

  // Document viewer — mobile uses native <iframe>, desktop uses pdfjs
  const documentFile = DOCUMENTS_FILES[iconId];
  if (documentFile?.viewer === "pdf") {
    return (
      <section className="flex-2">
        {isMobile ? (
          <NativePdfViewer
            file={documentFile.file}
            title={documentFile.windowTitle}
          />
        ) : (
          <PdfErrorBoundary>
            <LazyPdfViewer iconId={iconId} />
          </PdfErrorBoundary>
        )}
      </section>
    );
  }

  return (
    <section className="flex-2">
      <div className="flex h-full items-center justify-center text-gray-500">
        <p>Application not found for: {iconId}</p>
      </div>
    </section>
  );
}
