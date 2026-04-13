import { pricedServices } from "./pricing";

export const services = pricedServices.map(({ title, code, tone, description }) => ({
  title,
  code,
  tone,
  description,
}));

export const galleryImages = [
  {
    src: "/brand/detailx-work/red-audi-rear.jpg",
    alt: "Red Audi after DETAILX exterior work",
  },
  {
    src: "/brand/detailx-work/interior-red-seats.jpg",
    alt: "Detailed BMW cabin with red leather seats",
  },
  {
    src: "/brand/detailx-work/matte-green-bmw.jpg",
    alt: "Matte green BMW after detailing",
  },
  {
    src: "/brand/detailx-work/red-audi-headlight.jpg",
    alt: "Close detail of a red Audi headlight and paint",
  },
  {
    src: "/brand/detailx-work/tan-interior-detail.jpg",
    alt: "Detailed tan leather interior",
  },
  {
    src: "/brand/detailx-work/dark-interior-detail.jpg",
    alt: "Detailed dark BMW interior lighting",
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
