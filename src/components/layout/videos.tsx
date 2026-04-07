import { useIcons } from "@/hooks/useIcons";

interface VideosProps {
  iconId: string;
}

export function Videos({ iconId }: VideosProps) {
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
      No video files available
    </div>
  );
}
