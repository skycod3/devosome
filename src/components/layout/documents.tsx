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

  const documentIcons = useMemo(
    () =>
      Object.values(DOCUMENTS_FILES).map((doc) => ({
        id: doc.id,
        title: doc.title,
        isHighlighted: false,
        show: true,
        icon: doc.icon,
        size: { width: 48, height: 48 },
        parentId: iconId,
      })),
    [iconId],
  );

  useEffect(() => {
    documentIcons.forEach(addIcon);

    return () => {
      documentIcons.forEach((icon) => removeIcon(icon.id));
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
