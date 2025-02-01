// internal/processors/AbilityProcessor.h
#ifndef CREATURE_ENGINE_INTERNAL_PROCESSORS_ABILITY_PROCESSOR_H
#define CREATURE_ENGINE_INTERNAL_PROCESSORS_ABILITY_PROCESSOR_H

#include "creature_engine/core/CreatureCore.h"
#include <vector>

namespace crescent {
namespace impl {

/**
 * @brief Processes ability-related calculations and changes
 */
class AbilityProcessor {
  public:
    static std::vector<Ability>
    generateEvolutionaryAbilities(const std::string &evolutionPath,
                                  const CreatureState &state);

    static void processEnvironmentalAbilities(CreatureState &state,
                                              const std::string &environment);

    static void processMutationAbilities(CreatureState &state,
                                         const std::string &mutation);
};

} // namespace impl
} // namespace crescent

#endif