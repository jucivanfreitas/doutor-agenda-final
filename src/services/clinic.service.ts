import { db } from "@/db";
import { usersToClinicsTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getActiveClinicId(
  userId: string,
): Promise<string | null> {
  const record = await db.query.usersToClinicsTable.findFirst({
    where: eq(usersToClinicsTable.userId, userId),
    columns: { clinicId: true },
  });
  if (!record) return null;
  return record.clinicId as string;
}
