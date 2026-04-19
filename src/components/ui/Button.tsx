import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "ghost" | "muted";
type Size = "sm" | "md";

const BASE =
  "inline-flex items-center justify-center gap-2 font-sans font-medium whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cobalt disabled:cursor-not-allowed disabled:opacity-50";

const SIZES: Record<Size, string> = {
  sm: "h-8 px-3 text-[13px] rounded-[var(--radius-brand-sm)]",
  md: "h-10 px-5 text-[14px] rounded-[var(--radius-brand-sm)]",
};

const VARIANTS: Record<Variant, string> = {
  primary: "bg-cobalt text-white hover:bg-cobalt-mid",
  ghost:
    "bg-transparent text-cobalt border-[1.5px] border-cobalt hover:bg-cobalt-pale",
  muted:
    "bg-transparent text-mid-gray border-[1.5px] border-hairline hover:border-light-gray",
};

type CommonProps = {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
};

type ButtonAsButton = CommonProps &
  Omit<ComponentProps<"button">, keyof CommonProps | "href"> & {
    href?: never;
  };

type ButtonAsLink = CommonProps &
  Omit<ComponentProps<typeof Link>, keyof CommonProps> & {
    href: string;
  };

type ButtonProps = ButtonAsButton | ButtonAsLink;

export function Button(props: ButtonProps) {
  const {
    children,
    variant = "primary",
    size = "md",
    className = "",
  } = props;

  const classes = `${BASE} ${SIZES[size]} ${VARIANTS[variant]} ${className}`;

  if ("href" in props && props.href !== undefined) {
    const { href, variant: _v, size: _s, className: _c, ...rest } = props;
    return (
      <Link href={href} className={classes} {...rest}>
        {children}
      </Link>
    );
  }

  const { variant: _v, size: _s, className: _c, ...rest } =
    props as ButtonAsButton;
  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}
