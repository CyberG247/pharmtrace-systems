import { QueryClient } from "@tanstack/react-query";
import { createRouter, rootRouteId } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";

import { routeTree } from "@/routeTree.gen";

describe("App routing", () => {
  const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });

  it("matches a page for / instead of falling back to not found", () => {
    const matches = router.matchRoutes("/");
    expect(matches.at(-1)?.routeId).not.toBe(rootRouteId);
  });

  it("matches the manufacturer compliance dashboard at /dashboard/manufacturer", () => {
    const matches = router.matchRoutes("/dashboard/manufacturer");
    expect(matches.at(-1)?.routeId).not.toBe(rootRouteId);
  });

  it("matches the pharmacy verification & B2B portal at /dashboard/pharmacy", () => {
    const matches = router.matchRoutes("/dashboard/pharmacy");
    expect(matches.at(-1)?.routeId).not.toBe(rootRouteId);
  });

  it("matches the regulatory auditor console at /dashboard/regulator", () => {
    const matches = router.matchRoutes("/dashboard/regulator");
    expect(matches.at(-1)?.routeId).not.toBe(rootRouteId);
  });

  it("matches the super admin console at /dashboard/admin", () => {
    const matches = router.matchRoutes("/dashboard/admin");
    expect(matches.at(-1)?.routeId).not.toBe(rootRouteId);
  });
});
