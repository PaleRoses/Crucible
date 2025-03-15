// src/utils/mockData.ts
// Fix the import syntax
import { createNoise2D } from 'simplex-noise';

// Define basic types for environment data
export interface Environment {
  id: string;
  type: 'Forest' | 'Jungle' | 'Drown' | 'Swamp' | 'Crag' | 'Freeze' | 'Ruin' | 'Desert';
  family: 'Verdant' | 'Deep' | 'Harsh' | 'Wastes';
  stressors: {
    ambientLight: number;  // -1 to 1 (Shadow to Light)
    temperature: number;   // -1 to 1 (Frost to Flame)
    resourceScarcity: number; // -1 to 1 (Abundance to Famine)
    etherDensity: number;  // -1 to 1 (Void to Aether)
    terrainHarshness: number; // -1 to 1 (Smooth to Jagged)
    pressure: number;      // -1 to 1 (Weightless to Crushing)
  };
  uniqueStressor: {
    name: string;
    value: number;
  };
  capacity: number;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

// Environment type mappings
const environmentTypes = [
  { type: 'Forest', family: 'Verdant' },
  { type: 'Jungle', family: 'Verdant' },
  { type: 'Drown', family: 'Deep' },
  { type: 'Swamp', family: 'Deep' },
  { type: 'Crag', family: 'Harsh' },
  { type: 'Freeze', family: 'Harsh' },
  { type: 'Ruin', family: 'Wastes' },
  { type: 'Desert', family: 'Wastes' }
] as const;

// Unique stressors by environment type
const uniqueStressors: Record<Environment['type'], string[]> = {
  'Forest': ['Canopy Cover', 'Overgrowth', 'Humidity'],
  'Jungle': ['Biodiversity', 'Density', 'Humidity'],
  'Drown': ['Pressure', 'Tides', 'Murk'],
  'Swamp': ['Mire', 'Vapors', 'Density'],
  'Crag': ['Instability', 'Winds', 'Altitude'],
  'Freeze': ['Bitter Cold', 'Ice', 'Preservation'],
  'Ruin': ['Gloom', 'Decay', 'Instability'],
  'Desert': ['Aridity', 'Exposure', 'Heat']
};

export function generateMockEnvironments(count: number): Environment[] {
  // Create a noise generator function
  const noise2D = createNoise2D();
  const environments: Environment[] = [];
  
  for (let i = 0; i < count; i++) {
    // Select random environment type
    const envTypeData = environmentTypes[Math.floor(Math.random() * environmentTypes.length)];
    const envType = envTypeData.type;
    const envFamily = envTypeData.family;
    
    // Generate stressors with some correlation to environment type
    const stressors = {
      ambientLight: normalizeSimplex(noise2D(i, 1)),
      temperature: normalizeSimplex(noise2D(i, 2)),
      resourceScarcity: normalizeSimplex(noise2D(i, 3)),
      etherDensity: normalizeSimplex(noise2D(i, 4)),
      terrainHarshness: normalizeSimplex(noise2D(i, 5)),
      pressure: normalizeSimplex(noise2D(i, 6))
    };
    
    // Apply biases based on environment type
    adjustStressorsByEnvironmentType(stressors, envType);
    
    // Select a random unique stressor for this environment
    const uniqueStressorOptions = uniqueStressors[envType];
    const uniqueStressorName = uniqueStressorOptions[Math.floor(Math.random() * uniqueStressorOptions.length)];
    
    // Calculate environment capacity
    const baseCapacity = getBaseCapacity(envType);
    const sizeModifier = 0.7 + Math.random() * 0.8; // 0.7 to 1.5
    const capacity = Math.round(baseCapacity * sizeModifier * (1 - (stressors.resourceScarcity * 0.2)));
    
    environments.push({
      id: `env-${i}`,
      type: envType,
      family: envFamily,
      stressors,
      uniqueStressor: {
        name: uniqueStressorName,
        value: (Math.random() * 2 - 1) // -1 to 1
      },
      capacity,
      position: {
        x: Math.random() * 1000,
        y: Math.random() * 1000,
        width: 100 + Math.random() * 200,
        height: 100 + Math.random() * 200
      }
    });
  }
  
  return environments;
}

// Helper functions
function normalizeSimplex(value: number): number {
  // Convert simplex noise (-1 to 1) to our -1 to 1 range
  return Math.max(-1, Math.min(1, value));
}

function adjustStressorsByEnvironmentType(
  stressors: Environment['stressors'], 
  type: Environment['type']
): void {
  switch (type) {
    case 'Forest':
      stressors.ambientLight -= 0.3; // Darker due to canopy
      stressors.resourceScarcity -= 0.4; // More abundant
      break;
    case 'Desert':
      stressors.temperature += 0.5; // Hotter
      stressors.resourceScarcity += 0.6; // More scarce
      break;
    case 'Freeze':
      stressors.temperature -= 0.7; // Colder
      break;
    // Add adjustments for other environment types
  }
}

function getBaseCapacity(type: Environment['type']): number {
  switch (type) {
    case 'Forest': return 25;
    case 'Jungle': return 30;
    case 'Drown': return 12;
    case 'Swamp': return 14;
    case 'Crag': return 11;
    case 'Freeze': return 10;
    case 'Ruin': return 10;
    case 'Desert': return 18;
    default: return 20;
  }
}