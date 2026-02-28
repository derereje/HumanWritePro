"use client";

import Link from "next/link";
import { Button } from "~/components/ui/button";
import { MoveLeft, Home, FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white/[0.02] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md text-center space-y-8 animate-in fade-in zoom-in duration-500">

        {/* Visual Element */}
        <div className="relative mx-auto w-32 h-32">
          <div className="absolute inset-0 bg-blue-100/50 rounded-full animate-pulse"></div>
          <div className="absolute inset-4 bg-card rounded-full shadow-xl border border-blue-50 flex items-center justify-center">
            <FileQuestion className="w-12 h-12 text-blue-500" strokeWidth={1.5} />
          </div>

          {/* Decorative dots */}
          <div className="absolute top-0 right-0 w-3 h-3 bg-emerald-400 rounded-full animate-bounce delay-100"></div>
          <div className="absolute bottom-2 left-2 w-2 h-2 bg-emerald-300 rounded-full animate-bounce delay-300"></div>
        </div>

        {/* Text */}
        <div className="space-y-3">
          <h1 className="text-4xl font-bold tracking-tight text-white">Page Not Found</h1>
          <p className="text-slate-400 text-lg">
            We searched everywhere but couldn't find the page you're looking for.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Button
            variant="outline"
            size="lg"
            onClick={() => window.history.back()}
            className="rounded-full border-white/10 hover:bg-white/[0.04] hover:text-white gap-2"
          >
            <MoveLeft className="w-4 h-4" />
            Go Back
          </Button>

          <Link href="/">
            <Button
              size="lg"
              className="w-full sm:w-auto rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-black/50 shadow-blue-500/20 gap-2"
            >
              <Home className="w-4 h-4" />
              Back to Home
            </Button>
          </Link>
        </div>

        <div className="text-xs font-mono text-slate-300 uppercase tracking-widest pt-8">
          Error 404
        </div>
      </div>
    </div>
  );
}
