import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { UserSettingsPage } from "@/components/settings/UserSettingsPage";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return <UserSettingsPage user={user} />;
}
