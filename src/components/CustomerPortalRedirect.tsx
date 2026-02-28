"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function CustomerPortalRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Note: Polar customer portal integration needs to be updated for Clerk
    // This is a placeholder - redirect to pricing for now
    router.push("/dashboard");
  }, [router]);

  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
        <p className="text-muted-foreground text-sm">
          Redirecting...
        </p>
      </div>
    </div>
  );
}