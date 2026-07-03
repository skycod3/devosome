"use client";

import { APPLICATIONS } from "@/constants/applications";
import { TabsContent } from "@/components/ui/tabs";
import { IMAGE_FILES } from "@/constants/image-files";
import { DOCUMENTS_FILES } from "@/constants/documents-files";
import { VIDEO_FILES } from "@/constants/video-files";
import { AUDIO_FILES } from "@/constants/audio-files";
import { ImageViewer } from "../image-viewer";
import { MediaPlayer } from "../media-player";
import { useWindows } from "@/hooks/useWindows";
import {
  NativePdfViewer,
  PdfErrorBoundary,
  LazyPdfViewer,
} from "../pdf-viewer";

import { HeroBackdrop } from "../effects/hero-backdrop";

// ---------------------------------------------------------------------------
// WindowContent
// ---------------------------------------------------------------------------
interface WindowContentProps {
  iconId: string;
  parentId?: string;
  windowId?: string;
}

export function WindowContent({
  iconId,
  parentId,
  windowId,
}: WindowContentProps) {
  const { isMobile } = useWindows();
  const application = APPLICATIONS[iconId];

  // Tabbed window (e.g. "files"): render all tabs with forceMount so they stay
  // in the DOM when inactive — prevents re-mount/blur-flash on tab switch.
  const availableTabs = application?.availableTabs;
  if (availableTabs) {
    return (
      <section className="flex-2 @container overflow-auto min-w-0 relative isolate bg-card">
        <HeroBackdrop />

        {availableTabs.map((tabId) => {
          const tabApp = APPLICATIONS[tabId];
          const AppComponent = tabApp?.component;
          if (!AppComponent) return null;
          return (
            <TabsContent
              key={tabId}
              value={tabId}
              forceMount
              className="h-full data-[state=inactive]:hidden"
            >
              <AppComponent iconId={tabId} />
            </TabsContent>
          );
        })}
      </section>
    );
  }

  // Standard application with a registered component
  if (application?.component) {
    const AppComponent = application.component;
    return (
      // `relative` so an app's absolute backdrop (HeroBackdrop) is confined to the
      // body and doesn't bleed up behind the window header.
      <section className="relative flex-2 @container">
        <AppComponent iconId={iconId} />
      </section>
    );
  }

  // Image viewer
  const imageFile = IMAGE_FILES[iconId];
  if (imageFile) {
    return (
      <section className="flex-2">
        <ImageViewer iconId={iconId} parentId={parentId} windowId={windowId} />
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

  // Video player
  const videoFile = VIDEO_FILES[iconId];
  if (videoFile) {
    return (
      <section className="flex-2">
        <MediaPlayer iconId={iconId} mediaType="video" />
      </section>
    );
  }

  // Audio player
  const audioFile = AUDIO_FILES[iconId];
  if (audioFile) {
    return (
      <section className="flex-2">
        <MediaPlayer iconId={iconId} mediaType="audio" />
      </section>
    );
  }

  return (
    <section className="flex-2">
      <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-center text-muted-foreground">
        <p className="text-sm font-medium">App not found</p>
        <p className="font-mono text-xs opacity-60">{iconId}</p>
      </div>
    </section>
  );
}
