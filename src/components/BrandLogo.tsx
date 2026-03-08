import { cn } from "@/lib/utils";

type BrandLogoProps = {
  showText?: boolean;
  className?: string;
  textClassName?: string;
  badgeClassName?: string;
};

const BrandLogo = ({ showText = true, className, textClassName, badgeClassName }: BrandLogoProps) => {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-secondary",
          badgeClassName,
        )}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[18px] w-[18px] text-primary">
          <path d="M4 14.5C4 10.4 7.4 7 11.5 7h1c4.1 0 7.5 3.4 7.5 7.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="8" cy="14.5" r="1.5" fill="currentColor" />
          <circle cx="16" cy="14.5" r="1.5" fill="currentColor" />
          <path d="M10 11.2h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </div>
      {showText && <span className={cn("font-display-landing text-base font-bold tracking-tight", textClassName)}>CallFlow</span>}
    </div>
  );
};

export default BrandLogo;
