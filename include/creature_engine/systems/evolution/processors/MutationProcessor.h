// systems/evolution/processors/MutationProcessor.h
#ifndef CREATURE_ENGINE_EVOLUTION_PROCESSORS_MUTATION_PROCESSOR_H
#define CREATURE_ENGINE_EVOLUTION_PROCESSORS_MUTATION_PROCESSOR_H

#include "creature_engine/core/CreatureCore.h"
#include "creature_engine/systems/evolution/base/EvolutionConstants.h"
#include "creature_engine/systems/evolution/types/data/MutationPath.h"

namespace crescent {
namespace evolution {

class MutationProcessor {
  public:
    // Moved from EvolutionProcessor.h
    static float calculateMutationCompatibility(const std::string &mutation,
                                                const CreatureState &state);
    static float calculateMutationStability(const std::string &mutation,
                                            const CreatureState &state);
    static float calculateTraitSynergy(const std::string &trait,
                                       const CreatureState &state);

    // Original methods
    static bool validateMutationRequirements(const std::string &mutation,
                                             const CreatureState &state);
    static void applyMutation(CreatureState &state, const MutationPath &path);
    static void updateMutatedAppearance(CreatureState &state);

  private:
    static float calculateBaseCompatibility(const std::string &mutation);
    static float getMutationProbabilityModifier(const CreatureState &state);
};

} // namespace evolution
} // namespace crescent

#endif