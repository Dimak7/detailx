export const vehicleTypes = ["Sedan", "SUV", "Truck"] as const;

export const pricedServices = [
  {
    title: "Simple Detail",
    code: "SD",
    tone: "Maintenance refresh",
    description: "A clean maintenance package for drivers who want the basics handled well without overbooking the day.",
    image: "/brand/detailx-work/black-mercedes-rear.jpg",
    category: "package",
    ctaLabel: "Book Simple",
    prices: {
      Sedan: 180,
      SUV: 180,
      Truck: 180,
    },
    includes: [
      "Interior vacuum",
      "Basic wipe down",
      "Light interior cleaning",
      "Exterior hand wash",
      "Wheels cleaned",
    ],
  },
  {
    title: "Full Detail",
    code: "FD",
    tone: "Most popular",
    description: "Our most-booked full in-and-out detail for drivers who want a stronger interior reset and a sharper finish outside.",
    image: "/brand/detailx-work/white-bmw-interior.jpg",
    category: "package",
    recommended: true,
    ctaLabel: "Book Full",
    prices: {
      Sedan: 250,
      SUV: 250,
      Truck: 250,
    },
    includes: [
      "Full interior vacuum",
      "Stain removal",
      "Deep interior cleaning",
      "Dashboard, doors, vents, and console cleaned",
      "Exterior hand wash",
      "Wheels and tires cleaned",
      "Trim restoration",
      "Free wax included",
    ],
  },
  {
    title: "Deep Detail",
    code: "DD",
    tone: "Stronger restoration",
    description: "A higher-effort interior and exterior reset for dirtier vehicles, stronger cleanup needs, or a more complete reconditioning.",
    image: "/brand/detailx-work/white-bmw-interior.jpg",
    category: "package",
    ctaLabel: "Book Deep",
    prices: {
      Sedan: 350,
      SUV: 350,
      Truck: 350,
    },
    includes: [
      "Everything in Full Detail",
      "Deeper stain extraction",
      "Heavy dirt cleanup",
      "Pet hair removal if needed",
      "Extra interior detail work",
      "Extra exterior grime cleanup",
      "Trim restoration",
      "Free wax included",
    ],
  },
  {
    title: "Window Tint",
    code: "WT",
    tone: "Privacy + comfort",
    description: "A cleaner profile with privacy, comfort, and a more finished interior feel.",
    image: "/brand/detailx-work/mercedes-tail-light.jpg",
    category: "premium",
    ctaLabel: "Book Tint",
    startingPrice: 200,
    includes: [
      "Consultation on shade and coverage",
      "Window prep and film installation",
      "Clean edges and professional finish",
      "Aftercare guidance for curing and maintenance",
    ],
  },
  {
    title: "Ceramic Coating",
    code: "CC",
    tone: "Protection",
    description: "Gloss-focused protection that helps the vehicle stay cleaner and easier to maintain.",
    image: "/brand/detailx-work/red-audi-foam.jpg",
    category: "premium",
    ctaLabel: "Book Coating",
    startingPrice: 500,
    includes: [
      "Exterior wash and surface prep",
      "Paint decontamination as needed",
      "Panel wipe before coating",
      "Ceramic coating application",
      "Cure guidance and maintenance recommendations",
    ],
  },
  {
    title: "Paint Correction",
    code: "PC",
    tone: "Correction + polishing",
    description: "Premium polishing and correction work for swirls, haze, oxidation, and sharper paint clarity.",
    image: "/brand/detailx-work/audi-puddle-light.jpg",
    category: "premium",
    ctaLabel: "Book Correction",
    startingPrice: 100,
    includes: [
      "Paint inspection and prep wash",
      "Decontamination as needed",
      "Machine polishing or correction plan",
      "Gloss refinement for visible clarity",
      "Protection recommendation after correction",
    ],
  },
] as const;

export type VehicleType = (typeof vehicleTypes)[number];
export type BookingService = (typeof pricedServices)[number]["title"];

export type BookingDetailSelection = {
  service: BookingService;
  vehicleType: VehicleType;
  notes?: string;
};

export type BookingDetailEstimate = Omit<BookingDetailSelection, "notes"> & {
  lineNumber: number;
  estimatedPrice: string;
  basePrice: string;
  discountPercent: number;
  notes: string;
};

export type BookingEstimate = {
  details: BookingDetailEstimate[];
  estimatedPrice: string;
  totalAmount: number;
  hasStartingAtPricing: boolean;
  discountApplied: boolean;
};

export function getServicePricing(service: string) {
  return pricedServices.find((item) => item.title === service);
}

export function getEstimatedPrice(service: string, vehicleType: string) {
  return getPriceQuote(service, vehicleType).label;
}

export function getPriceQuote(service: string, vehicleType: string, discountPercent = 0) {
  const servicePricing = getServicePricing(service);

  if (!servicePricing) {
    return {
      amount: 0,
      label: "Estimate pending",
      baseLabel: "Estimate pending",
      isStartingAt: true,
      discountPercent,
    };
  }

  let amount = 0;
  let isStartingAt = false;

  if ("prices" in servicePricing) {
    amount = servicePricing.prices[vehicleType as VehicleType] ?? servicePricing.prices.Sedan;
  } else {
    amount = servicePricing.startingPrice;
    isStartingAt = true;
  }

  const discountedAmount = Math.round(amount * (1 - discountPercent / 100));

  return {
    amount: discountedAmount,
    label: formatPrice(discountedAmount, isStartingAt),
    baseLabel: formatPrice(amount, isStartingAt),
    isStartingAt,
    discountPercent,
  };
}

export function getStartingPriceLabel(service: string) {
  const servicePricing = getServicePricing(service);

  if (!servicePricing) {
    return "Estimate pending";
  }

  if ("prices" in servicePricing) {
    const prices = Object.values(servicePricing.prices);
    const startingPrice = Math.min(...prices);
    const isFlatPrice = prices.every((price) => price === startingPrice);
    return isFlatPrice ? `$${startingPrice}` : `Starting at $${startingPrice}`;
  }

  return `Starting at $${servicePricing.startingPrice}+`;
}

export function buildBookingEstimate(details: BookingDetailSelection[]): BookingEstimate {
  const normalizedDetails = details.map((detail, index) => {
    const discountPercent = index > 0 ? 10 : 0;
    const quote = getPriceQuote(detail.service, detail.vehicleType, discountPercent);

    return {
      ...detail,
      notes: detail.notes || "",
      lineNumber: index + 1,
      estimatedPrice: quote.label,
      basePrice: quote.baseLabel,
      discountPercent,
      amount: quote.amount,
      isStartingAt: quote.isStartingAt,
    };
  });
  const totalAmount = normalizedDetails.reduce((total, detail) => total + detail.amount, 0);
  const hasStartingAtPricing = normalizedDetails.some((detail) => detail.isStartingAt);

  return {
    details: normalizedDetails.map(({ amount, isStartingAt, ...detail }) => detail),
    estimatedPrice: formatPrice(totalAmount, hasStartingAtPricing),
    totalAmount,
    hasStartingAtPricing,
    discountApplied: normalizedDetails.length > 1,
  };
}

function formatPrice(amount: number, isStartingAt: boolean) {
  return `${isStartingAt ? "Starting at " : ""}$${amount}${isStartingAt ? "+" : ""}`;
}
