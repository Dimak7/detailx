import { getStartingPriceLabel, type PricedService } from "./pricing";

export type ServiceTier = {
  title: string;
  code: string;
  tone: string;
  description: string;
  price: string;
  pricingNote?: string;
  pricing?: {
    sedan: string;
    suv: string;
    truck: string;
  };
  includes: readonly string[];
  image: string;
  category: string;
  ctaLabel: string;
  recommended: boolean;
};

export function buildServiceTiers(pricedServices: readonly PricedService[]): ServiceTier[] {
  return pricedServices.map((service) => {
    const recommended = "recommended" in service ? service.recommended : false;

    return {
      title: service.title,
      code: service.code,
      tone: service.tone,
      description: service.description,
      price: getStartingPriceLabel(service.title, pricedServices),
      pricingNote: service.title === "Boat Detailing"
        ? "Final price depends on boat size, condition, oxidation, and service package."
        : undefined,
      pricing: "prices" in service ? {
        sedan: `$${service.prices.Sedan}`,
        suv: `$${service.prices.SUV}`,
        truck: `$${service.prices.Truck}`,
      } : undefined,
      includes: service.includes,
      image: service.image,
      category: service.category,
      recommended: recommended ?? false,
      ctaLabel: service.ctaLabel,
    };
  });
}

export const galleryImages = [
  {
    src: "/brand/detailx-work/black-porsche-driveway.jpg",
    alt: "Black Porsche after a DETAILX Chicago exterior detail.",
    title: "Gloss Finish",
    detail: "Exterior detail / Porsche",
    objectPosition: "center 52%",
  },
  {
    src: "/brand/detailx-work/white-bmw-interior.jpg",
    alt: "White BMW interior after a DETAILX Chicago interior detail.",
    title: "Interior Reset",
    detail: "Interior full detail / BMW",
    objectPosition: "center center",
  },
  {
    src: "/brand/detailx-work/black-mercedes-rear.jpg",
    alt: "Black Mercedes rear quarter after a DETAILX Chicago mobile detail.",
    title: "Paint Clarity",
    detail: "Full detail / Mercedes",
    objectPosition: "center 56%",
  },
  {
    src: "/brand/detailx-work/mercedes-tail-light.jpg",
    alt: "Mercedes tail light and rear panel after a DETAILX Chicago detail.",
    title: "Premium Finish",
    detail: "Detail finish / Mercedes",
    objectPosition: "center 44%",
  },
  {
    src: "/brand/detailx-work/audi-puddle-light.jpg",
    alt: "Audi side profile and puddle light after a DETAILX Chicago detail.",
    title: "Night Gloss",
    detail: "Exterior detail / Audi",
    objectPosition: "center center",
  },
  {
    src: "/brand/detailx-work/red-audi-foam.jpg",
    alt: "Red Audi covered in foam during a DETAILX Chicago wash stage.",
    title: "Wash Process",
    detail: "Safe wash / Audi",
    objectPosition: "center 48%",
  },
  {
    src: "/brand/detailx-work/bmw-skyline-result.jpg",
    alt: "BMW with skyline reflection after a DETAILX Chicago detail.",
    title: "Reflection Check",
    detail: "Exterior finish / BMW",
    objectPosition: "center 46%",
  },
  {
    src: "/brand/detailx-work/audi-interior-result.jpg",
    alt: "Audi interior after a DETAILX Chicago interior cleaning.",
    title: "Cabin Detail",
    detail: "Interior result / Audi",
    objectPosition: "center center",
  },
  {
    src: "/brand/detailx-work/ford-super-duty-result.jpg",
    alt: "Ford Super Duty after a DETAILX Chicago mobile detail.",
    title: "Truck Finish",
    detail: "Detail result / Ford",
    objectPosition: "center 52%",
  },
  {
    src: "/brand/detailx-work/black-bmw-foam-result.jpg",
    alt: "Black BMW after a DETAILX Chicago foam wash and detail.",
    title: "Deep Clean",
    detail: "Wash and finish / BMW",
    objectPosition: "center 50%",
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
