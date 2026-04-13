import { pricedServices } from "./pricing";

export const services = pricedServices.map(({ title, code, tone, description }) => ({
  title,
  code,
  tone,
  description,
}));

export const galleryImages = [
  {
    src: "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=1400&q=88",
    alt: "Premium sports car with polished exterior",
  },
  {
    src: "https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=900&q=88",
    alt: "Luxury vehicle cabin and steering wheel",
  },
  {
    src: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=900&q=88",
    alt: "Polished performance car exterior",
  },
  {
    src: "https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?auto=format&fit=crop&w=900&q=88",
    alt: "Luxury car paint finish",
  },
  {
    src: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=900&q=88",
    alt: "Red performance car after exterior detailing",
  },
  {
    src: "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=900&q=88",
    alt: "Vehicle surface ready for detailing work",
  },
];

export const reasons = [
  {
    title: "Premium products",
    description: "A thoughtful product stack for cleaning, surface prep, dressing, protection, and final finish.",
  },
  {
    title: "Attention to detail",
    description: "We focus on the areas customers actually see and touch, then inspect before handoff.",
  },
  {
    title: "Mobile convenience",
    description: "Book service for your home, garage, office, or suitable parking location in Chicago.",
  },
  {
    title: "Reliable booking",
    description: "Clear communication from booking to handoff.",
  },
];

export const testimonials = [
  {
    quote: "My SUV looked better than it did when I bought it. Easy booking and a clean handoff.",
    name: "Marissa T.",
    neighborhood: "River North",
  },
  {
    quote: "The paint had a cleaner reflection and the communication was excellent.",
    name: "Jordan P.",
    neighborhood: "Lakeview",
  },
  {
    quote: "Showed up prepared and made the interior feel brand new again.",
    name: "Andre M.",
    neighborhood: "Hyde Park",
  },
  {
    quote: "Booked a full detail at home and the whole process felt premium.",
    name: "Nadia S.",
    neighborhood: "West Loop",
  },
  {
    quote: "They paid attention to the small stuff. The cabin finally felt reset.",
    name: "Chris R.",
    neighborhood: "Logan Square",
  },
  {
    quote: "Clean work, sharp finish, and no wasted afternoon at a shop.",
    name: "Elena V.",
    neighborhood: "Lincoln Park",
  },
  {
    quote: "The exterior detail brought the gloss back fast. I would book again.",
    name: "Marcus D.",
    neighborhood: "South Loop",
  },
  {
    quote: "Professional, on time, and the car looked ready for photos.",
    name: "Priya K.",
    neighborhood: "Bucktown",
  },
];

export const processSteps = [
  {
    step: "01",
    title: "Book Online",
    description: "Choose your service, date, time, vehicle, and Chicago service location.",
  },
  {
    step: "02",
    title: "We Arrive",
    description: "A prepared detailer comes to your driveway, garage, office, or approved parking spot.",
  },
  {
    step: "03",
    title: "We Detail",
    description: "We clean, prep, correct, protect, and inspect according to the service you selected.",
  },
  {
    step: "04",
    title: "You Enjoy",
    description: "You get a sharper vehicle and a smoother maintenance plan for the finish.",
  },
];
