"use client";

import * as React from "react";

const units: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 31536000],
  ["month", 2592000],
  ["week", 604800],
  ["day", 86400],
  ["hour", 3600],
  ["minute", 60],
];

const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

function format(date: string, now: number) {
  const seconds = (new Date(date).getTime() - now) / 1000;
  for (const [unit, size] of units) {
    if (Math.abs(seconds) >= size) return rtf.format(Math.round(seconds / size), unit);
  }
  return "just now";
}

// A clock that ticks once a minute; null on the server so hydration matches.
function subscribe(onTick: () => void) {
  const id = window.setInterval(onTick, 30_000);
  return () => window.clearInterval(id);
}
const getMinute = () => Math.floor(Date.now() / 60_000);
const getServerMinute = () => null;

/** "3 minutes ago", computed in the browser. */
export function RelativeTime({ date }: { date: string }) {
  const minute = React.useSyncExternalStore(subscribe, getMinute, getServerMinute);
  return (
    <time dateTime={date}>{minute === null ? "recently" : format(date, minute * 60_000)}</time>
  );
}
