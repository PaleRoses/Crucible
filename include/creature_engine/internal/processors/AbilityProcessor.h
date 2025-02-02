// internal/processors/AbilityProcessor.h
#ifndef CREATURE_ENGINE_INTERNAL_PROCESSORS_ABILITY_PROCESSOR_H
#define CREATURE_ENGINE_INTERNAL_PROCESSORS_ABILITY_PROCESSOR_H

#include "creature_engine/core/CreatureCore.h"
#include <vector>

namespace crescent {
namespace impl {

/**
 * @brief Reference class documenting ability modifications across the system
 *
 * This class serves as a reference point for understanding how a creature's
 * abilities can be modified. For actual implementations, see:
 *
 * - MutationProcessor::updateMutatedAbilities
 * - EvolutionProcessor::generateEvolutionaryAbilities
 * - EnvironmentProcessor::processEnvironmentalAbilities
 *
 * @note This is a documentation class - actual ability processing is handled
 * by the respective system processors
 */
class AbilityProcessor {
  public:
    // Documentation methods showing possible ability modifications
    static std::vector<Ability>
    generateEvolutionaryAbilities(const std::string &evolutionPath,
                                  const CreatureState &state) = delete;

    static void
    processEnvironmentalAbilities(CreatureState &state,
                                  const std::string &environment) = delete;

    static void processMutationAbilities(CreatureState &state,
                                         const std::string &mutation) = delete;
};

} // namespace impl
} // namespace crescent

#endif