#ifndef DYNAMIC_CREATURE_H
#define DYNAMIC_CREATURE_H

#include "CreatureEnums.h"
#include "CreatureEnvironment.h"
#include "CreatureEvolution.h"
#include "CreatureExceptions.h"
#include "CreatureStructures.h"
#include "CreatureTheme.h"

#include <functional>
#include <memory>
#include <random>
#include <string>
#include <unordered_map>

namespace crescent {

/**
 * @brief Main class for dynamic creature generation and management
 */
class DynamicCreature {
  public:
    using EventCallback =
        std::function<void(CreatureEvent, const nlohmann::json &)>;

    /**
     * @brief Creates a new creature with specified trait
     * @param primaryTrait Initial trait
     * @param baseName Optional name (auto-generated if empty)
     * @throws CreatureGenerationException if creation fails
     */
    DynamicCreature(const std::string &primaryTrait,
                    const std::string &baseName = "");

    /**
     * @brief Generates a random creature
     * @param preferredEnvironment Optional environment preference
     * @param evolutionLevel Initial evolution level
     * @param fullyEvolved Whether to start fully evolved
     * @return Generated creature
     */
    static DynamicCreature
    generateRandomCreature(const std::string &preferredEnvironment = "",
                           int evolutionLevel = 0, bool fullyEvolved = false);

    /**
     * @brief Generates a creature suited for an environment
     * @param environment Target environment
     * @return Generated creature
     */
    static DynamicCreature
    generateForEnvironment(const std::string &environment);

    /**
     * @brief Creates creature from JSON data
     * @param data JSON representation
     * @param validateData Whether to validate during creation
     * @param repairInvalid Whether to attempt repairs on invalid data
     * @return Constructed creature
     */
    static DynamicCreature deserializeFromJson(const nlohmann::json &data,
                                               bool validateData = true,
                                               bool repairInvalid = false);

    // Evolution and Mutation Methods
    /**
     * @brief Processes time spent in environment
     * @param environment Environment name
     * @param time Duration of exposure
     */
    void processTimeInEnvironment(const std::string &environment, int time);

    /**
     * @brief Checks if evolution is possible
     * @return True if evolution requirements are met
     */
    bool canEvolve() const;

    /**
     * @brief Triggers evolution process
     * @throws EvolutionException if evolution fails
     */
    void evolve();

    /**
     * @brief Triggers mutation process
     * @param catalyst Optional mutation catalyst
     * @throws MutationException if mutation fails
     */
    void mutate(const std::string &catalyst = "");

    /**
     * @brief Adapts to environment
     * @param environment Target environment
     */
    void adapt(const std::string &environment);

    /**
     * @brief Attempts synthesis with catalysts
     * @param catalysts Synthesis components
     */
    void synthesize(const std::vector<std::string> &catalysts);

    /**
     * @brief Gets available mutations
     * @return Set of possible mutations
     */
    std::unordered_set<std::string> getPossibleMutations() const;

    /**
     * @brief Checks if mutation is possible
     * @param form Target form
     * @return True if mutation is possible
     */
    bool canMutateInto(const std::string &form) const;

    /**
     * @brief Gets mutation probability
     * @return Probability between 0 and 1
     */
    float getMutationProbability() const;

    // Theme Management Methods
    bool addTheme(const std::string &theme, float initialStrength = 1.0f);
    bool removeTheme(const std::string &theme);
    ThemeEffect getCurrentThemeEffect() const;
    bool isThemeCompatible(const std::string &theme) const;
    std::unordered_set<std::string> getSuggestedThemes() const;
    float getThemeCompatibilityScore(const std::string &theme) const;

    // Trait Management Methods
    bool addSecondaryTrait(const std::string &trait);
    float getTraitDominance(const std::string &trait) const;
    std::unordered_set<std::string> getPossibleSecondaryTraits() const;

    // Environmental Interaction Methods
    bool canSurviveIn(const std::string &environment) const;
    std::unordered_set<std::string> getPreferredEnvironments() const;
    float getEnvironmentalStress(const std::string &environment) const;

    // State Management and Serialization
    void displayState() const;
    CreatureState getCurrentState() const;
    nlohmann::json
    serializeToJson(const SerializationOptions &options = {}) const;
    void addAbility(const Ability &ability);
    void removeAbility(const std::string &abilityName);
    std::vector<Ability> getAbilitiesByType(AbilityType type) const;
    std::string getEvolutionaryHistory() const;

    // Validation and Status
    bool isViable() const;
    std::vector<std::string> getWarnings() const;
    std::vector<std::string> getConflicts() const;
    ValidationResult validateState() const;

    // Event System
    void addEventListener(CreatureEvent event, EventCallback callback);
    void removeEventListener(CreatureEvent event);

    // Static Helper Methods
    static std::vector<std::string> getValidEnvironments();
    static std::vector<std::string> getValidTraits();
    static std::vector<std::string> getValidThemes();
    static std::vector<std::string> getPossibleAbilities();
    static nlohmann::json getEnvironmentData(const std::string &environment);

  private:
    CreatureState state;
    std::mt19937 gen; // Random number generator
    std::unordered_map<CreatureEvent, std::vector<EventCallback>>
        eventListeners;

    // Static Data Members
    static const std::unordered_map<std::string, TraitDefinition> baseTraits;
    static const std::unordered_map<std::string, ThemeDefinition> themes;
    static const std::unordered_map<std::string, std::vector<std::string>>
        traitCombinations;
    static const std::unordered_map<std::string, std::vector<Ability>>
        traitAbilities;
    static const std::unordered_map<std::string, std::vector<std::string>>
        environmentalModifiers;

    // Private Helper Methods
    std::string generateName() const;
    std::string generateDescriptiveName() const;
    void updatePhysicalForm();
    void updateBehavior();
    bool checkTraitCompatibility(const std::string &traitA,
                                 const std::string &traitB) const;
    float calculateEnvironmentalAffinity(const std::string &environment) const;
    void processEvolutionaryChange(const std::string &trigger);
    void emitEvent(CreatureEvent event, const nlohmann::json &data);

    // Static Helper Methods
    static std::string randomTrait();
    static std::string randomEnvironment();
    static PhysicalForm generateBaseForm();
    static Behavior generateBaseBehavior();
    static std::vector<std::string> generateRandomHistory(int complexity);
};

} // namespace crescent

#endif // DYNAMIC_CREATURE_H