import type { Metadata } from "next";

import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: { default: "Dashboard", template: "%s · VES Dashboard" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="min-h-dvh bg-paper">
      {children}
      <Toaster position="bottom-right" closeButton />
    </div>
  );
}
