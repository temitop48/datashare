"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type TopNavProps = {
  brand: string;
  items: Array<{
    href: string;
    label: string;
  }>;
};

export default function TopNav({ brand, items }: TopNavProps) {
  const pathname = usePathname();

  return (
    <div className="ds-topbar">
      <div className="ds-brandline">
        <span className="ds-brand-dot" />
        {brand}
      </div>

      <nav className="ds-topnav">
        {items.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              className={`ds-link-button ${isActive ? "ds-link-active" : ""}`}
              href={item.href}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}