import type { Metadata } from "next";

import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: { default: "Internship Portal", template: "%s · VES Internship Portal" },
  robots: { index: false, follow: false },
};

export default function PortalLayout({ children }: LayoutProps<"/portal">) {
  return (
    <div className="min-h-dvh bg-paper">
      {children}
      <Toaster position="bottom-right" closeButton />
    </div>
  );
}
