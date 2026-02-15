import { getAppName, getSystemSettings } from "@/services/system.service";

export type Branding = {
  appName: string;
  logoUrl?: string | null;
  primaryColor?: string | null;
  supportEmail?: string | null;
};

export async function getBranding(): Promise<Branding> {
  const s = await getSystemSettings();
  return {
    appName: s?.appName ?? (await getAppName()),
    logoUrl: s?.logoUrl ?? null,
    primaryColor: s?.primaryColor ?? null,
    supportEmail: s?.supportEmail ?? null,
  };
}

export { getAppName };

export default { getBranding, getAppName };
