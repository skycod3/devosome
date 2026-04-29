import { useIcons } from "@/hooks/useIcons";
import { useEffect } from "react";

import { IMAGE_FILES } from "@/constants/image-files";
import { APPLICATIONS } from "@/constants/applications";

import { ImageViewer } from "../image-viewer";
import { Icon } from "../icon";

interface PicturesProps {
  iconId: string;
}

export function Pictures({ iconId }: PicturesProps) {
  const { icons, addIcon, removeIcon, unhighlightAllIcons } = useIcons();

  function handleIconsAreaClick(event: React.MouseEvent<HTMLDivElement>) {
    // Only handle clicks directly on the parent div, not on child elements
    if (event.target !== event.currentTarget) return;

    if (icons.some((icon) => icon.isHighlighted)) unhighlightAllIcons();
  }

  useEffect(() => {
    Object.values(IMAGE_FILES).forEach((image) => {
      if (!APPLICATIONS[image.id]) {
        APPLICATIONS[image.id] = {
          id: image.id,
          windowTitle: image.windowTitle,
          component: ImageViewer,
          showTabs: false,
        };
      }

      addIcon({
        id: image.id,
        title: image.title,
        isHighlighted: false,
        show: true,
        icon: image.icon,
        size: { width: 48, height: 48 },
        parentId: iconId,
      });
    });

    return () => {
      Object.values(IMAGE_FILES).forEach((image) => {
        removeIcon(image.id);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const iconsFromStore = icons.filter((icon) => icon.parentId === iconId);

  return (
    <div
      onClick={handleIconsAreaClick}
      className="grid-cols-fill-6 grid h-full items-start gap-4 p-4"
    >
      {iconsFromStore.map((icon) => (
        <Icon key={icon.id} {...icon} />
      ))}
    </div>
  );
}
