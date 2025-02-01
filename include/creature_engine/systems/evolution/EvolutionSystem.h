#ifndef CRESCENT_EVOLUTION_SYSTEM_H
#define CRESCENT_EVOLUTION_SYSTEM_H

#include "creature_engine/core/CreatureCore.h"
#include "creature_engine/core/CreatureEnums.h"
#include "creature_engine/io/SerializationStructures.h"
#include <nlohmann/json.hpp>
#include <optional>
#include <string>
#include <unordered_map>
#include <unordered_set>
#include <vector>

namespace crescent {

/**
 * @brief Represents evolutionary pressure on a creature
 */
struct EvolutionaryPressure {
    std::string source;
    float intensity;
    std::unordered_set<std::string> possibleOutcomes;
    std::unordered_map<std::string, float> outcomeProbabilities;

    nlohmann::json
    serializeToJson(const SerializationOptions &options = {}) const;
    static EvolutionaryPressure deserializeFromJson(const nlohmann::json &data);
};

/**
 * @brief Tracks a creature's evolutionary progress
 */
struct EvolutionData {
    int currentStage;
    std::unordered_set<std::string> unlockedPaths;
    std::unordered_set<std::string> availableMutations;
    std::unordered_map<std::string, int> traitStrengths;
    std::vector<std::string> evolutionHistory;
    std::vector<EvolutionaryPressure> activePressures;

    nlohmann::json
    serializeToJson(const SerializationOptions &options = {}) const;
    static EvolutionData deserializeFromJson(const nlohmann::json &data);
};

/**
 * @brief Represents a specific mutation pathway
 */
struct MutationPath {
    std::string name;
    std::unordered_set<std::string> requirements;
    std::unordered_set<std::string> manifestations;
    std::unordered_set<std::string> grantedAbilities;
    std::unordered_map<std::string, float> traitModifiers;
    float powerLevel;

    nlohmann::json
    serializeToJson(const SerializationOptions &options = {}) const;
    static MutationPath deserializeFromJson(const nlohmann::json &data);
};

/**
 * @brief Manages evolution and mutation processes
 */
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

    // Mutation Processing
    static void applyMutation(CreatureState &state,
                              const std::string &mutation);
    static void updateMutatedAppearance(CreatureState &state);
    static bool validateMutationRequirements(const std::string &mutation,
                                             const CreatureState &state);
};

} // namespace crescent

#endif // CRESCENT_EVOLUTION_SYSTEM_H