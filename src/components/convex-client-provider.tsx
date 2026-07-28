"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { useMemo } from "react";

const BUILD_SAFE_CONVEX_URL = "https://deckactive-build-placeholder.convex.cloud";

export function ConvexClientProvider({ children }: { children: React.ReactNode }) {
  const client = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_CONVEX_URL;
    return new ConvexReactClient(url || BUILD_SAFE_CONVEX_URL);
  }, []);

  return <ConvexProvider client={client}>{children}</ConvexProvider>;
}
