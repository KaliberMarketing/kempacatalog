import { getSession } from "@/lib/actions/auth";
import { UserProvider } from "@/components/providers/user-provider";
import { PlatformShell } from "@/components/shared/platform-shell";

export default async function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <UserProvider session={session}>
      <PlatformShell>{children}</PlatformShell>
    </UserProvider>
  );
}
