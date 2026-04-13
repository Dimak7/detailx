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
    label: "Full detail finish",
  },
  {
    src: "https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=900&q=88",
    alt: "Luxury vehicle cabin and steering wheel",
    label: "Interior detailing",
  },
  {
    src: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=900&q=88",
    alt: "Polished performance car exterior",
    label: "Paint clarity",
  },
  {
    src: "https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?auto=format&fit=crop&w=900&q=88",
    alt: "Luxury car paint finish",
    label: "Paint correction",
  },
  {
    src: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=900&q=88",
    alt: "Red performance car after exterior detailing",
    label: "Exterior detail",
  },
  {
    src: "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=900&q=88",
    alt: "Vehicle surface ready for detailing work",
    label: "Prep work",
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
    description: "Your reservation is stored server-side with email and optional SMS confirmation support.",
  },
];

export const testimonials = [
  {
    quote: "The booking felt polished and the result matched it. My SUV looked deep-cleaned without me leaving River North.",
    name: "Marissa T.",
    neighborhood: "River North",
  },
  {
    quote: "I booked paint correction before listing my coupe. The paint had a cleaner reflection and the communication was excellent.",
    name: "Jordan P.",
    neighborhood: "Lakeview",
  },
  {
    quote: "DETAILX handled the garage setup, showed up prepared, and made the interior feel brand new again.",
    name: "Andre M.",
    neighborhood: "Hyde Park",
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
