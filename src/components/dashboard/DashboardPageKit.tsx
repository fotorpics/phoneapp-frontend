import { memo } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChangeEventHandler, ReactNode } from "react";

type PageShellProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  compact?: boolean;
  hideHeader?: boolean;
};

const PageShell = memo(({
  title,
  description,
  actions,
  children,
  className,
  compact = false,
  hideHeader = false,
}: PageShellProps) => {
  return (
    <div className={cn(compact ? "space-y-3 p-4" : "space-y-6 p-6", className)}>
      {!hideHeader && (
        <div
          className={cn(
            "flex flex-wrap items-start justify-between gap-4 rounded-3xl border border-border p-5 shadow-lg",
            compact ? "gap-2 bg-secondary" : "bg-primary",
          )}
        >
          <div>
            <h1 className={cn("font-display-landing font-bold", compact ? "text-lg text-foreground" : "text-2xl text-primary-foreground")}>
              {title}
            </h1>
            {description ? (
              <p className={cn(compact ? "mt-0.5 text-xs text-muted-foreground" : "mt-1 text-sm text-primary-foreground/80")}>{description}</p>
            ) : null}
          </div>
          {actions ? <div className={cn("flex flex-wrap items-center justify-end gap-3", compact && "gap-2")}>{actions}</div> : null}
        </div>
      )}
      {children}
    </div>
  );
});

type SectionCardProps = {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
};

const SectionCard = memo(({
  title,
  subtitle,
  action,
  children,
  className,
  contentClassName,
}: SectionCardProps) => {
  return (
    <div className={cn("app-panel overflow-hidden", className)}>
      {(title || subtitle || action) && (
        <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
          <div>
            {title ? <h2 className="font-display-landing text-lg font-semibold text-foreground">{title}</h2> : null}
            {subtitle ? <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p> : null}
          </div>
          {action}
        </div>
      )}
      <div className={cn("p-5", contentClassName)}>{children}</div>
    </div>
  );
});

type StatTileProps = {
  label: string;
  value: string;
  hint?: string;
  icon?: ReactNode;
  className?: string;
};

const StatTile = memo(({ label, value, hint, icon, className }: StatTileProps) => {
  return (
    <div className={cn("app-panel p-5", className)}>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        {icon}
      </div>
      <p className="font-mono-dialer text-2xl font-bold text-foreground">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
});

type SearchFieldProps = {
  placeholder: string;
  className?: string;
  value?: string;
  onChange?: ChangeEventHandler<HTMLInputElement>;
};

const SearchField = memo(({ placeholder, className, value, onChange }: SearchFieldProps) => {
  return (
    <div className={cn("relative", className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="h-10 w-full rounded-xl border border-border bg-secondary pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground text-foreground"
      />
    </div>
  );
});

type TableShellProps = {
  children: ReactNode;
  className?: string;
};

const TableShell = memo(({ children, className }: TableShellProps) => {
  return <div className={cn("app-panel overflow-hidden", className)}>{children}</div>;
});

export { PageShell, SectionCard, StatTile, SearchField, TableShell };
export default PageShell;
