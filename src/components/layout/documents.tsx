import { useIcons } from "@/hooks/useIcons";
import { useEffect, useMemo } from "react";

import ResumeImage from "@/assets/resume.svg";

import { Icon } from "../icon";

interface DocumentsProps {
  iconId: string;
}

export function Documents({ iconId }: DocumentsProps) {
  const { icons, addIcon, removeIcon } = useIcons();

  const resumeIcon = useMemo(
    () => ({
      id: "icon-resume",
      title: "Resume",
      isHighlighted: false,
      show: true,
      icon: ResumeImage,
      size: { width: 48, height: 48 },
      parentId: iconId,
    }),
    [iconId],
  );

  useEffect(() => {
    addIcon(resumeIcon);

    return () => {
      removeIcon(resumeIcon.id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const iconsFromStore = icons.filter((icon) => icon.parentId === iconId);

  return (
    <div className="grid-cols-fill-6 grid h-full items-start gap-4">
      {iconsFromStore.map((icon) => (
        <Icon key={icon.id} {...icon} />
      ))}
    </div>
  );
}
