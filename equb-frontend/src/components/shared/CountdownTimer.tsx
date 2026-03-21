import React, { useState, useEffect } from "react";

export default function CountdownTimer({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculate = () => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const diff = Math.max(0, target - now);
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };
    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const units = [
    { label: "Days", value: timeLeft.days },
    { label: "Hours", value: timeLeft.hours },
    { label: "Min", value: timeLeft.minutes },
    { label: "Sec", value: timeLeft.seconds },
  ];

  return (
    <div className="flex gap-2">
      {units.map((unit) => (
        <div key={unit.label} className="flex flex-col items-center">
          <div className="w-14 h-14 rounded-xl bg-muted/50 border border-border/50 flex items-center justify-center">
            <span className="text-xl font-bold tabular-nums">
              {String(unit.value).padStart(2, "0")}
            </span>
          </div>
          <span className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">
            {unit.label}
          </span>
        </div>
      ))}
    </div>
  );
}
