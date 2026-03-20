"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { UserSession } from "@/lib/actions/auth";

const UserContext = createContext<UserSession | null>(null);

export function UserProvider({
  session,
  children,
}: {
  session: UserSession | null;
  children: ReactNode;
}) {
  return (
    <UserContext.Provider value={session}>{children}</UserContext.Provider>
  );
}

export function useUser(): UserSession | null {
  return useContext(UserContext);
}
