"use client";

import { useCallback, useEffect, useState } from "react";
import Navbar from "@/components/ui/Navbar";
import TransactionIcon from "@/components/ui/TransactionIcon";
import AddTransactionPanel from "@/components/ui/AddTransactionPanel";
import Amount from "@/components/ui/Amount";
import { getCalendarMonth } from "@/app/data";
import type { TxnView } from "@/lib/types";

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const dayNames = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
const dayFullNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function firstWeekdayMondayBased(year: number, month: number) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

export default function CalendarPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedDay, setSelectedDay] = useState(now.getDate());
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [byDay, setByDay] = useState<Record<number, TxnView[]>>({});
  const [netByDay, setNetByDay] = useState<Record<number, number>>({});

  const load = useCallback(async () => {
    const res = await getCalendarMonth(year, month);
    if (res.ok) {
      setByDay(res.byDay);
      setNetByDay(res.netByDay);
    }
  }, [year, month]);

  useEffect(() => { load(); }, [load]);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = firstWeekdayMondayBased(year, month);
  const prevMonthDays = new Date(year, month, 0).getDate();
  const prevDays = Array.from({ length: firstDay }, (_, i) => prevMonthDays - firstDay + 1 + i);
  const currentDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;
  const nextDays = Array.from({ length: totalCells - firstDay - daysInMonth }, (_, i) => i + 1);

  const selectedTxns = byDay[selectedDay] ?? [];
  const dayTotal = netByDay[selectedDay] ?? 0;
  const selectedDate = new Date(year, month, selectedDay);

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(year - 1); } else setMonth(month - 1);
    setSelectedDay(1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(year + 1); } else setMonth(month + 1);
    setSelectedDay(1);
  };
  const goToday = () => { setYear(now.getFullYear()); setMonth(now.getMonth()); setSelectedDay(now.getDate()); };

  return (
    <div className="min-h-screen bg-canvas">
      <Navbar
        rightContent={
          <button
            onClick={() => setIsPanelOpen(true)}
            className="hidden items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-contrast shadow-card transition-all duration-150 hover:bg-accent-hover active:scale-[0.98] sm:inline-flex"
          >
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
              <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            Add
          </button>
        }
      />

      <main className="mx-auto max-w-content px-6 py-8 md:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-ink">
              {monthNames[month]} <span className="font-normal text-muted">{year}</span>
            </h1>
            <div className="ml-4 flex items-center gap-1">
              <button onClick={prevMonth} className="grid h-8 w-8 place-items-center rounded-lg border border-rule text-muted transition-colors hover:border-ink hover:text-ink">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 3L5 7L9 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
              <button onClick={nextMonth} className="grid h-8 w-8 place-items-center rounded-lg border border-rule text-muted transition-colors hover:border-ink hover:text-ink">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 3L9 7L5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            </div>
            <button onClick={goToday} className="ml-2 rounded-lg border border-rule bg-paper px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-canvas">Today</button>
          </div>
        </div>

        <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
          {/* Calendar grid */}
          <div className="flex-1 overflow-hidden rounded-2xl border border-rule bg-paper shadow-card">
            <div className="grid grid-cols-7 border-b border-rule bg-canvas/40">
              {dayNames.map((d) => (
                <div key={d} className="px-4 py-3 text-xs font-medium uppercase tracking-widest text-muted">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {prevDays.map((day, i) => (
                <div key={`p-${i}`} className="min-h-[100px] border-b border-r border-rule p-3 text-sm text-muted/30">{day}</div>
              ))}
              {currentDays.map((day) => {
                const net = netByDay[day];
                const isSelected = day === selectedDay;
                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`flex min-h-[100px] flex-col justify-between border-b border-r border-rule p-3 text-left transition-colors ${isSelected ? "bg-canvas ring-1 ring-inset ring-accent/40" : "hover:bg-canvas/50"}`}
                  >
                    <span className={`text-sm ${isSelected ? "font-semibold text-ink" : "text-ink"}`}>{day}</span>
                    {net !== undefined && net !== 0 && (
                      <span className="mt-2 text-right"><Amount value={net} showSign className="block text-[11px] font-medium" /></span>
                    )}
                  </button>
                );
              })}
              {nextDays.map((day, i) => (
                <div key={`n-${i}`} className="min-h-[100px] border-b border-r border-rule p-3 text-sm text-muted/30">{day}</div>
              ))}
            </div>
          </div>

          {/* Day detail */}
          <div className="w-full flex-shrink-0 rounded-2xl border border-rule bg-paper p-8 shadow-card lg:w-[380px]">
            <p className="mb-1 text-sm text-muted">{dayFullNames[selectedDate.getDay()]}</p>
            <h3 className="mb-8 text-2xl font-semibold text-ink">{selectedDay} {monthNames[month]}</h3>

            <p className="mb-2 text-[11px] font-medium uppercase tracking-widest text-muted">Net for the day</p>
            <Amount value={dayTotal} showSign className="mb-8 block text-3xl font-medium tracking-tight" />

            <p className="mb-4 text-[11px] font-medium uppercase tracking-widest text-muted">Transactions</p>
            {selectedTxns.length > 0 ? (
              <div className="divide-y divide-rule">
                {selectedTxns.map((tx) => (
                  <div key={tx.id} className="flex items-center gap-4 py-4">
                    <TransactionIcon amount={tx.signedRupees} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink">{tx.description}</p>
                      {tx.category && <p className="mt-0.5 text-[13px] text-muted">{tx.category}</p>}
                    </div>
                    <Amount value={tx.signedRupees} showSign className="flex-shrink-0 text-sm font-medium" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-4">
                <p className="text-sm text-muted">No transactions for this day.</p>
                <button onClick={() => setIsPanelOpen(true)} className="mt-3 text-sm font-semibold text-accent hover:text-accent-hover">
                  Add one →
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <AddTransactionPanel isOpen={isPanelOpen} onClose={() => setIsPanelOpen(false)} onSaved={load} />
    </div>
  );
}
