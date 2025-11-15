// AI Symptom Checker - Rule-based logic (can be replaced with actual AI model)

export interface SymptomInput {
  species: string;
  symptoms: string[];
  age?: string;
  duration?: string;
  severity?: 'mild' | 'moderate' | 'severe';
}

export interface SymptomResult {
  possibleConditions: Array<{
    condition: string;
    confidence: number;
    description: string;
    urgency: 'low' | 'medium' | 'high' | 'emergency';
    recommendations: string[];
  }>;
  generalAdvice: string;
  shouldSeeVet: boolean;
  urgency: 'low' | 'medium' | 'high' | 'emergency';
}

const symptomDatabase: Record<string, Record<string, any>> = {
  cattle: {
    'loss of appetite': {
      conditions: [
        {
          condition: 'Digestive Issues',
          confidence: 0.6,
          description: 'Loss of appetite can indicate digestive problems',
          urgency: 'medium',
          recommendations: ['Monitor water intake', 'Check for bloating', 'Observe stool consistency'],
        },
      ],
    },
    'lameness': {
      conditions: [
        {
          condition: 'Foot Rot or Injury',
          confidence: 0.7,
          description: 'Lameness often indicates foot problems or injury',
          urgency: 'medium',
          recommendations: ['Check hooves for injury', 'Keep area clean and dry', 'Limit movement'],
        },
      ],
    },
    'fever': {
      conditions: [
        {
          condition: 'Infection',
          confidence: 0.8,
          description: 'Fever indicates possible infection',
          urgency: 'high',
          recommendations: ['Monitor temperature', 'Ensure hydration', 'Isolate from other animals'],
        },
      ],
    },
    'diarrhea': {
      conditions: [
        {
          condition: 'Digestive Disorder',
          confidence: 0.75,
          description: 'Diarrhea can indicate various digestive issues',
          urgency: 'high',
          recommendations: ['Ensure clean water', 'Monitor dehydration', 'Check feed quality'],
        },
      ],
    },
  },
  goat: {
    'loss of appetite': {
      conditions: [
        {
          condition: 'Parasitic Infection',
          confidence: 0.65,
          description: 'Common in goats, may indicate parasites',
          urgency: 'medium',
          recommendations: ['Check for worms', 'Monitor behavior', 'Consider deworming'],
        },
      ],
    },
    'coughing': {
      conditions: [
        {
          condition: 'Respiratory Infection',
          confidence: 0.7,
          description: 'Coughing may indicate respiratory issues',
          urgency: 'high',
          recommendations: ['Isolate immediately', 'Monitor breathing', 'Ensure good ventilation'],
        },
      ],
    },
  },
  sheep: {
    'loss of appetite': {
      conditions: [
        {
          condition: 'Internal Parasites',
          confidence: 0.7,
          description: 'Common issue in sheep',
          urgency: 'medium',
          recommendations: ['Check fecal samples', 'Consider deworming', 'Monitor weight'],
        },
      ],
    },
  },
  poultry: {
    'lethargy': {
      conditions: [
        {
          condition: 'Disease or Stress',
          confidence: 0.65,
          description: 'Lethargy can indicate various health issues',
          urgency: 'medium',
          recommendations: ['Check environment', 'Monitor food/water intake', 'Observe flock behavior'],
        },
      ],
    },
    'reduced egg production': {
      conditions: [
        {
          condition: 'Nutritional Deficiency or Stress',
          confidence: 0.6,
          description: 'Multiple possible causes',
          urgency: 'low',
          recommendations: ['Review diet', 'Check lighting', 'Reduce stress factors'],
        },
      ],
    },
  },
};

export function checkSymptoms(input: SymptomInput): SymptomResult {
  const { species, symptoms, severity = 'moderate' } = input;
  const possibleConditions: SymptomResult['possibleConditions'] = [];
  
  const speciesData = symptomDatabase[species.toLowerCase()] || {};
  
  symptoms.forEach((symptom) => {
    const symptomData = speciesData[symptom.toLowerCase()];
    if (symptomData) {
      possibleConditions.push(...symptomData.conditions);
    }
  });
  
  // If no specific matches, provide general advice
  if (possibleConditions.length === 0) {
    possibleConditions.push({
      condition: 'General Health Concern',
      confidence: 0.5,
      description: 'Symptoms require professional evaluation',
      urgency: severity === 'severe' ? 'high' : 'medium',
      recommendations: [
        'Monitor closely',
        'Ensure clean environment',
        'Provide adequate nutrition and water',
        'Contact a veterinarian if symptoms persist',
      ],
    });
  }
  
  // Determine overall urgency
  const maxUrgency = possibleConditions.reduce((max, condition) => {
    const urgencyLevels = { low: 1, medium: 2, high: 3, emergency: 4 };
    return urgencyLevels[condition.urgency] > urgencyLevels[max] ? condition.urgency : max;
  }, 'low' as const);
  
  const shouldSeeVet = maxUrgency === 'high' || maxUrgency === 'emergency' || severity === 'severe';
  
  return {
    possibleConditions,
    generalAdvice: shouldSeeVet
      ? 'These symptoms may indicate a serious condition. Please consult a veterinarian as soon as possible.'
      : 'Monitor the animal closely and seek veterinary care if symptoms worsen or persist.',
    shouldSeeVet,
    urgency: maxUrgency,
  };
}

