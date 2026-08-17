"use client";

import { useCallback, useState, useTransition } from "react";
import { deleteTransaction } from "@/app/actions";
import type { TxnView } from "@/lib/types";

/**
 * Optimistic transaction delete, shared by every surface that lists rows
 * (dashboard, home, calendar day detail).
 *
 * Flow: confirm → optimistically hide the row → call the server action →
 * on success re-sync via `reload()` (rollups/balances revalidated server-side),
 * on failure roll the row back and surface an error.
 */
export function useTransactionDelete(reload: () => void | Promise<void>) {
  const [pending, startTransition] = useTransition();
  const [target, setTarget] = useState<TxnView | null>(null);
  const [removed, setRemoved] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const request = useCallback((tx: TxnView) => {
    setError(null);
    setTarget(tx);
  }, []);

  const cancel = useCallback(() => setTarget(null), []);

  const confirm = useCallback(() => {
    const tx = target;
    if (!tx) return;
    setTarget(null);
    // Optimistic remove.
    setRemoved((s) => new Set(s).add(tx.id));

    startTransition(async () => {
      const res = await deleteTransaction(tx.id);
      if (!res.ok) {
        // Roll back the optimistic removal.
        setRemoved((s) => {
          const n = new Set(s);
          n.delete(tx.id);
          return n;
        });
        setError(
          res.error === "UNAUTHENTICATED"
            ? "Your session expired. Sign in again."
            : res.error === "NOT_FOUND"
            ? "That transaction no longer exists."
            : res.error === "RATE_LIMITED"
            ? "Too many changes too fast. Wait a moment and retry."
            : "Could not delete the transaction. Try again."
        );
        return;
      }
      // Re-fetch fresh data (totals + calendar cells now reflect the deletion),
      // then drop the id from the optimistic set — the reloaded data omits it.
      await reload();
      setRemoved((s) => {
        const n = new Set(s);
        n.delete(tx.id);
        return n;
      });
    });
  }, [target, reload]);

  const isRemoved = useCallback((id: string) => removed.has(id), [removed]);

  return {
    /** true while a delete is in flight */
    pending,
    /** the row awaiting confirmation, or null */
    target,
    /** last error message, or null */
    error,
    /** open the confirm dialog for a row */
    request,
    /** close the confirm dialog without deleting */
    cancel,
    /** perform the delete for the current target */
    confirm,
    /** whether a row is optimistically hidden */
    isRemoved,
    /** clear the error banner */
    dismissError: () => setError(null),
  };
}
