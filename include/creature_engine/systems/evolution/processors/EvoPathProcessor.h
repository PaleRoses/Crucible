// systems/evolution/processors/EvoPathProcessor.h
#ifndef CREATURE_ENGINE_EVOLUTION_PROCESSORS_EVO_PATH_PROCESSOR_H
#define CREATURE_ENGINE_EVOLUTION_PROCESSORS_EVO_PATH_PROCESSOR_H

#include "creature_engine/core/CreatureCore.h"
#include "creature_engine/systems/evolution/base/EvolutionConstants.h"
#include "creature_engine/systems/evolution/types/data/EvolutionData.h"
#include <string>
#include <unordered_map>

namespace crescent {
namespace evolution {

class EvoPathProcessor {
  public:
    // Moved from EvolutionProcessor.h
    static float calculateTotalPressure(const CreatureState &state);
    static std::unordered_map<std::string, float>
    calculatePathWeights(const CreatureState &state);
    static float calculateEvolutionaryFitness(const CreatureState &state);

    // Original methods
    static std::vector<std::string> getViablePaths(const CreatureState &state);
    static bool validatePathRequirements(const std::string &path,
                                         const CreatureState &state);
    static void applyEvolutionaryChanges(CreatureState &state,
                                         const std::string &path);

  private:
    static float calculateBasePathWeight(const std::string &path);
    static float applyEnvironmentalModifiers(float baseWeight,
                                             const CreatureState &state);
    static float getEvolutionaryPotential(const CreatureState &state);
};

} // namespace evolution
} // namespace crescent

#endif