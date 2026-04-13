export const vehicleTypes = ["Sedan", "SUV", "Truck"] as const;

export const pricedServices = [
  {
    title: "Full Detail",
    code: "FD",
    tone: "Interior + exterior",
    description: "A full cabin and exterior reset with a crisp final handoff.",
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=88",
    prices: {
      Sedan: 250,
      SUV: 270,
      Truck: 290,
    },
  },
  {
    title: "Interior Detail",
    code: "IN",
    tone: "Cabin reset",
    description: "Deep vacuuming, panels, vents, leather care, fabric attention, and odor-minded cleanup.",
    image: "https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=900&q=88",
    prices: {
      Sedan: 160,
      SUV: 180,
      Truck: 200,
    },
  },
  {
    title: "Exterior Detail",
    code: "EX",
    tone: "Gloss wash",
    description: "Foam wash, wheels, trim finish, glass, tires, and a sharper exterior presentation.",
    image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=900&q=88",
    prices: {
      Sedan: 100,
      SUV: 120,
      Truck: 140,
    },
  },
  {
    title: "Window Tint",
    code: "WT",
    tone: "Privacy + comfort",
    description: "A cleaner profile, heat control, and a more finished cabin feel.",
    image: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?auto=format&fit=crop&w=900&q=88",
    startingPrice: 200,
  },
  {
    title: "Ceramic Coating",
    code: "CC",
    tone: "Protection",
    description: "Surface prep and coating requests for stronger gloss, easier washing, and durable protection.",
    image: "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=900&q=88",
    startingPrice: 500,
  },
  {
    title: "Paint Correction",
    code: "PC",
    tone: "Clarity work",
    description: "Polishing and correction work for swirls, haze, oxidation, and deeper paint clarity.",
    image: "https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?auto=format&fit=crop&w=900&q=88",
    startingPrice: 100,
  },
] as const;

export type VehicleType = (typeof vehicleTypes)[number];
export type BookingService = (typeof pricedServices)[number]["title"];

export type BookingDetailSelection = {
  service: BookingService;
  vehicleType: VehicleType;
  notes?: string;
};

export type BookingDetailEstimate = BookingDetailSelection & {
  lineNumber: number;
  estimatedPrice: string;
  basePrice: string;
  discountPercent: number;
};

export type BookingEstimate = {
  details: BookingDetailEstimate[];
  estimatedPrice: string;
  totalAmount: number;
  hasStartingAtPricing: boolean;
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
    const startingPrice = Math.min(...Object.values(servicePricing.prices));
    return `Starting at $${startingPrice}`;
  }

  return `Starting at $${servicePricing.startingPrice}+`;
}

export function buildBookingEstimate(details: BookingDetailSelection[]): BookingEstimate {
  const normalizedDetails = details.slice(0, 2).map((detail, index) => {
    const discountPercent = index === 1 ? 10 : 0;
    const quote = getPriceQuote(detail.service, detail.vehicleType, discountPercent);

    return {
      ...detail,
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
  };
}

function formatPrice(amount: number, isStartingAt: boolean) {
  return `${isStartingAt ? "Starting at " : ""}$${amount}${isStartingAt ? "+" : ""}`;
}
