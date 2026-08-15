"use client";

import { createContext, useContext } from "react";

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  initials: string;
  gender: string | null;
};

const UserContext = createContext<UserProfile | null>(null);

export function UserProvider({
  user,
  children,
}: {
  user: UserProfile | null;
  children: React.ReactNode;
}) {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
