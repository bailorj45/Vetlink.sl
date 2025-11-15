// AI Feed Calculator - Rule-based logic for feed recommendations

export interface FeedInput {
  species: string;
  age: string;
  weight?: string;
  gender?: 'male' | 'female';
  activityLevel?: 'low' | 'moderate' | 'high';
  purpose?: 'meat' | 'dairy' | 'breeding' | 'general';
  pregnancyStatus?: 'pregnant' | 'lactating' | 'none';
}

export interface FeedRecommendation {
  dailyFeedAmount: {
    quantity: number;
    unit: string;
    feedType: string;
  };
  feedingSchedule: Array<{
    time: string;
    amount: number;
    unit: string;
    feedType: string;
  }>;
  nutritionalNotes: string[];
  waterRequirement: {
    quantity: number;
    unit: string;
  };
  supplements?: Array<{
    name: string;
    amount: string;
    frequency: string;
  }>;
}

const feedDatabase: Record<string, any> = {
  cattle: {
    adult: {
      general: {
        dailyFeed: { quantity: 15, unit: 'kg', feedType: 'hay/grass' },
        water: { quantity: 50, unit: 'liters' },
        schedule: [
          { time: 'Morning', amount: 7.5, unit: 'kg', feedType: 'hay/grass' },
          { time: 'Evening', amount: 7.5, unit: 'kg', feedType: 'hay/grass' },
        ],
        notes: ['Ensure access to fresh water at all times', 'Provide mineral supplements'],
      },
      dairy: {
        dailyFeed: { quantity: 20, unit: 'kg', feedType: 'hay/concentrate mix' },
        water: { quantity: 70, unit: 'liters' },
        schedule: [
          { time: 'Morning', amount: 8, unit: 'kg', feedType: 'hay/concentrate' },
          { time: 'Midday', amount: 4, unit: 'kg', feedType: 'concentrate' },
          { time: 'Evening', amount: 8, unit: 'kg', feedType: 'hay/concentrate' },
        ],
        notes: ['High-quality feed for milk production', 'Calcium supplements recommended'],
      },
      pregnant: {
        dailyFeed: { quantity: 18, unit: 'kg', feedType: 'hay/concentrate mix' },
        water: { quantity: 60, unit: 'liters' },
        schedule: [
          { time: 'Morning', amount: 9, unit: 'kg', feedType: 'hay/concentrate' },
          { time: 'Evening', amount: 9, unit: 'kg', feedType: 'hay/concentrate' },
        ],
        notes: ['Increased nutrition for pregnancy', 'Monitor body condition'],
      },
      lactating: {
        dailyFeed: { quantity: 22, unit: 'kg', feedType: 'hay/concentrate mix' },
        water: { quantity: 80, unit: 'liters' },
        schedule: [
          { time: 'Morning', amount: 9, unit: 'kg', feedType: 'hay/concentrate' },
          { time: 'Midday', amount: 4, unit: 'kg', feedType: 'concentrate' },
          { time: 'Evening', amount: 9, unit: 'kg', feedType: 'hay/concentrate' },
        ],
        notes: ['High energy feed for milk production', 'Ensure adequate protein'],
      },
    },
    young: {
      general: {
        dailyFeed: { quantity: 5, unit: 'kg', feedType: 'hay/starter feed' },
        water: { quantity: 15, unit: 'liters' },
        schedule: [
          { time: 'Morning', amount: 2.5, unit: 'kg', feedType: 'hay/starter' },
          { time: 'Evening', amount: 2.5, unit: 'kg', feedType: 'hay/starter' },
        ],
        notes: ['Starter feed for young animals', 'Gradual transition to adult feed'],
      },
    },
  },
  goat: {
    adult: {
      general: {
        dailyFeed: { quantity: 2.5, unit: 'kg', feedType: 'hay/browse' },
        water: { quantity: 5, unit: 'liters' },
        schedule: [
          { time: 'Morning', amount: 1.25, unit: 'kg', feedType: 'hay/browse' },
          { time: 'Evening', amount: 1.25, unit: 'kg', feedType: 'hay/browse' },
        ],
        notes: ['Goats prefer browse and variety', 'Mineral supplements important'],
      },
      dairy: {
        dailyFeed: { quantity: 3.5, unit: 'kg', feedType: 'hay/concentrate mix' },
        water: { quantity: 8, unit: 'liters' },
        schedule: [
          { time: 'Morning', amount: 1.5, unit: 'kg', feedType: 'hay/concentrate' },
          { time: 'Evening', amount: 2, unit: 'kg', feedType: 'hay/concentrate' },
        ],
        notes: ['High-quality feed for milk production'],
      },
    },
    young: {
      general: {
        dailyFeed: { quantity: 0.5, unit: 'kg', feedType: 'hay/starter' },
        water: { quantity: 1, unit: 'liters' },
        schedule: [
          { time: 'Morning', amount: 0.25, unit: 'kg', feedType: 'hay/starter' },
          { time: 'Evening', amount: 0.25, unit: 'kg', feedType: 'hay/starter' },
        ],
        notes: ['Starter feed for kids'],
      },
    },
  },
  sheep: {
    adult: {
      general: {
        dailyFeed: { quantity: 2, unit: 'kg', feedType: 'hay/grass' },
        water: { quantity: 4, unit: 'liters' },
        schedule: [
          { time: 'Morning', amount: 1, unit: 'kg', feedType: 'hay/grass' },
          { time: 'Evening', amount: 1, unit: 'kg', feedType: 'hay/grass' },
        ],
        notes: ['Good quality hay essential', 'Salt and mineral blocks'],
      },
    },
    young: {
      general: {
        dailyFeed: { quantity: 0.5, unit: 'kg', feedType: 'hay/starter' },
        water: { quantity: 1, unit: 'liters' },
        schedule: [
          { time: 'Morning', amount: 0.25, unit: 'kg', feedType: 'hay/starter' },
          { time: 'Evening', amount: 0.25, unit: 'kg', feedType: 'hay/starter' },
        ],
        notes: ['Starter feed for lambs'],
      },
    },
  },
  poultry: {
    adult: {
      general: {
        dailyFeed: { quantity: 0.12, unit: 'kg', feedType: 'layer feed' },
        water: { quantity: 0.25, unit: 'liters' },
        schedule: [
          { time: 'Morning', amount: 0.06, unit: 'kg', feedType: 'layer feed' },
          { time: 'Evening', amount: 0.06, unit: 'kg', feedType: 'layer feed' },
        ],
        notes: ['Layer feed for egg production', 'Grit and calcium supplements'],
      },
      meat: {
        dailyFeed: { quantity: 0.15, unit: 'kg', feedType: 'broiler feed' },
        water: { quantity: 0.3, unit: 'liters' },
        schedule: [
          { time: 'Morning', amount: 0.075, unit: 'kg', feedType: 'broiler feed' },
          { time: 'Evening', amount: 0.075, unit: 'kg', feedType: 'broiler feed' },
        ],
        notes: ['High-protein broiler feed'],
      },
    },
    young: {
      general: {
        dailyFeed: { quantity: 0.05, unit: 'kg', feedType: 'starter feed' },
        water: { quantity: 0.1, unit: 'liters' },
        schedule: [
          { time: 'Morning', amount: 0.025, unit: 'kg', feedType: 'starter feed' },
          { time: 'Evening', amount: 0.025, unit: 'kg', feedType: 'starter feed' },
        ],
        notes: ['Starter feed for chicks'],
      },
    },
  },
};

function isYoung(age: string): boolean {
  const ageLower = age.toLowerCase();
  return ageLower.includes('young') || ageLower.includes('calf') || 
         ageLower.includes('kid') || ageLower.includes('lamb') || 
         ageLower.includes('chick') || parseInt(age) < 12;
}

export function calculateFeed(input: FeedInput): FeedRecommendation {
  const { species, age, purpose = 'general', pregnancyStatus = 'none' } = input;
  const speciesLower = species.toLowerCase();
  const ageCategory = isYoung(age) ? 'young' : 'adult';
  
  const speciesData = feedDatabase[speciesLower];
  if (!speciesData) {
    // Default recommendation
    return {
      dailyFeedAmount: { quantity: 2, unit: 'kg', feedType: 'hay/grass' },
      feedingSchedule: [
        { time: 'Morning', amount: 1, unit: 'kg', feedType: 'hay/grass' },
        { time: 'Evening', amount: 1, unit: 'kg', feedType: 'hay/grass' },
      ],
      nutritionalNotes: ['Consult with a veterinarian for specific recommendations'],
      waterRequirement: { quantity: 5, unit: 'liters' },
    };
  }
  
  const ageData = speciesData[ageCategory];
  if (!ageData) {
    return {
      dailyFeedAmount: { quantity: 2, unit: 'kg', feedType: 'hay/grass' },
      feedingSchedule: [
        { time: 'Morning', amount: 1, unit: 'kg', feedType: 'hay/grass' },
        { time: 'Evening', amount: 1, unit: 'kg', feedType: 'hay/grass' },
      ],
      nutritionalNotes: ['Consult with a veterinarian for specific recommendations'],
      waterRequirement: { quantity: 5, unit: 'liters' },
    };
  }
  
  let feedData;
  if (pregnancyStatus === 'lactating' && ageData.lactating) {
    feedData = ageData.lactating;
  } else if (pregnancyStatus === 'pregnant' && ageData.pregnant) {
    feedData = ageData.pregnant;
  } else if (purpose === 'dairy' && ageData.dairy) {
    feedData = ageData.dairy;
  } else {
    feedData = ageData.general || ageData[purpose] || ageData.general;
  }
  
  // Adjust based on weight if provided
  let adjustedQuantity = feedData.dailyFeed.quantity;
  if (input.weight) {
    const weight = parseFloat(input.weight);
    if (weight && weight > 0) {
      // Simple adjustment: scale based on typical weight for species
      const typicalWeights: Record<string, number> = {
        cattle: 500,
        goat: 50,
        sheep: 60,
        poultry: 2,
      };
      const typicalWeight = typicalWeights[speciesLower] || 100;
      adjustedQuantity = (weight / typicalWeight) * feedData.dailyFeed.quantity;
    }
  }
  
  return {
    dailyFeedAmount: {
      ...feedData.dailyFeed,
      quantity: Math.round(adjustedQuantity * 10) / 10,
    },
    feedingSchedule: feedData.schedule.map((s: any) => ({
      ...s,
      amount: Math.round((s.amount * adjustedQuantity / feedData.dailyFeed.quantity) * 10) / 10,
    })),
    nutritionalNotes: feedData.notes,
    waterRequirement: feedData.water,
    supplements: feedData.supplements,
  };
}

