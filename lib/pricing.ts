export const vehicleTypes = ["Sedan", "SUV", "Truck"] as const;

export const pricedServices = [
  {
    title: "Full Detail",
    code: "FD",
    tone: "Interior + exterior",
    description: "A complete interior and exterior refresh for regular maintenance and a crisp handoff.",
    image: "/brand/detailx-work/black-porsche-driveway.jpg",
    prices: {
      Sedan: 250,
      SUV: 270,
      Truck: 290,
    },
    includes: [
      "Hand wash and microfiber dry",
      "Wheel, tire, and exterior glass cleaning",
      "Interior vacuum and surface wipedown",
      "Mats, panels, vents, and touch points cleaned",
      "Tire dressing and final inspection",
    ],
  },
  {
    title: "Deep Cleaning Full Detail",
    code: "DC",
    tone: "Showroom reset",
    description: "A deeper interior and exterior reconditioning service for dirtier vehicles or a higher-level reset.",
    image: "/brand/detailx-work/white-bmw-interior.jpg",
    prices: {
      Sedan: 400,
      SUV: 400,
      Truck: 400,
    },
    includes: [
      "Hand wash, decontamination, and microfiber dry",
      "Door jambs, exterior glass, wheels, and tires deep cleaned",
      "Clay treatment if needed plus wax or protection layer",
      "Deep vacuum, carpet and mat cleaning, and trunk cleanup",
      "Seat cleaning or conditioning based on material",
      "Light to moderate odor or stain attention",
      "UV protection on hard interior surfaces",
    ],
  },
  {
    title: "Interior Detail",
    code: "IN",
    tone: "Interior reset",
    description: "A focused interior reset for the surfaces you see, touch, and sit in every day.",
    image: "/brand/detailx-work/bmw-dash-detail.jpg",
    prices: {
      Sedan: 160,
      SUV: 180,
      Truck: 200,
    },
    includes: [
      "Thorough vacuum of seats, floors, mats, and trunk",
      "Dashboard, console, cupholders, panels, and vents cleaned",
      "Interior glass cleaned",
      "Leather or fabric-safe seat care",
      "Light odor-minded cleanup and final wipedown",
    ],
  },
  {
    title: "Exterior Detail",
    code: "EX",
    tone: "Gloss wash",
    description: "A premium exterior wash and finish service for sharper gloss and cleaner presence.",
    image: "/brand/detailx-work/black-mercedes-rear.jpg",
    prices: {
      Sedan: 100,
      SUV: 100,
      Truck: 100,
    },
    includes: [
      "Foam pre-soak and hand wash",
      "Microfiber dry and finish wipe",
      "Wheel faces, tires, and exterior glass cleaned",
      "Tire dressing",
      "Quick trim and paint presentation check",
    ],
  },
  {
    title: "Window Tint",
    code: "WT",
    tone: "Privacy + comfort",
    description: "A cleaner profile with privacy, comfort, and a more finished interior feel.",
    image: "/brand/detailx-work/mercedes-tail-light.jpg",
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
    tone: "Clarity work",
    description: "Polishing and correction work for swirls, haze, oxidation, and sharper paint clarity.",
    image: "/brand/detailx-work/audi-puddle-light.jpg",
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
