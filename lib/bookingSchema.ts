import { z } from "zod";

export const bookingServices = [
  "Full Detail",
  "Interior Detailing",
  "Exterior Detailing",
  "Ceramic Coating",
  "Window Tint",
  "Polishing",
  "Paint Correction",
] as const;

export const vehicleTypes = [
  "Sedan / Coupe",
  "SUV / Crossover",
  "Truck",
  "Luxury / Exotic",
  "Fleet vehicle",
] as const;

export const bookingSchema = z.object({
  service: z.enum(bookingServices),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a valid date."),
  time: z.string().min(3).max(20),
  name: z.string().trim().min(2, "Name is required.").max(120),
  phone: z.string().trim().min(7, "Phone number is required.").max(30),
  email: z.email("Enter a valid email address.").max(180),
  vehicleType: z.enum(vehicleTypes),
  address: z.string().trim().min(5, "Service location is required.").max(240),
  notes: z.string().trim().max(800).optional().default(""),
});

export type BookingInput = z.infer<typeof bookingSchema>;

export function assertFutureDate(dateValue: string) {
  const selected = new Date(`${dateValue}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (Number.isNaN(selected.getTime()) || selected < today) {
    throw new Error("Choose a future booking date.");
  }
}
