export const timeSlots = ["8:00 AM", "10:30 AM", "1:00 PM", "3:30 PM", "6:00 PM"] as const;

export type TimeSlot = (typeof timeSlots)[number];

export type SlotAvailability = {
  time: TimeSlot;
  available: boolean;
  reason?: "booked" | "blocked";
};

export function isTimeSlot(value: string): value is TimeSlot {
  return timeSlots.includes(value as TimeSlot);
}
