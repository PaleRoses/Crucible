// systems/evolution/base/EvolutionSystem.h
#ifndef CREATURE_ENGINE_EVOLUTION_BASE_EVOLUTION_SYSTEM_H
#define CREATURE_ENGINE_EVOLUTION_BASE_EVOLUTION_SYSTEM_H

#include "creature_engine/core/CreatureCore.h"
#include "creature_engine/core/CreatureEnums.h"
#include "creature_engine/io/SerializationStructures.h"
#include "creature_engine/systems/evolution/types/data/EvolutionData.h"
#include "creature_engine/systems/evolution/types/data/MutationPath.h"
#include <nlohmann/json.hpp>
#include <optional>
#include <string>
#include <unordered_map>
#include <unordered_set>
#include <vector>

namespace crescent {
namespace evolution {

class EvolutionSystem {
  public:
    // Evolution Methods
    static bool canEvolve(const CreatureState &state);
    static std::optional<EvolutionData> evolve(CreatureState &state);
    static std::unordered_map<std::string, float>
    getAvailableEvolutionPaths(const CreatureState &state);

    // Mutation Methods
    static bool canMutateInto(const std::string &mutation,
                              const CreatureState &state);
    static float getMutationProbability(const CreatureState &state);

    // Environmental Adaptation Mutations
    static bool processEnvironmentalMutation(CreatureState &state,
                                             const std::string &environment);

    // Trait-based Mutations
    static bool processTraitMutation(CreatureState &state,
                                     const std::string &trait,
                                     const std::string &mutation);

  private:
    static const std::unordered_map<std::string, MutationPath> mutationPaths;

    // Evolution Processing
    static void
    updatePhysicalFormForEvolution(PhysicalForm &form,
                                   const std::string &evolutionPath);
    static std::vector<Ability>
    generateEvolutionaryAbilities(const std::string &evolutionPath);
    static void initializeMutationPaths();
};

} // namespace evolution
} // namespace crescent

#endif