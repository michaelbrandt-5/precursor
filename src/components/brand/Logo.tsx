import Link from "next/link";

type Variant = "cobalt" | "white" | "ink";
type Size = "sm" | "md" | "lg";

const SIZE_MAP: Record<Size, { height: string; gap: string; text: string }> = {
  sm: { height: "h-5", gap: "gap-2", text: "text-[14px]" },
  md: { height: "h-7", gap: "gap-3", text: "text-[18px]" },
  lg: { height: "h-10", gap: "gap-4", text: "text-[24px]" },
};

const FILL: Record<Variant, string> = {
  cobalt: "#1D4ED8",
  white: "#FFFFFF",
  ink: "#0A0A0A",
};

const TEXT: Record<Variant, string> = {
  cobalt: "text-ink",
  white: "text-white",
  ink: "text-ink",
};

export function LogoMark({
  variant = "cobalt",
  size = "md",
  className = "",
}: {
  variant?: Variant;
  size?: Size;
  className?: string;
}) {
  const fill = FILL[variant];
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 48"
      fill="none"
      aria-hidden="true"
      className={`${SIZE_MAP[size].height} w-auto ${className}`}
    >
      <rect x="0" y="0" width="32" height="5" rx="0.5" fill={fill} />
      <rect x="13" y="5" width="6" height="38" fill={fill} />
      <rect x="0" y="43" width="32" height="5" rx="0.5" fill={fill} />
    </svg>
  );
}

export function Logo({
  variant = "cobalt",
  size = "md",
  href = "/",
  showWordmark = true,
  className = "",
}: {
  variant?: Variant;
  size?: Size;
  href?: string | null;
  showWordmark?: boolean;
  className?: string;
}) {
  const content = (
    <span
      className={`inline-flex items-center ${SIZE_MAP[size].gap} ${className}`}
    >
      <LogoMark variant={variant} size={size} />
      {showWordmark && (
        <span
          className={`${SIZE_MAP[size].text} ${TEXT[variant]} font-sans font-light tracking-tight`}
        >
          Precursor
        </span>
      )}
    </span>
  );

  if (href === null) return content;

  return (
    <Link
      href={href}
      className="inline-flex items-center no-underline"
      aria-label="Precursor home"
    >
      {content}
    </Link>
  );
}
