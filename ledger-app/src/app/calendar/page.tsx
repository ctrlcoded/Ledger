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
const monthShort = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const dayNames = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
const dayNamesShort = ["M", "T", "W", "T", "F", "S", "S"];
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
  const [showDetail, setShowDetail] = useState(false);

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

  const handleDayClick = (day: number) => {
    setSelectedDay(day);
    setShowDetail(true);
  };

  return (
    <div className="min-h-screen bg-canvas">
      <Navbar
        rightContent={
          <button
            onClick={() => setIsPanelOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-accent-contrast shadow-card transition-all duration-150 hover:bg-accent-hover active:scale-[0.98] sm:px-4"
          >
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
              <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            <span className="hidden sm:inline">Add</span>
          </button>
        }
      />

      <main className="mx-auto max-w-content px-4 py-6 sm:px-6 sm:py-8 md:px-8">
        {/* Header with month navigation */}
        <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1 sm:gap-2">
              <select
                value={month}
                onChange={(e) => {
                  setMonth(Number(e.target.value));
                  setSelectedDay(1);
                }}
                className="appearance-none bg-transparent text-xl font-semibold text-ink sm:text-2xl focus:outline-none cursor-pointer hover:text-accent transition-colors"
                aria-label="Select month"
              >
                {monthNames.map((m, i) => (
                  <option key={m} value={i}>{m}</option>
                ))}
              </select>
              <select
                value={year}
                onChange={(e) => {
                  setYear(Number(e.target.value));
                  setSelectedDay(1);
                }}
                className="appearance-none bg-transparent text-xl font-normal text-muted sm:text-2xl focus:outline-none cursor-pointer hover:text-ink transition-colors"
                aria-label="Select year"
              >
                {Array.from({ length: 11 }, (_, i) => now.getFullYear() - 5 + i).map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <div className="ml-2 flex items-center gap-1 sm:ml-4">
              <button onClick={prevMonth} className="grid h-8 w-8 place-items-center rounded-lg border border-rule text-muted transition-colors hover:border-ink hover:text-ink">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 3L5 7L9 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
              <button onClick={nextMonth} className="grid h-8 w-8 place-items-center rounded-lg border border-rule text-muted transition-colors hover:border-ink hover:text-ink">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 3L9 7L5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            </div>
          </div>
          <button onClick={goToday} className="self-start rounded-lg border border-rule bg-paper px-3 py-1.5 text-sm font-medium text-ink transition-colors hover:bg-canvas sm:self-auto sm:px-4 sm:py-2">Today</button>
        </div>

        <div className="flex flex-col gap-4 sm:gap-8 lg:flex-row lg:items-start">
          {/* Calendar grid */}
          <div className="flex-1 overflow-hidden rounded-2xl border border-rule bg-paper shadow-card">
            {/* Day names header */}
            <div className="grid grid-cols-7 border-b border-rule bg-canvas/40">
              {dayNames.map((d, i) => (
                <div key={d} className="px-1 py-2 text-center text-[10px] font-medium uppercase tracking-wider text-muted sm:px-4 sm:py-3 sm:text-left sm:text-xs sm:tracking-widest">
                  <span className="hidden sm:inline">{d}</span>
                  <span className="sm:hidden">{dayNamesShort[i]}</span>
                </div>
              ))}
            </div>
            {/* Day cells */}
            <div className="grid grid-cols-7">
              {prevDays.map((day, i) => (
                <div key={`p-${i}`} className="min-h-[48px] border-b border-r border-rule p-1.5 text-center text-xs text-muted/30 sm:min-h-[100px] sm:p-3 sm:text-left sm:text-sm">{day}</div>
              ))}
              {currentDays.map((day) => {
                const net = netByDay[day];
                const isSelected = day === selectedDay;
                return (
                  <button
                    key={day}
                    onClick={() => handleDayClick(day)}
                    className={`flex min-h-[48px] flex-col items-center justify-center border-b border-r border-rule p-1 text-center transition-colors sm:min-h-[100px] sm:items-stretch sm:justify-between sm:p-3 sm:text-left ${isSelected ? "bg-canvas ring-1 ring-inset ring-accent/40" : "hover:bg-canvas/50"}`}
                  >
                    <span className={`text-xs sm:text-sm ${isSelected ? "font-semibold text-ink" : "text-ink"}`}>{day}</span>
                    {net !== undefined && net !== 0 && (
                      <span className="mt-0.5 sm:mt-2 sm:text-right">
                        {/* On mobile, just show a dot indicator instead of amount */}
                        <span className="sm:hidden">
                          <span className={`inline-block h-1.5 w-1.5 rounded-full ${net > 0 ? "bg-credit" : "bg-debit"}`} />
                        </span>
                        <span className="hidden sm:block">
                          <Amount value={net} showSign className="block text-[11px] font-medium" />
                        </span>
                      </span>
                    )}
                  </button>
                );
              })}
              {nextDays.map((day, i) => (
                <div key={`n-${i}`} className="min-h-[48px] border-b border-r border-rule p-1.5 text-center text-xs text-muted/30 sm:min-h-[100px] sm:p-3 sm:text-left sm:text-sm">{day}</div>
              ))}
            </div>
          </div>

          {/* Day detail — visible on desktop always, modal-like on mobile */}
          {/* Desktop sidebar */}
          <div className="hidden w-full flex-shrink-0 rounded-2xl border border-rule bg-paper p-6 shadow-card sm:p-8 lg:block lg:w-[380px]">
            <DayDetail
              day={selectedDay}
              month={month}
              selectedDate={selectedDate}
              dayTotal={dayTotal}
              selectedTxns={selectedTxns}
              onAddTransaction={() => setIsPanelOpen(true)}
            />
          </div>

          {/* Mobile bottom sheet */}
          {showDetail && (
            <div className="fixed inset-0 z-50 flex items-end lg:hidden">
              <div className="absolute inset-0 bg-ink/20 backdrop-blur-sm" onClick={() => setShowDetail(false)} />
              <div className="relative w-full max-h-[70vh] overflow-y-auto rounded-t-3xl border-t border-rule bg-paper p-5 shadow-panel sm:p-7">
                <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-rule-strong" />
                <DayDetail
                  day={selectedDay}
                  month={month}
                  selectedDate={selectedDate}
                  dayTotal={dayTotal}
                  selectedTxns={selectedTxns}
                  onAddTransaction={() => { setShowDetail(false); setIsPanelOpen(true); }}
                />
              </div>
            </div>
          )}
        </div>
      </main>

      <AddTransactionPanel isOpen={isPanelOpen} onClose={() => setIsPanelOpen(false)} onSaved={load} />
    </div>
  );
}

function DayDetail({
  day,
  month,
  selectedDate,
  dayTotal,
  selectedTxns,
  onAddTransaction,
}: {
  day: number;
  month: number;
  selectedDate: Date;
  dayTotal: number;
  selectedTxns: TxnView[];
  onAddTransaction: () => void;
}) {
  return (
    <>
      <p className="mb-1 text-sm text-muted">{dayFullNames[selectedDate.getDay()]}</p>
      <h3 className="mb-6 text-xl font-semibold text-ink sm:mb-8 sm:text-2xl">{day} {monthNames[month]}</h3>

      <p className="mb-2 text-[11px] font-medium uppercase tracking-widest text-muted">Net for the day</p>
      <Amount value={dayTotal} showSign className="mb-6 block text-2xl font-medium tracking-tight sm:mb-8 sm:text-3xl" />

      <p className="mb-3 text-[11px] font-medium uppercase tracking-widest text-muted sm:mb-4">Transactions</p>
      {selectedTxns.length > 0 ? (
        <div className="divide-y divide-rule">
          {selectedTxns.map((tx) => (
            <div key={tx.id} className="flex items-center gap-3 py-3 sm:gap-4 sm:py-4">
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
        </div>
      )}

      {/* Always-visible add button */}
      <button
        onClick={onAddTransaction}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-rule py-3 text-sm font-semibold text-accent transition-all duration-150 hover:border-accent hover:bg-accent-soft active:scale-[0.98]"
      >
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
          <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        Add transaction
      </button>
    </>
  );
}
