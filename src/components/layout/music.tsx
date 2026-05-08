import { useEffect, useMemo } from "react";
import { useIcons } from "@/hooks/useIcons";
import { AUDIO_FILES } from "@/constants/audio-files";
import { Icon } from "../icon";

interface MusicProps {
  iconId: string;
}

export function Music({ iconId }: MusicProps) {
  const { icons, addIcon, removeIcon, unhighlightAllIcons } = useIcons();

  function handleIconsAreaClick(event: React.MouseEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget) return;
    if (icons.some((icon) => icon.isHighlighted)) unhighlightAllIcons();
  }

  useEffect(() => {
    Object.values(AUDIO_FILES).forEach((audio) => {
      addIcon({
        id: audio.id,
        title: audio.title,
        isHighlighted: false,
        show: true,
        icon: audio.icon,
        size: { width: 48, height: 48 },
        parentId: iconId,
      });
    });

    return () => {
      Object.values(AUDIO_FILES).forEach((audio) => {
        removeIcon(audio.id);
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
