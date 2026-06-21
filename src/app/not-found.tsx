import Link from "next/link";
import Logo from "@/components/Logo";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="text-center">
        <div className="mb-8 flex justify-center">
          <Logo size="md" href="/" />
        </div>
        <h1 className="text-6xl font-bold text-primary/30">404</h1>
        <h2 className="mt-4 text-2xl font-bold">Page not found</h2>
        <p className="mt-2 text-muted">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-xl bg-primary px-5 py-2.5 font-medium text-white shadow-sm transition-all hover:bg-primary-hover hover:shadow-md"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
