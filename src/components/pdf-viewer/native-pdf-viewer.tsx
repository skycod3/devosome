"use client";

interface NativePdfViewerProps {
  file: string;
  title?: string;
}

export function NativePdfViewer({ file, title }: NativePdfViewerProps) {
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
