"use client";

import { useState } from "react";
import Navbar from "@/components/ui/Navbar";
import CategoryIcon from "@/components/ui/CategoryIcon";
import AddTransactionPanel from "@/components/ui/AddTransactionPanel";
import Amount from "@/components/ui/Amount";

interface Transaction {
  name: string;
  category: string;
  amount: number;
  icon: string;
}

interface DayData {
  transactions: Transaction[];
}

const transactionData: Record<number, DayData> = {
  1: {
    transactions: [
      { name: "Salary credit", category: "INCOME", amount: 85000, icon: "bank" },
    ],
  },
  5: {
    transactions: [
      { name: "Electricity bill", category: "UTILITIES", amount: -3200, icon: "utilities" },
    ],
  },
  11: {
    transactions: [
      { name: "Freelance project payment", category: "CONSULTING SERVICES", amount: 25000, icon: "others" },
      { name: "Whole foods market", category: "GROCERIES", amount: -4850, icon: "groceries" },
      { name: "Coffee roasters", category: "DINING", amount: -900, icon: "food" },
      { name: "Fuel station", category: "TRANSPORT", amount: -5000, icon: "transport" },
    ],
  },
  25: {
    transactions: [
      { name: "Salary Credit", category: "Income", amount: 92000, icon: "bank" },
      { name: "Artisanal Bakery", category: "Dining", amount: -4500, icon: "food" },
      { name: "Uber India", category: "Transport", amount: -2500, icon: "transport" },
    ],
  }
};

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  const day = new Date(year, month, 1).getDay();
  // Convert Sunday=0 to Monday-based (Monday=0)
  return day === 0 ? 6 : day - 1;
}

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const dayNames = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

const dayFullNames = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
];

export default function CalendarPage() {
  const [currentYear, setCurrentYear] = useState(2023);
  const [currentMonth, setCurrentMonth] = useState(9); // October (0-indexed)
  const [selectedDay, setSelectedDay] = useState(25);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  // Previous month days to show
  const prevMonthDays = getDaysInMonth(currentYear, currentMonth - 1);
  const prevDays = Array.from({ length: firstDay }, (_, i) => prevMonthDays - firstDay + 1 + i);

  // Current month days
  const currentDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Next month days to fill the grid
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;
  const nextDays = Array.from({ length: totalCells - firstDay - daysInMonth }, (_, i) => i + 1);

  const selectedData = transactionData[selectedDay];
  const selectedDate = new Date(currentYear, currentMonth, selectedDay);
  const dayTotal = selectedData
    ? selectedData.transactions.reduce((sum, t) => sum + t.amount, 0)
    : 0;

  const goToPrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
    setSelectedDay(1);
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
    setSelectedDay(1);
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    setSelectedDay(today.getDate());
  };

  return (
    <div className="min-h-screen bg-canvas">
      <Navbar
        rightContent={
          <div className="flex items-center gap-4">
            <button className="p-2 text-muted hover:text-ink transition-colors duration-150">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M10 2.5C10.69 2.5 11.25 3.06 11.25 3.75V4.09C13.44 4.63 15 6.63 15 9V13.75L16.25 15H3.75L5 13.75V9C5 6.63 6.56 4.63 8.75 4.09V3.75C8.75 3.06 9.31 2.5 10 2.5ZM8.75 16.25C8.75 16.94 9.31 17.5 10 17.5C10.69 17.5 11.25 16.94 11.25 16.25H8.75Z"
                  fill="currentColor"
                />
              </svg>
            </button>
            <div className="w-8 h-8 bg-ink rounded-full flex items-center justify-center text-xs font-medium text-white">
              JD
            </div>
          </div>
        }
      />

      <main className="max-w-content mx-auto px-8 py-8">
        {/* Top Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <h1 className="font-sans text-2xl font-semibold text-ink">
              {monthNames[currentMonth]} <span className="text-muted font-normal">{currentYear}</span>
            </h1>
            <div className="flex items-center gap-1 ml-4">
              <button
                onClick={goToPrevMonth}
                className="w-8 h-8 flex items-center justify-center border border-rule rounded-lg text-muted hover:text-ink hover:border-ink transition-colors duration-150"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M9 3L5 7L9 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                onClick={goToNextMonth}
                className="w-8 h-8 flex items-center justify-center border border-rule rounded-lg text-muted hover:text-ink hover:border-ink transition-colors duration-150"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M5 3L9 7L5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
            <button
              onClick={goToToday}
              className="px-4 py-2 bg-paper border border-rule rounded-lg text-sm font-medium text-ink hover:bg-canvas transition-colors duration-150 ml-2"
            >
              Today
            </button>
          </div>
          
          <button 
            onClick={() => setIsPanelOpen(true)}
            className="px-5 py-2.5 bg-ink text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity duration-150"
          >
            Add transaction
          </button>
        </div>

        <div className="flex gap-8 items-start">
          {/* Left: Calendar Grid */}
          <div className="flex-1 bg-paper border border-rule rounded-xl overflow-hidden">
            {/* Day Headers */}
            <div className="grid grid-cols-7 border-b border-rule bg-canvas/30">
              {dayNames.map((day) => (
                <div
                  key={day}
                  className="px-4 py-3 text-xs font-medium uppercase tracking-widest text-muted"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7">
              {/* Previous month days */}
              {prevDays.map((day, i) => (
                <div
                  key={`prev-${i}`}
                  className="min-h-[120px] p-3 border-b border-r border-rule text-sm text-muted/40"
                >
                  {day}
                </div>
              ))}

              {/* Current month days */}
              {currentDays.map((day) => {
                const hasTransactions = transactionData[day];
                const isSelected = day === selectedDay;
                
                const dayTransactions = hasTransactions?.transactions || [];
                const dayTotal = dayTransactions.reduce((sum, t) => sum + t.amount, 0);

                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`min-h-[120px] p-3 border-b border-r border-rule text-left flex flex-col justify-between transition-colors duration-100 ${
                      isSelected
                        ? "bg-canvas ring-1 ring-ink/20 ring-inset"
                        : "hover:bg-canvas/50"
                    }`}
                  >
                    <span className={`text-sm ${isSelected ? "font-semibold text-ink" : "text-ink"}`}>
                      {day}
                    </span>
                    {hasTransactions && (
                      <div className="mt-2 text-right">
                        <Amount value={dayTotal} showSign={true} className="text-[11px] font-medium block" />
                      </div>
                    )}
                  </button>
                );
              })}

              {/* Next month days */}
              {nextDays.map((day, i) => (
                <div
                  key={`next-${i}`}
                  className="min-h-[120px] p-3 border-b border-r border-rule text-sm text-muted/40"
                >
                  {day}
                </div>
              ))}
            </div>
          </div>

          {/* Right: Day Detail Sidebar */}
          <div className="w-[400px] flex-shrink-0 bg-paper border border-rule rounded-xl p-8">
            {/* Date Header */}
            <p className="text-sm text-muted mb-1">
              {dayFullNames[selectedDate.getDay()]}
            </p>
            <h3 className="font-sans text-2xl font-semibold text-ink mb-10">
              {selectedDay} {monthNames[currentMonth]}
            </h3>

            {/* Day Total */}
            <div className="mb-10">
              <p className="text-[11px] font-medium uppercase tracking-widest text-muted mb-2">
                NET FOR THE DAY
              </p>
              <Amount value={dayTotal} showSign={true} className="text-3xl font-medium tracking-tight block" />
            </div>

            {/* Transactions List */}
            <div className="mb-8">
              <p className="text-[11px] font-medium uppercase tracking-widest text-muted mb-4">
                TRANSACTIONS
              </p>
              
              {selectedData ? (
                <div className="space-y-0">
                  {selectedData.transactions.map((tx, i) => (
                    <div key={i} className="flex items-center gap-4 py-4 border-b border-rule last:border-0">
                      <CategoryIcon type={tx.icon} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-ink">{tx.name}</p>
                        <p className="text-[13px] text-muted mt-0.5">{tx.category}</p>
                      </div>
                      <Amount value={tx.amount} showSign={true} className="text-sm font-medium flex-shrink-0" />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted py-4">
                  No transactions for this day.
                </p>
              )}
            </div>

            {/* Progress Bar */}
            <div className="mt-auto pt-6 border-t border-rule">
              <div className="h-1.5 w-full bg-rule rounded-full overflow-hidden mb-3">
                <div className="h-full bg-credit w-[60%]" />
              </div>
              <p className="text-xs text-muted">
                Day's spending is 12% below average.
              </p>
            </div>
          </div>
        </div>
      </main>

      <AddTransactionPanel 
        isOpen={isPanelOpen} 
        onClose={() => setIsPanelOpen(false)} 
      />
    </div>
  );
}
