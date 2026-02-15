import { cache } from "react";
import { db } from "@/db";
import { systemSettingsTable } from "@/db/schema";

export const getSystemSettings = cache(async () => {
  const settings = await db.query.systemSettingsTable.findFirst();
  return settings ?? null;
});

export async function getAppName(): Promise<string> {
  const s = await getSystemSettings();
  return s?.appName ?? "Pleno PSI";
}

export default { getSystemSettings, getAppName };
