import Image from "next/image";
import { IMAGE_FILES } from "@/constants/image-files";

interface ImageViewerProps {
  iconId: string;
}

export function ImageViewer({ iconId }: ImageViewerProps) {
  const imageFile = IMAGE_FILES[iconId];

  if (!imageFile) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-gray-500">Image not found</p>
      </div>
    );
  }

  return (
    <div className="flex h-full items-center justify-center bg-black/5 p-4">
      <Image
        src={imageFile.icon}
        alt={imageFile.title}
        className="h-full w-full object-contain"
        sizes="(max-width: 768px) 100vw, 80vw"
        priority
      />
    </div>
  );
}
