import { APPLICATIONS } from "@/constants/applications";
import { IMAGE_FILES } from "@/constants/image-files";
import { DOCUMENTS_FILES } from "@/constants/documents-files";
import { ImageViewer } from "../image-viewer";
import { PdfViewer } from "../pdf-viewer";

interface WindowContentProps {
  iconId: string;
}

export function WindowContent({ iconId }: WindowContentProps) {
  const application = APPLICATIONS[iconId];

  if (!application) {
    const imageFile = IMAGE_FILES[iconId];
    if (imageFile) {
      return (
        <section className="flex-2">
          <ImageViewer iconId={iconId} />
        </section>
      );
    }

    const documentFile = DOCUMENTS_FILES[iconId];
    if (documentFile) {
      if (documentFile.viewer === "pdf") {
        return (
          <section className="flex-2">
            <PdfViewer iconId={iconId} />
          </section>
        );
      }
    }

    return (
      <section className="flex-2">
        <div className="flex h-full items-center justify-center text-gray-500">
          <p>Application not found for: {iconId}</p>
        </div>
      </section>
    );
  }

  const AppComponent = application.component;

  return (
    <section className="flex-2">
      <AppComponent iconId={iconId} />
    </section>
  );
}
