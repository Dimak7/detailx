import { getStartingPriceLabel, pricedServices } from "./pricing";

export type ServiceTier = {
  title: string;
  code: string;
  tone: string;
  description: string;
  price: string;
  includes: readonly string[];
  image?: string;
  category?: string;
  ctaLabel?: string;
  recommended?: boolean;
};

export const services: ServiceTier[] = pricedServices.map(({ title, code, tone, description, includes, image, category, recommended = false, ctaLabel }) => ({
  title,
  code,
  tone,
  description,
  price: getStartingPriceLabel(title),
  includes,
  image,
  category,
  recommended: Boolean(recommended),
  ctaLabel,
}));

export const galleryImages = [
  {
    src: "/brand/detailx-work/black-porsche-driveway.jpg",
    alt: "Black Porsche in a driveway after DETAILX Chicago detailing",
  },
  {
    src: "/brand/detailx-work/white-bmw-interior.jpg",
    alt: "Detailed BMW interior with white performance seats",
  },
  {
    src: "/brand/detailx-work/black-mercedes-rear.jpg",
    alt: "Black Mercedes rear finish under studio lighting",
  },
  {
    src: "/brand/detailx-work/mercedes-tail-light.jpg",
    alt: "Mercedes tail light and polished rear detail",
  },
  {
    src: "/brand/detailx-work/audi-puddle-light.jpg",
    alt: "Audi puddle light detail after service",
  },
  {
    src: "/brand/detailx-work/red-audi-foam.jpg",
    alt: "Foam wash during a DETAILX Chicago appointment",
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
    quote: "They paid attention to the small stuff. The interior finally felt reset.",
    name: "Chris R.",
    neighborhood: "Logan Square",
  },
  {
    quote: "Clean work, sharp finish, and no wasted afternoon at a shop.",
    name: "Elena V.",
    neighborhood: "Lincoln Park",
  },
  {
    quote: "The finish came back sharp fast. I would book again.",
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
