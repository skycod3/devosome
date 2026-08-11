"use client";

import { Suspense, type ComponentType, type ReactNode } from "react";

import { APPLICATIONS } from "@/constants/applications";
import { TabsContent } from "@/components/ui/tabs";
import { IMAGE_FILES } from "@/constants/image-files";
import { DOCUMENTS_FILES } from "@/constants/documents-files";
import { VIDEO_FILES } from "@/constants/video-files";
import { AUDIO_FILES } from "@/constants/audio-files";
import { ImageViewer } from "../image-viewer";
import { MediaPlayer } from "../media-player";
import { useIsMobile } from "@/hooks/useIsMobile";
import {
  NativePdfViewer,
  PdfErrorBoundary,
  LazyPdfViewer,
} from "../pdf-viewer";

import { HeroBackdrop } from "../effects/hero-backdrop";

// The lazy apps pass no `loading` to next/dynamic, so they carry no Suspense
// boundary of their own (see constants/applications.ts). These boundaries have
// to stay: without one the suspension escapes to the Desktop's own dynamic()
// and React swaps the whole desktop for its full-screen spinner.

/** Fallback for apps that don't register a `loading` skeleton of their own. */
function AppLoading() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="size-6 animate-spin rounded-full border-2 border-muted border-t-foreground motion-reduce:animate-none" />
    </div>
  );
}

/** Scopes a lazy app's suspension to its own window body. */
function AppBoundary({
  loading: Loading = AppLoading,
  children,
}: {
  loading?: ComponentType;
  children: ReactNode;
}) {
  const fallback = (
    <div
      className="h-full w-full"
      role="status"
      aria-busy="true"
      aria-label="Loading application"
    >
      <Loading />
    </div>
  );

  return <Suspense fallback={fallback}>{children}</Suspense>;
}

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
  const isMobile = useIsMobile();
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
              {/* One boundary per tab, not one around the map: forceMount
                  mounts all five, so a shared boundary would blank every tab
                  while any one of them loads. */}
              <AppBoundary loading={tabApp?.loading}>
                <AppComponent iconId={tabId} />
              </AppBoundary>
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
        <AppBoundary loading={application.loading}>
          <AppComponent iconId={iconId} />
        </AppBoundary>
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
        <MediaPlayer iconId={iconId} mediaType="video" windowId={windowId} />
      </section>
    );
  }

  // Audio player
  const audioFile = AUDIO_FILES[iconId];
  if (audioFile) {
    return (
      <section className="flex-2">
        <MediaPlayer iconId={iconId} mediaType="audio" windowId={windowId} />
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
