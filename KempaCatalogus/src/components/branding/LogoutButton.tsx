"use client";

import { useTransition } from "react";

export function LogoutButton() {
  const [pending, startTransition] = useTransition();

  async function handleLogout() {
    const res = await fetch("/api/logout", {
      method: "POST",
    });

    if (res.ok) {
      window.location.href = "/login";
    }
  }

  return (
    <button
      type="button"
      onClick={() => startTransition(handleLogout)}
      className="rounded-full border border-black/10 px-3 py-1.5 text-xs font-medium text-[color-mix(in_srgb,var(--color-text)_80%,#4b5563_20%)] transition hover:bg-black/5"
      disabled={pending}
    >
      {pending ? "Uitloggen..." : "Uitloggen"}
    </button>
  );
}

