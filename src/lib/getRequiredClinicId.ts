export function getRequiredClinicId(
  ctx?: { clinicId?: string } | null,
): string {
  if (!ctx) throw new Error("Clinic id required");
  const maybe = (ctx as any).clinicId ?? (ctx as any).clinic?.id ?? undefined;
  if (!maybe) throw new Error("Clinic id required");
  return String(maybe);
}
