#ifndef CREATURE_EVOLUTION_H
#define CREATURE_EVOLUTION_H

#include "CreatureEnums.h"
#include "CreatureStructures.h"
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
    /**
     * @brief Checks if evolution is possible
     * @param state Current creature state
     * @return True if evolution requirements are met
     */
    static bool canEvolve(const CreatureState &state);

    /**
     * @brief Processes evolution
     * @param state Current creature state
     * @return Updated evolution data
     */
    static std::optional<EvolutionData> evolve(CreatureState &state);

    /**
     * @brief Gets available evolution paths
     * @param state Current creature state
     * @return Map of path names to their probabilities
     */
    static std::unordered_map<std::string, float>
    getAvailableEvolutionPaths(const CreatureState &state);

    /**
     * @brief Checks if mutation is possible
     * @param mutation Target mutation
     * @param state Current creature state
     * @return True if mutation is possible
     */
    static bool canMutateInto(const std::string &mutation,
                              const CreatureState &state);

    /**
     * @brief Gets mutation probability
     * @param state Current creature state
     * @return Probability between 0 and 1
     */
    static float getMutationProbability(const CreatureState &state);

  private:
    static const std::unordered_map<std::string, MutationPath> mutationPaths;

    /**
     * @brief Initializes mutation path data
     */
    static void initializeMutationPaths();

    /**
     * @brief Updates physical form for evolution
     * @param form Physical form to update
     * @param evolutionPath Selected evolution path
     */
    static void
    updatePhysicalFormForEvolution(PhysicalForm &form,
                                   const std::string &evolutionPath);

    /**
     * @brief Generates new abilities from evolution
     * @param evolutionPath Selected evolution path
     * @return Vector of new abilities
     */
    static std::vector<Ability>
    generateEvolutionaryAbilities(const std::string &evolutionPath);
};

/**
 * @brief Manages adaptation mutations
 */
class AdaptiveMutationSystem {
  public:
    /**
     * @brief Processes environmental adaptation mutation
     * @param state Current creature state
     * @param environment Target environment
     * @return True if mutation was successful
     */
    static bool processEnvironmentalMutation(CreatureState &state,
                                             const std::string &environment);

    /**
     * @brief Processes trait-based mutation
     * @param state Current creature state
     * @param trait Target trait
     * @param mutation Specific mutation
     * @return True if mutation was successful
     */
    static bool processTraitMutation(CreatureState &state,
                                     const std::string &trait,
                                     const std::string &mutation);

  private:
    /**
     * @brief Applies mutation effects
     * @param state Current creature state
     * @param mutation Mutation to apply
     */
    static void applyMutation(CreatureState &state,
                              const std::string &mutation);

    /**
     * @brief Updates creature appearance post-mutation
     * @param state Current creature state
     */
    static void updateMutatedAppearance(CreatureState &state);
};

/**
 * @brief Evolution system configuration
 */
namespace EvolutionConstants {
constexpr int MAX_EVOLUTION_STAGE = 3;
constexpr float BASE_MUTATION_CHANCE = 0.1f;
constexpr float MAX_MUTATION_CHANCE = 0.5f;
constexpr float ENVIRONMENTAL_PRESSURE_WEIGHT = 0.3f;
constexpr float THEME_PRESSURE_WEIGHT = 0.2f;
constexpr float MUTATION_PRESSURE_WEIGHT = 0.3f;
} // namespace EvolutionConstants

/**
 * @brief Utility functions for evolution calculations
 */
namespace EvolutionCalculator {
/**
 * @brief Calculates total evolutionary pressure
 * @param state Current creature state
 * @return Pressure value between 0 and 1
 */
float calculateTotalPressure(const CreatureState &state);

/**
 * @brief Calculates mutation compatibility
 * @param mutation Target mutation
 * @param state Current creature state
 * @return Compatibility score between 0 and 1
 */
float calculateMutationCompatibility(const std::string &mutation,
                                     const CreatureState &state);

/**
 * @brief Determines evolution path weights
 * @param state Current creature state
 * @return Map of path names to their weights
 */
std::unordered_map<std::string, float>
calculatePathWeights(const CreatureState &state);
} // namespace EvolutionCalculator

} // namespace crescent

#endif // CREATURE_EVOLUTION_H