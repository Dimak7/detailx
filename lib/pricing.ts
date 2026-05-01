export const vehicleTypes = ["Sedan", "SUV", "Truck"] as const;

export const pricedServices = [
  {
    title: "Exterior Detail",
    code: "EX",
    tone: "Outside refresh",
    description: "Best for a quick outside refresh.",
    image: "/brand/detailx-work/black-mercedes-rear.jpg",
    category: "Detailing",
    ctaLabel: "Book Exterior",
    prices: {
      Sedan: 100,
      SUV: 120,
      Truck: 140,
    },
    includes: [
      "Hand wash",
      "Wheels cleaned",
      "Tires cleaned and dressed",
      "Exterior glass cleaned",
      "Light trim refresh",
      "Free wax included if possible",
    ],
  },
  {
    title: "Interior Full Detail",
    code: "IN",
    tone: "Interior deep clean",
    description: "Best for deep interior cleaning.",
    image: "/brand/detailx-work/white-bmw-interior.jpg",
    category: "Detailing",
    ctaLabel: "Book Interior",
    prices: {
      Sedan: 160,
      SUV: 180,
      Truck: 200,
    },
    includes: [
      "Full vacuum",
      "Seats, carpets, and trunk cleaned",
      "Stain removal",
      "Dashboard, doors, vents, and console cleaned",
      "Interior wipe-down and refresh",
      "Odor reduction where possible",
    ],
  },
  {
    title: "Full Detail",
    code: "FD",
    tone: "Most popular",
    description: "Best value full inside and outside detail.",
    image: "/brand/detailx-work/white-bmw-interior.jpg",
    category: "Detailing",
    recommended: true,
    ctaLabel: "Book Full Detail",
    prices: {
      Sedan: 250,
      SUV: 270,
      Truck: 290,
    },
    includes: [
      "Full interior detail",
      "Exterior hand wash",
      "Wheels and tires cleaned",
      "Trim restoration",
      "Stain removal",
      "Free wax included",
    ],
  },
  {
    title: "Deep Detail",
    code: "DD",
    tone: "Stronger restoration",
    description: "Best for very dirty cars or heavier restoration.",
    image: "/brand/detailx-work/white-bmw-interior.jpg",
    category: "Detailing",
    ctaLabel: "Book Deep Detail",
    prices: {
      Sedan: 350,
      SUV: 370,
      Truck: 390,
    },
    includes: [
      "Everything in Full Detail",
      "Deeper stain extraction",
      "Heavy dirt cleanup",
      "Pet hair removal if needed",
      "Extra interior detail work",
      "Extra exterior grime cleanup",
      "Free wax included",
    ],
  },
  {
    title: "Headlight Restoration",
    code: "HR",
    tone: "Add-on clarity",
    description: "Restores cloudy/yellow headlights for a cleaner look and better visibility.",
    image: "/brand/detailx-work/audi-puddle-light.jpg",
    category: "Add-ons",
    ctaLabel: "Add Headlight Restoration",
    startingPrice: 120,
    includes: [
      "Headlight cleaning",
      "Sanding/restoration process",
      "Clarity improvement",
      "Protective finish/sealant if available",
    ],
  },
  {
    title: "Window Tint",
    code: "WT",
    tone: "Privacy + comfort",
    description: "A cleaner profile with privacy, comfort, and a more finished interior feel.",
    image: "/brand/detailx-work/mercedes-tail-light.jpg",
    category: "Premium",
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
    category: "Premium",
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
    description: "Improves paint clarity, gloss, and surface defects through machine polishing.",
    image: "/brand/detailx-work/audi-puddle-light.jpg",
    category: "Premium",
    ctaLabel: "Request Paint Correction",
    startingPrice: 300,
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
