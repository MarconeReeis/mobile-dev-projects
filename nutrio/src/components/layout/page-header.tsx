import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  action,
}: {
  eyebrow?: string;
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
      <div className="min-w-0">
        {eyebrow && <p className="text-sm text-muted-foreground first-letter:uppercase">{eyebrow}</p>}
        <h1 className="truncate text-3xl font-bold lg:text-4xl">{title}</h1>
      </div>
      {action}
    </div>
  );
}
