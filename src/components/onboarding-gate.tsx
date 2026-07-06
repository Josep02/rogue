"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useRogue } from "@/lib/store/rogue-store";

/** Si el usuario no ha completado el onboarding, lo lleva alli. */
export function OnboardingGate() {
  const { hydrated, profile } = useRogue();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!hydrated) return;
    if (!profile.onboarded && pathname !== "/onboarding") {
      router.replace("/onboarding");
    }
  }, [hydrated, profile.onboarded, pathname, router]);

  return null;
}
