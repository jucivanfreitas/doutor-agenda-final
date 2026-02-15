"use server";

import dayjs from "dayjs";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { appointmentsTable } from "@/db/schema";
import { protectedWithClinicActionClient } from "@/lib/next-safe-action";

import { getAvailableTimes } from "../get-available-times";
import { addAppointmentSchema } from "./schema";

type AddAppointmentParsedInput = {
  patientId: string;
  doctorId: string;
  date: Date | string;
  time: string;
  appointmentPriceInCents: number;
};

type AddAppointmentArgs = {
  parsedInput: AddAppointmentParsedInput;
  ctx: { user: { clinic: { id: string } } };
};

const handler = async ({ parsedInput, ctx }: AddAppointmentArgs) => {
  const availableTimes = await getAvailableTimes({
    doctorId: parsedInput.doctorId,
    date: dayjs(parsedInput.date).format("YYYY-MM-DD"),
  });
  const availableTimesResult = availableTimes as unknown as {
    data?: { value: string; available: boolean; label: string }[];
  };
  if (!availableTimesResult?.data) {
    throw new Error("No available times");
  }
  const isTimeAvailable = availableTimesResult.data?.some(
    (time) => time.value === parsedInput.time && time.available,
  );
  if (!isTimeAvailable) {
    throw new Error("Time not available");
  }
  const appointmentDateTime = dayjs(parsedInput.date)
    .set("hour", parseInt(parsedInput.time.split(":")[0]))
    .set("minute", parseInt(parsedInput.time.split(":")[1]))
    .toDate();

  await db.insert(appointmentsTable).values({
    ...parsedInput,
    clinicId: ctx.user.clinic.id,
    date: appointmentDateTime,
  });

  revalidatePath("/appointments");
  revalidatePath("/dashboard");
};

export const addAppointment = protectedWithClinicActionClient
  .schema(addAppointmentSchema)
  .action(handler);
