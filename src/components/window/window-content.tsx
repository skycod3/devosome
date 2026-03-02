import { Documents } from "../layout/documents";

interface WindowContentProps {
  iconId: string;
}

export function WindowContent({ iconId }: WindowContentProps) {
  return (
    <section className="grid flex-2 p-4">
      {iconId === "icon-documents" && <Documents iconId={iconId} />}
    </section>
  );
}
