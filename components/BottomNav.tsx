"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Ticket, MapPin, User, LayoutDashboard } from "lucide-react";

const TABS = [
  { href: "/explore",   label: "Explore",    icon: Compass         },
  { href: "/shows",     label: "Shows",      icon: Ticket          },
  { href: "/dashboard", label: "Dashboard",  icon: LayoutDashboard },
  { href: "/cities",    label: "Cities",     icon: MapPin          },
  { href: "/profile",   label: "Profile",    icon: User            },
];

export default function BottomNav() {
  const pathname = usePathname();

  // Only show on inner-app pages
  if (pathname === "/" || pathname === "/login" || pathname === "/onboarding") return null;

  return (
    <>
      {/* Spacer so page content isn't hidden behind the fixed bar */}
      <div className="sm:hidden h-[72px]" aria-hidden="true" />

      <nav className="fixed bottom-0 left-0 right-0 z-50 sm:hidden">
        <div
          className="border-t border-white/8 px-4 pt-2"
          style={{
            background: "oklch(0.115 0 0 / 0.96)",
            backdropFilter: "blur(20px)",
            paddingBottom: "calc(0.5rem + env(safe-area-inset-bottom))",
          }}
        >
          <div className="flex items-center justify-around">
            {TABS.map(({ href, label, icon: Icon }) => {
              const isActive = pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className="flex flex-col items-center gap-1 px-2 py-1 rounded-xl transition-all"
                  aria-current={isActive ? "page" : undefined}
                >
                  <div className={`w-6 h-6 flex items-center justify-center transition-all ${isActive ? "scale-110" : ""}`}>
                    <Icon
                      className={`w-5 h-5 transition-colors ${isActive ? "text-primary" : "text-muted-foreground"}`}
                      strokeWidth={isActive ? 2.5 : 1.8}
                      aria-hidden="true"
                    />
                  </div>
                  <span className={`text-xs font-medium transition-colors ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                    {label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
}
