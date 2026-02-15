import { db } from "@/db";
import { systemSettingsTable } from "@/db/schema";

export async function getSystemSettings() {
  const settings = await db.query.systemSettingsTable.findFirst();
  return settings ?? null;
}

export async function getAppName(): Promise<string> {
  const s = await getSystemSettings();
  return s?.appName ?? "Pleno PSI";
}

export default { getSystemSettings, getAppName };
