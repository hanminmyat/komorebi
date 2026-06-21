import Link from "next/link";

interface LogoProps {
  /** Size variant: "sm" for headers, "md" for auth pages, "lg" for hero */
  size?: "sm" | "md" | "lg";
  /** Wrap in a link to home */
  href?: string;
  /** Show the text label alongside the icon */
  showText?: boolean;
}

const sizes = {
  sm: { icon: 24, text: "text-lg font-semibold tracking-tight" },
  md: { icon: 32, text: "text-2xl font-bold tracking-tight" },
  lg: { icon: 40, text: "text-3xl font-bold tracking-tight" },
};

export default function Logo({ size = "sm", href, showText = true }: LogoProps) {
  const s = sizes[size];

  const icon = (
    <svg
      width={s.icon}
      height={s.icon}
      viewBox="0 0 28 28"
      fill="none"
      className="text-primary shrink-0"
    >
      <circle cx="14" cy="14" r="12" stroke="currentColor" strokeWidth="2" />
      <path
        d="M14 6C14 6 8 12 8 16C8 19.3 10.7 22 14 22C17.3 22 20 19.3 20 16C20 12 14 6 14 6Z"
        fill="currentColor"
        opacity="0.3"
      />
      <path
        d="M14 8C14 8 10 13 10 16C10 18.2 11.8 20 14 20C16.2 20 18 18.2 18 16C18 13 14 8 14 8Z"
        fill="currentColor"
        opacity="0.6"
      />
    </svg>
  );

  const content = (
    <div className="flex items-center gap-2">
      {icon}
      {showText && <span className={s.text}>Komorebi</span>}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="transition-opacity hover:opacity-80">
        {content}
      </Link>
    );
  }

  return content;
}
