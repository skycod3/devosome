import { useIcons } from "@/hooks/useIcons";

interface MusicProps {
  iconId: string;
}

export function Music({ iconId }: MusicProps) {
  const { icons, unhighlightAllIcons } = useIcons();

  function handleIconsAreaClick(event: React.MouseEvent<HTMLDivElement>) {
    // Only handle clicks directly on the parent div, not on child elements
    if (event.target !== event.currentTarget) return;

    if (icons.some((icon) => icon.isHighlighted)) unhighlightAllIcons();
  }

  return (
    <div
      onClick={handleIconsAreaClick}
      className="flex h-full items-center justify-center text-gray-500"
    >
      No music files available
    </div>
  );
}
