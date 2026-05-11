export const vehicleTypes = ["Sedan", "SUV", "Truck"] as const;

export type VehicleType = (typeof vehicleTypes)[number];
const serviceTitles = [
  "Exterior Detail",
  "Interior Full Detail",
  "Full Detail",
  "Deep Detail",
  "Maintenance Detail",
  "Headlight Restoration",
  "Window Tint",
  "Ceramic Coating",
  "Paint Correction",
] as const;

export type BookingService = (typeof serviceTitles)[number];

type ServiceBase = {
  title: BookingService;
  code: string;
  tone: string;
  description: string;
  image: string;
  category: string;
  ctaLabel: string;
  includes: readonly string[];
  recommended?: boolean;
};

type VehiclePricedService = ServiceBase & {
  prices: Record<VehicleType, number>;
};

type StartingPricedService = ServiceBase & {
  startingPrice: number;
  nonFixedPrice?: boolean;
  discussionLabel?: string;
};

export type PricedService = VehiclePricedService | StartingPricedService;

export const basePricedServices = [
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
    title: "Maintenance Detail",
    code: "MD",
    tone: "Ongoing upkeep",
    description: "For regular clients who want ongoing cleaning and upkeep.",
    image: "/brand/detailx-work/black-mercedes-rear.jpg",
    category: "Detailing",
    ctaLabel: "Book Maintenance Detail",
    startingPrice: 0,
    nonFixedPrice: true,
    discussionLabel: "Price discussed after vehicle review",
    includes: [
      "Maintenance cleaning and upkeep",
      "Service scope reviewed on arrival",
      "Vehicle condition check",
      "Price discussed after inspection",
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
] satisfies readonly PricedService[];

export const pricedServices = basePricedServices;

export type ServicePriceOverride = {
  prices?: Partial<Record<VehicleType, number>>;
  startingPrice?: number;
};

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
  bonusIncluded: boolean;
};

export const freeWaxBonusLabel = "Free wax included";

export function resolvePricedServices(overrides: Partial<Record<BookingService, ServicePriceOverride>> = {}) {
  return basePricedServices.map((service) => {
    const override = overrides[service.title];

    if (!override) {
      return service;
    }

  if ("prices" in service) {
      return {
        ...service,
        prices: {
          ...service.prices,
          ...(override.prices || {}),
        },
      };
    }

    return {
      ...service,
      startingPrice: override.startingPrice ?? service.startingPrice,
    };
  }) as PricedService[];
}

export function getServicePricing(service: string, services: readonly PricedService[] = pricedServices) {
  return services.find((item) => item.title === service);
}

export function getEstimatedPrice(service: string, vehicleType: string, services: readonly PricedService[] = pricedServices) {
  return getPriceQuote(service, vehicleType, 0, services).label;
}

export function getPriceQuote(
  service: string,
  vehicleType: string,
  discountPercent = 0,
  services: readonly PricedService[] = pricedServices
) {
  const servicePricing = getServicePricing(service, services);

  if (!servicePricing) {
    return {
      amount: 0,
      label: "Estimate pending",
      baseLabel: "Estimate pending",
      isStartingAt: true,
      isDiscussionOnly: false,
      discountPercent,
    };
  }

  let amount = 0;
  let isStartingAt = false;
  let isDiscussionOnly = false;

  if ("prices" in servicePricing) {
    amount = servicePricing.prices[vehicleType as VehicleType] ?? servicePricing.prices.Sedan;
  } else if (servicePricing.nonFixedPrice && servicePricing.startingPrice <= 0) {
    isDiscussionOnly = true;
  } else {
    amount = servicePricing.startingPrice;
    isStartingAt = true;
  }

  const fullAmount = amount;
  const priceLabel = isDiscussionOnly ? "To be discussed" : formatPrice(fullAmount, isStartingAt);
  const baseLabel = isDiscussionOnly ? "To be discussed" : formatPrice(amount, isStartingAt);

  return {
    amount: fullAmount,
    label: priceLabel,
    baseLabel,
    isStartingAt,
    isDiscussionOnly,
    discountPercent: 0,
  };
}

export function getStartingPriceLabel(service: string, services: readonly PricedService[] = pricedServices) {
  const servicePricing = getServicePricing(service, services);

  if (!servicePricing) {
    return "Estimate pending";
  }

  if ("prices" in servicePricing) {
    const prices = Object.values(servicePricing.prices);
    const startingPrice = Math.min(...prices);
    const isFlatPrice = prices.every((price) => price === startingPrice);
    return isFlatPrice ? `$${startingPrice}` : `Starting at $${startingPrice}`;
  }

  if (servicePricing.nonFixedPrice && servicePricing.startingPrice <= 0) {
    return servicePricing.discussionLabel || "Price discussed after inspection";
  }

  return `Starting at $${servicePricing.startingPrice}+`;
}

export function getTelegramPriceLabel(service: PricedService) {
  if ("prices" in service) {
    const prices = Object.entries(service.prices);
    const [firstPrice] = prices.map(([, price]) => price);
    const isFlatPrice = prices.every(([, price]) => price === firstPrice);

    if (isFlatPrice) {
      return `$${firstPrice}`;
    }

    return prices.map(([vehicle, price]) => `$${price} ${vehicle.toLowerCase()}`).join(" / ");
  }

  if (service.nonFixedPrice && service.startingPrice <= 0) {
    return "non-fixed (price discussed after inspection)";
  }

  return `starts at $${service.startingPrice}`;
}

export function buildBookingEstimate(details: BookingDetailSelection[], services: readonly PricedService[] = pricedServices): BookingEstimate {
  const normalizedDetails = details.map((detail, index) => {
    const discountPercent = 0;
    const quote = getPriceQuote(detail.service, detail.vehicleType, discountPercent, services);

    return {
      ...detail,
      notes: detail.notes || "",
      lineNumber: index + 1,
      estimatedPrice: quote.label,
      basePrice: quote.baseLabel,
      discountPercent,
      amount: quote.amount,
      isStartingAt: quote.isStartingAt,
      isDiscussionOnly: quote.isDiscussionOnly,
    };
  });
  const totalAmount = normalizedDetails.reduce((total, detail) => total + detail.amount, 0);
  const hasStartingAtPricing = normalizedDetails.some((detail) => detail.isStartingAt);
  const hasDiscussionPricing = normalizedDetails.some((detail) => detail.isDiscussionOnly);

  return {
    details: normalizedDetails.map(({ amount, isStartingAt, ...detail }) => detail),
    estimatedPrice: hasDiscussionPricing ? "To be discussed" : formatPrice(totalAmount, hasStartingAtPricing),
    totalAmount,
    hasStartingAtPricing,
    discountApplied: false,
    bonusIncluded: normalizedDetails.length >= 2,
  };
}

export function hasFreeWaxBonus(details: Array<{ service: string }>) {
  return details.length >= 2;
}

function formatPrice(amount: number, isStartingAt: boolean) {
  return `${isStartingAt ? "Starting at " : ""}$${amount}${isStartingAt ? "+" : ""}`;
}
