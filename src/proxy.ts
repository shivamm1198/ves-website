import type { NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

// Only the dashboards need a session; public pages stay fully static.
export const config = {
  matcher: ["/admin/:path*", "/portal/:path*", "/auth/:path*"],
};
