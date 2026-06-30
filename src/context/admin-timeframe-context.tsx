"use client";

import React, { createContext, useContext, useState } from "react";

export type Timeframe = "24h" | "2d" | "3d" | "5d" | "10d" | "15d" | "1m" | "2m" | "3m";

type TimeframeContextType = {
  timeframe: Timeframe;
  setTimeframe: (t: Timeframe) => void;
  getDaysCount: () => number;
};

const TimeframeContext = createContext<TimeframeContextType | undefined>(undefined);

export const timeframeOptions: { value: Timeframe; label: string }[] = [
  { value: "24h", label: "Last 24 Hours" },
  { value: "2d", label: "Last 2 Days" },
  { value: "3d", label: "Last 3 Days" },
  { value: "5d", label: "Last 5 Days" },
  { value: "10d", label: "Last 10 Days" },
  { value: "15d", label: "Last 15 Days" },
  { value: "1m", label: "Last 1 Month" },
  { value: "2m", label: "Last 2 Months" },
  { value: "3m", label: "Last 3 Months" },
];

export function TimeframeProvider({ children }: { children: React.ReactNode }) {
  const [timeframe, setTimeframe] = useState<Timeframe>("24h");

  const getDaysCount = () => {
    switch (timeframe) {
      case "24h": return 1;
      case "2d": return 2;
      case "3d": return 3;
      case "5d": return 5;
      case "10d": return 10;
      case "15d": return 15;
      case "1m": return 30;
      case "2m": return 60;
      case "3m": return 90;
      default: return 1;
    }
  };

  return (
    <TimeframeContext.Provider value={{ timeframe, setTimeframe, getDaysCount }}>
      {children}
    </TimeframeContext.Provider>
  );
}

export function useTimeframe() {
  const context = useContext(TimeframeContext);
  if (!context) {
    throw new Error("useTimeframe must be used inside a TimeframeProvider");
  }
  return context;
}
