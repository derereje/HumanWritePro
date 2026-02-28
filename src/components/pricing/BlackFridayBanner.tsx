"use client";

import { useEffect, useState } from "react";
import { Zap } from "lucide-react";

export default function BlackFridayBanner() {
  // Fixed universal end date: December 1st, 2025 at 13:00:00 UTC
  // This ensures the countdown is the same for everyone and persists across refreshes
  const TARGET_DATE = new Date("2025-12-01T13:00:00Z").getTime();

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const difference = TARGET_DATE - now;

      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        };
      } else {
        // Timer expired
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }
    };

    // Initial calculation
    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative mb-12 overflow-hidden rounded-3xl bg-black p-8 text-white shadow-2xl">
      {/* Background Effects */}
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-purple-600/30 blur-3xl" />
      <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-blue-600/30 blur-3xl" />
      
      <div className="relative z-10 flex flex-col items-center justify-between gap-8 md:flex-row">
        <div className="flex-1 text-center md:text-left">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-1 text-sm font-bold uppercase tracking-wider text-white shadow-xl shadow-black/50">
            <Zap className="h-4 w-4 fill-current" />
            Black Friday Deal
          </div>
          <h2 className="mt-4 text-4xl font-black tracking-tight md:text-6xl">
            <span className="bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
              GET 50% OFF
            </span>
          </h2>
          <p className="mt-2 text-lg text-gray-300">
            Unlock unlimited humanization power at half the price. Limited time offer.
          </p>
        </div>

        <div className="flex gap-4">
          <div className="flex flex-col items-center rounded-xl bg-white/10 p-4 backdrop-blur-sm">
            <span className="text-3xl font-bold md:text-4xl">{String(timeLeft.days).padStart(2, '0')}</span>
            <span className="text-xs uppercase tracking-wider text-gray-400">Days</span>
          </div>
          <div className="flex flex-col items-center rounded-xl bg-white/10 p-4 backdrop-blur-sm">
            <span className="text-3xl font-bold md:text-4xl">{String(timeLeft.hours).padStart(2, '0')}</span>
            <span className="text-xs uppercase tracking-wider text-gray-400">Hours</span>
          </div>
          <div className="flex flex-col items-center rounded-xl bg-white/10 p-4 backdrop-blur-sm">
            <span className="text-3xl font-bold md:text-4xl">{String(timeLeft.minutes).padStart(2, '0')}</span>
            <span className="text-xs uppercase tracking-wider text-gray-400">Mins</span>
          </div>
          <div className="flex flex-col items-center rounded-xl bg-white/10 p-4 backdrop-blur-sm">
            <span className="text-3xl font-bold md:text-4xl">{String(timeLeft.seconds).padStart(2, '0')}</span>
            <span className="text-xs uppercase tracking-wider text-gray-400">Secs</span>
          </div>
        </div>
      </div>
    </div>
  );
}
