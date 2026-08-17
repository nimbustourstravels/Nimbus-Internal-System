"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard", label: "My Dashboard" },
  { href: "/clients", label: "Client Management" },
  { href: "/visa", label: "Visa" },
  { href: "/tickets", label: "Tickets" },
  { href: "/intake", label: "Document Intake" },
  { href: "/tasks", label: "Tasks & Messages" },
  { href: "/templates", label: "Email & Doc Templates" },
  { href: "/team", label: "Team" },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex w-56 shrink-0 flex-col gap-1 border-r border-neutral-200 bg-white p-4">
      {links.map((link) => {
        const active = pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-md px-3 py-2 text-sm font-medium ${
              active
                ? "bg-neutral-900 text-white"
                : "text-neutral-600 hover:bg-neutral-100"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
