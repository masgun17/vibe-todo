"use client";
import { useRouter, usePathname } from "next/navigation";

export default function BackButton() {
  const router = useRouter();
  const pathname = usePathname();
  const isHome = pathname === "/";
  return (
    <button
      onClick={() => !isHome && router.back()}
      aria-label="Go back"
      aria-hidden={isHome || undefined}
      tabIndex={isHome ? -1 : 0}
      className={
        "ml-2 mr-2 inline-flex h-8 w-8 items-center justify-center rounded " +
        (isHome ? "invisible" : "hover:bg-black/5 dark:hover:bg-white/10")
      }
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-5 w-5"
        aria-hidden
      >
        <path fillRule="evenodd" d="M10.53 3.47a.75.75 0 010 1.06L5.81 9.25H20a.75.75 0 010 1.5H5.81l4.72 4.72a.75.75 0 11-1.06 1.06l-6-6a.75.75 0 010-1.06l6-6a.75.75 0 011.06 0z" clipRule="evenodd" />
      </svg>
    </button>
  );
}

