import { useIcons } from "@/hooks/useIcons";
import { useEffect, useMemo } from "react";
import { DOCUMENTS_FILES } from "@/constants/documents-files";

import { Icon } from "../icon";

interface DocumentsProps {
  iconId: string;
}

export function Documents({ iconId }: DocumentsProps) {
  const { icons, addIcon, removeIcon, unhighlightAllIcons } = useIcons();

  function handleIconsAreaClick(event: React.MouseEvent<HTMLDivElement>) {
    // Only handle clicks directly on the parent div, not on child elements
    if (event.target !== event.currentTarget) return;

    if (icons.some((icon) => icon.isHighlighted)) unhighlightAllIcons();
  }

  useEffect(() => {
    Object.values(DOCUMENTS_FILES).forEach((image) => {
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
      Object.values(DOCUMENTS_FILES).forEach((image) => {
        removeIcon(image.id);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const iconsFromStore = useMemo(
    () => icons.filter((icon) => icon.parentId === iconId),
    [icons, iconId],
  );

  return (
    <div
      onClick={handleIconsAreaClick}
      className="grid-cols-fill-6 @min-5xl:grid-cols-fill-7 grid-rows-fill-6 grid h-full gap-4 p-4"
    >
      {iconsFromStore.map((icon) => (
        <Icon imagePlaceholder="blur" key={icon.id} {...icon} />
      ))}
    </div>
  );
}
