#ifndef CRESCENT_EVOLUTION_PROCESSOR_H
#define CRESCENT_EVOLUTION_PROCESSOR_H

#include "creature_engine/systems/evolution/EvolutionSystem.h"
#include <string>
#include <unordered_map>

namespace crescent {

namespace EvolutionConstants {
constexpr int MAX_EVOLUTION_STAGE = 3;
constexpr float BASE_MUTATIONON_CHANCE = 0.1f;
constexpr float MAX_MUTATION_CHANCE = 0.5f;
constexpr float ENVIRONMENTAL_PRESSURE_WEIGHT = 0.3f;
constexpr float THEME_PRESSURE_WEIGHT = 0.2f;
constexpr float MUTATION_PRESSURE_WEIGHT = 0.3f;
} // namespace EvolutionConstants

namespace EvolutionCalculator {
// Evolution Calculations
float calculateTotalPressure(const CreatureState &state);
std::unordered_map<std::string, float>
calculatePathWeights(const CreatureState &state);
float calculateEvolutionaryFitness(const CreatureState &state);

// Mutation Calculations
float calculateMutationCompatibility(const std::string &mutation,
                                     const CreatureState &state);
float calculateMutationStability(const std::string &mutation,
                                 const CreatureState &state);
float calculateTraitSynergy(const std::string &trait,
                            const CreatureState &state);
} // namespace Evolutio_CHANCE = 0.1f;
constexpr float MAX_MUTATION_CHANCE = 0.5f;
constexpr float ENVIRONMENTAL_PRESSURE_WEIGHT = 0.3f;
constexpr float THEME_PRESSURE_WEIGHT = 0.2f;
constexpr float MUTATION_PRESSURE_WEIGHT = 0.3f;
} // namespace EvolutionConstants

namespace EvolutionCalculator {
// Evolution Calculations
float calculateTotalPressure(const CreatureState &state);
std::unordered_map<std::string, float>
calculatePathWeights(const CreatureState &state);
float calculateEvolutionaryFitness(const CreatureState &state);

// Mutation Calculations
float calculateMutationCompatibility(const std::string &mutation,
                                     const CreatureState &state);
float calculateMutationStability(const std::string &mutation,
                                 const CreatureState &state);
float calculateTraitSynergy(const std::string &trait,
                            const CreatureState &state);
} // namespace EvolutionCalculator

namespace PressureProcessor {
float calculateEnvironmentalPressure(const CreatureState &state);
float calculateThemePressure(const CreatureState &state);
float calculateMutationPressure(const CreatureState &state);
bool isPressureCritical(const std::vector<EvolutionaryPressure> &pressures);
} // namespace PressureProcessor

} // namespace crescent

#endif // CRESCENT_EVOLUTION_PROCESSOR_H