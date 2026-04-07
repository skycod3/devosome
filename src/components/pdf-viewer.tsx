"use client";

import { useEffect, useMemo, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { useTheme } from "@/hooks/useTheme";

import { DEFAULT_WINDOW_SIZE } from "@/constants/windows";
import {
  DEFAULT_SCALE,
  SCALE_STEP,
  MAX_SCALE,
  MIN_SCALE,
} from "@/constants/resume";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

import {
  PiCaretLeft,
  PiCaretRight,
  PiCircleNotch,
  PiDownloadSimple,
  PiMinus,
  PiPlus,
  PiSpinner,
  PiWarning,
} from "react-icons/pi";

import {
  TooltipProvider,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "./ui/tooltip";

export interface PdfViewerProps {
  iconId: string;
}

export function PdfViewer({ iconId }: PdfViewerProps) {
  const { theme } = useTheme();
  const [numPages, setNumPages] = useState<number>();
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(DEFAULT_SCALE);
  const [isDocumentLoaded, setIsDocumentLoaded] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);

  const options = useMemo(
    () => ({
      cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
      cMapPacked: true,
    }),
    [],
  );

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
    setIsDocumentLoaded(true);
    setHasError(false);
  }

  function onDocumentLoadError(error: Error): void {
    console.error("Error loading PDF:", error);
    setHasError(true);
    setIsDocumentLoaded(false);
  }

  // Zoom functions with limits
  const zoomIn = () => {
    setScale((prev) => Math.min(prev + SCALE_STEP, MAX_SCALE));
  };

  const zoomOut = () => {
    setScale((prev) => Math.max(prev - SCALE_STEP, MIN_SCALE));
  };

  const resetZoom = () => {
    setScale(DEFAULT_SCALE);
  };

  // Page navigation
  const goToNextPage = () => {
    setPageNumber((prev) => Math.min(prev + 1, numPages || prev));
  };

  const goToPrevPage = () => {
    setPageNumber((prev) => Math.max(prev - 1, 1));
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isDocumentLoaded) return;

      switch (e.key) {
        case "ArrowLeft":
          goToPrevPage();
          break;
        case "ArrowRight":
          goToNextPage();
          break;
        case "+":
        case "=":
          e.preventDefault();
          zoomIn();
          break;
        case "-":
          e.preventDefault();
          zoomOut();
          break;
        case "0":
          e.preventDefault();
          resetZoom();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDocumentLoaded, numPages]);

  return (
    <TooltipProvider>
      <div
        className={`relative h-full overflow-auto ${theme === "dark" ? "bg-gray-900" : "bg-gray-100"}`}
      >
        {hasError ? (
          <div className="flex h-full flex-col items-center justify-center gap-4">
            <PiWarning className="size-16 text-red-500" />
            <p className="text-lg font-semibold text-foreground">
              Failed to load PDF
            </p>
            <p className="text-sm text-muted-foreground">
              Please check if the file exists at /documents/resume.pdf
            </p>
          </div>
        ) : (
          <>
            <div className="flex justify-center p-4">
              <Document
                className="[&_canvas]:mx-auto [&_canvas]:shadow-lg"
                file="/documents/resume.pdf"
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                options={options}
                loading={
                  <div className="grid h-full place-content-center py-20">
                    <div className="flex items-center gap-2 text-foreground">
                      <PiSpinner className="size-5 animate-spin" />
                      <span>Loading PDF...</span>
                    </div>
                  </div>
                }
              >
                <Page
                  pageNumber={pageNumber}
                  height={DEFAULT_WINDOW_SIZE.height - 100}
                  scale={scale}
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                />
              </Document>
            </div>

            {isDocumentLoaded && (
              <>
                {/* Page counter */}
                <div className="fixed top-14 rounded bg-background/90 px-3 py-1.5 text-sm font-medium text-foreground shadow-md backdrop-blur-sm">
                  Page {pageNumber} of {numPages}
                </div>

                {/* Zoom level indicator */}
                <div className="fixed top-14 right-10 rounded bg-background/90 px-3 py-1.5 text-sm font-medium text-foreground shadow-md backdrop-blur-sm">
                  {Math.round(scale * 100)}%
                </div>

                {/* Control buttons */}
                <div className="fixed z-10 bottom-8 right-10 flex gap-2">
                  {/* Page Navigation */}
                  {numPages && numPages > 1 && (
                    <>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={goToPrevPage}
                            disabled={pageNumber <= 1}
                            className="flex-center bg-background border-foreground/15 size-9 rounded border shadow-md transition-opacity hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <PiCaretLeft className="size-5 text-foreground" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Previous page (←)</p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={goToNextPage}
                            disabled={pageNumber >= (numPages || 1)}
                            className="flex-center bg-background border-foreground/15 size-9 rounded border shadow-md transition-opacity hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <PiCaretRight className="size-5 text-foreground" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Next page (→)</p>
                        </TooltipContent>
                      </Tooltip>

                      <div className="mx-1 w-px bg-border" />
                    </>
                  )}

                  {/* Download */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <a
                        href="/documents/resume.pdf"
                        download
                        className="flex-center bg-primary size-9 rounded shadow-md transition-colors hover:bg-primary/90"
                      >
                        <PiDownloadSimple className="size-5 text-primary-foreground" />
                      </a>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Download PDF</p>
                    </TooltipContent>
                  </Tooltip>

                  <div className="mx-1 w-px bg-border" />

                  {/* Zoom Controls */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={zoomIn}
                        disabled={scale >= MAX_SCALE}
                        className="flex-center bg-background border-foreground/15 size-9 rounded border shadow-md transition-opacity hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <PiPlus className="size-5 text-foreground" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Zoom in (+)</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={zoomOut}
                        disabled={scale <= MIN_SCALE}
                        className="flex-center bg-background border-foreground/15 size-9 rounded border shadow-md transition-opacity hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <PiMinus className="size-5 text-foreground" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Zoom out (-)</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={resetZoom}
                        disabled={scale === DEFAULT_SCALE}
                        className="flex-center bg-background border-foreground/15 size-9 rounded border shadow-md transition-opacity hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <PiCircleNotch className="size-5 text-foreground" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Reset zoom (0)</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </TooltipProvider>
  );
}
