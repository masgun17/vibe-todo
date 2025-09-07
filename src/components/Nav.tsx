"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Nav() {
  const pathname = usePathname();
  const items = [
    { href: "/", label: "Today", isActive: (p: string) => p === "/" },
    { href: "/log", label: "Log", isActive: (p: string) => p.startsWith("/log") },
    { href: "/calendar", label: "Calendar", isActive: (p: string) => p.startsWith("/calendar") },
  ];
  return (
    <nav className="mx-auto max-w-4xl h-14 flex items-center gap-4 px-4">
      {items.map((item) => {
        const active = item.isActive(pathname);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={active ? "font-semibold" : "text-sm"}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

