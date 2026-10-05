"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowUpRight, Briefcase, LayoutGrid, LogOut, Menu, PenSquare } from "lucide-react";

import { cn } from "@/lib/utils";
import { portalSignOut } from "@/lib/portal/auth-actions";
import type { Access } from "@/lib/portal/types";
import { BrandMark } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export type SidebarProgram = { id: string; title: string; access: Access };

type Props = {
  email: string;
  logo: string;
  isPresident: boolean;
  programs: SidebarProgram[];
};

const roleLabel: Record<Access, string> = {
  president: "",
  admin: "Coordinator",
  intern: "Intern",
};

export function PortalSidebar(props: Props) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between border-b bg-ink px-4 py-3 text-white lg:hidden">
        <Link href="/portal" className="flex items-center gap-2.5">
          <BrandMark logo={props.logo} name="Organisation" inverse className="size-8" />
          <span className="font-serif text-lg">Internship Portal</span>
        </Link>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10 hover:text-white"
              aria-label="Open menu"
            >
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 border-0 bg-ink p-0 text-white">
            <SheetTitle className="sr-only">Portal menu</SheetTitle>
            <SidebarBody {...props} onNavigate={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
      </header>

      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 bg-ink text-white lg:block">
        <SidebarBody {...props} />
      </aside>
    </>
  );
}

function NavLink({
  href,
  active,
  onNavigate,
  children,
}: {
  href: string;
  active: boolean;
  onNavigate?: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors",
        active ? "text-white" : "text-white/55 hover:bg-white/5 hover:text-white",
      )}
    >
      {active && (
        <motion.span
          layoutId="portal-nav"
          className="absolute inset-0 rounded-md bg-white/10"
          transition={{ type: "spring", stiffness: 400, damping: 36 }}
        />
      )}
      {active && <span className="absolute top-2 bottom-2 left-0 w-[2px] rounded gold-gradient" />}
      {children}
    </Link>
  );
}

function SidebarBody({
  email,
  logo,
  isPresident,
  programs,
  onNavigate,
}: Props & { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      <div className="h-[3px] gold-gradient" />
      <Link href="/portal" onClick={onNavigate} className="flex items-center gap-3 px-6 pt-7 pb-8">
        <BrandMark logo={logo} name="Organisation" inverse />
        <span className="leading-tight">
          <span className="block font-serif text-xl">Vidhi Ekta Sangh</span>
          <span className="text-[11px] tracking-[0.2em] text-gold-light uppercase">
            Internship portal
          </span>
        </span>
      </Link>

      <nav aria-label="Portal" className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-3">
        <NavLink href="/portal" active={pathname === "/portal"} onNavigate={onNavigate}>
          <LayoutGrid
            className={cn("relative size-4", pathname === "/portal" && "text-gold-light")}
          />
          <span className="relative">{isPresident ? "All internships" : "My internships"}</span>
        </NavLink>

        {programs.length > 0 && (
          <p className="mt-5 mb-1 px-3 text-[10px] font-semibold tracking-[0.22em] text-white/35 uppercase">
            Internships
          </p>
        )}
        {programs.map((p) => {
          const href = `/portal/programs/${p.id}`;
          const active = pathname.startsWith(href);
          return (
            <NavLink key={p.id} href={href} active={active} onNavigate={onNavigate}>
              <Briefcase className={cn("relative size-4 shrink-0", active && "text-gold-light")} />
              <span className="relative min-w-0">
                <span className="block truncate">{p.title}</span>
                {roleLabel[p.access] && (
                  <span className="block text-[11px] text-white/40">{roleLabel[p.access]}</span>
                )}
              </span>
            </NavLink>
          );
        })}
      </nav>

      <div className="flex flex-col gap-1 border-t border-white/10 p-3">
        {isPresident && (
          <Link
            href="/admin"
            className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-white/55 transition-colors hover:bg-white/5 hover:text-white"
          >
            <PenSquare className="size-4" /> Website dashboard
          </Link>
        )}
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-white/55 transition-colors hover:bg-white/5 hover:text-white"
        >
          <ArrowUpRight className="size-4" /> View website
        </a>
        <form action={portalSignOut}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm text-white/55 transition-colors hover:bg-white/5 hover:text-white"
          >
            <LogOut className="size-4" /> Sign out
          </button>
        </form>
        <p className="truncate px-3 pt-2 text-xs text-white/35" title={email}>
          {email}
        </p>
      </div>
    </div>
  );
}
