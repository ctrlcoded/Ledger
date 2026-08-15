"use server";

import { getSession } from "@/lib/auth";
import { forUser } from "@/db/repo";
import type { TxnView } from "@/lib/types";

/* ---------- helpers ---------- */

const rupees = (minor: bigint | number | null | undefined) =>
  Number(minor ?? 0) / 100;

function ymd(d: Date) {
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60_000).toISOString().slice(0, 10);
}

function monthRange(offsetMonths = 0) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() + offsetMonths, 1);
  const end = new Date(now.getFullYear(), now.getMonth() + offsetMonths + 1, 0);
  return { from: ymd(start), to: ymd(end) };
}

function labelDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  const mon = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][m - 1];
  return `${d} ${mon} ${y}`;
}

/* ---------- dashboard / landing overview ---------- */

export async function getOverview() {
  const session = await getSession();
  if (!session) return { ok: false as const, error: "UNAUTHENTICATED" as const };

  const repo = forUser(session.userId);
  const cur = monthRange(0);
  const six = monthRange(-5);

  // Single 6-month rollup fetch; the current month is a subset of it, so we
  // never re-query the hottest range twice (CRITICAL-3).
  const [balanceMinor, rows, cats, wide] = await Promise.all([
    repo.balance(),
    repo.listTransactions(undefined, 12),
    repo.getCategories(),
    repo.monthRollup(six.from, cur.to),
  ]);

  const catMap = new Map(cats.map((c: any) => [c.id, c.name as string]));

  const transactions: TxnView[] = rows.map((r: any) => {
    const category = r.categoryId ? catMap.get(r.categoryId) ?? "" : "";
    return {
      id: r.id,
      description: r.note || category || (r.direction === "credit" ? "Income" : "Expense"),
      category,
      direction: r.direction,
      signedRupees: rupees(r.signedMinor),
      occurredOn: r.occurredOn,
      dateLabel: labelDate(r.occurredOn),
    };
  });

  // Current month income/expense derived from the 6-month set (no extra query).
  const curRollups = (wide as any[]).filter((r) => r.day >= cur.from && r.day <= cur.to);
  const income = curRollups.reduce((s: number, r: any) => s + rupees(r.creditMinor), 0);
  const expense = curRollups.reduce((s: number, r: any) => s + rupees(r.debitMinor), 0);

  // last 6 months of cashflow, aggregated by month
  const byMonth = new Map<string, { income: number; expense: number }>();
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    byMonth.set(`${d.getFullYear()}-${d.getMonth()}`, { income: 0, expense: 0 });
  }
  for (const r of wide as any[]) {
    const [yy, mm] = r.day.split("-").map(Number);
    const key = `${yy}-${mm - 1}`;
    const b = byMonth.get(key);
    if (b) {
      b.income += rupees(r.creditMinor);
      b.expense += rupees(r.debitMinor);
    }
  }
  const cashflow = [...byMonth.entries()].map(([key, v]) => {
    const [yy, mm] = key.split("-").map(Number);
    return {
      label: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][mm],
      year: yy,
      income: v.income,
      expense: v.expense,
    };
  });

  return {
    ok: true as const,
    balance: rupees(balanceMinor),
    income,
    expense,
    net: income - expense,
    transactions,
    cashflow,
    hasData: transactions.length > 0 || Number(balanceMinor) !== 0,
  };
}

/* ---------- calendar ---------- */

export async function getCalendarMonth(year: number, month0: number) {
  const session = await getSession();
  if (!session) return { ok: false as const, error: "UNAUTHENTICATED" as const };

  const repo = forUser(session.userId);
  const from = ymd(new Date(year, month0, 1));
  const to = ymd(new Date(year, month0 + 1, 0));

  // Index-seek the month directly (CRITICAL-1) — no fetch-all-then-filter.
  const [rollups, cats, rows] = await Promise.all([
    repo.monthRollup(from, to),
    repo.getCategories(),
    repo.listByDateRange(from, to, 1000),
  ]);
  const catMap = new Map(cats.map((c: any) => [c.id, c.name as string]));

  const byDay: Record<number, TxnView[]> = {};
  for (const r of rows) {
    const day = Number(r.occurredOn.split("-")[2]);
    (byDay[day] ??= []).push({
      id: r.id,
      description: r.note || catMap.get(r.categoryId) || (r.direction === "credit" ? "Income" : "Expense"),
      category: r.categoryId ? catMap.get(r.categoryId) ?? "" : "",
      direction: r.direction,
      signedRupees: rupees(r.signedMinor),
      occurredOn: r.occurredOn,
      dateLabel: labelDate(r.occurredOn),
    });
  }

  const netByDay: Record<number, number> = {};
  for (const r of rollups as any[]) {
    const day = Number(r.day.split("-")[2]);
    netByDay[day] = rupees(r.netMinor);
  }

  return { ok: true as const, byDay, netByDay };
}

/* ---------- reports ---------- */

export async function getReports() {
  const session = await getSession();
  if (!session) return { ok: false as const, error: "UNAUTHENTICATED" as const };

  const repo = forUser(session.userId);
  const from = monthRange(-11).from;
  const to = monthRange(0).to;

  // Aggregation pushed down to Postgres (CRITICAL-2) — no 1000-row JS scan.
  const [rollups, breakdown, cats] = await Promise.all([
    repo.monthRollup(from, to),
    repo.categoryBreakdown(from, to),
    repo.getCategories(),
  ]);
  const catMap = new Map(cats.map((c: any) => [c.id, c.name as string]));

  const byMonth = new Map<string, { income: number; expenses: number }>();
  for (let i = 11; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    byMonth.set(`${d.getFullYear()}-${d.getMonth()}`, { income: 0, expenses: 0 });
  }
  for (const r of rollups as any[]) {
    const [yy, mm] = r.day.split("-").map(Number);
    const key = `${yy}-${mm - 1}`;
    const b = byMonth.get(key);
    if (b) {
      b.income += rupees(r.creditMinor);
      b.expenses += rupees(r.debitMinor);
    }
  }
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const chart = [...byMonth.entries()].map(([key, v]) => {
    const [, mm] = key.split("-").map(Number);
    return { label: monthNames[mm], income: v.income, expenses: v.expenses };
  });

  const totalIncome = chart.reduce((s, m) => s + m.income, 0);
  const totalExpenses = chart.reduce((s, m) => s + m.expenses, 0);

  // Top expense categories — already grouped by Postgres.
  const topCategories = (breakdown as any[])
    .map((b) => {
      const name = b.categoryId ? catMap.get(b.categoryId) ?? "Uncategorised" : "Uncategorised";
      const total = rupees(b.totalMinor);
      return {
        name,
        total,
        count: Number(b.count),
        pct: totalExpenses > 0 ? Math.round((total / totalExpenses) * 100) : 0,
      };
    })
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  const highestMonth = chart.reduce((max, m) => (m.income > max.income ? m : max), chart[0] ?? { label: "—", income: 0 });
  const activeMonths = chart.filter((m) => m.income + m.expenses > 0).length || 1;

  return {
    ok: true as const,
    chart,
    topCategories,
    totalIncome,
    totalExpenses,
    totalSaved: totalIncome - totalExpenses,
    highestMonthLabel: highestMonth.label,
    highestMonthValue: highestMonth.income,
    monthlyAvgExpense: totalExpenses / activeMonths,
    savingsRate: totalIncome > 0 ? Math.round(((totalIncome - totalExpenses) / totalIncome) * 100) : 0,
    hasData: totalIncome + totalExpenses > 0,
  };
}
