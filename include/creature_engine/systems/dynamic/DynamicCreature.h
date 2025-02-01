#ifndef CRESCENT_DYNAMIC_CREATURE_H
#define CRESCENT_DYNAMIC_CREATURE_H

#include "creature_engine/core/CreatureCore.h"
#include "creature_engine/core/CreatureEnums.h"
#include "creature_engine/core/CreatureExceptions.h"
#include "creature_engine/systems/CreatureTheme.h"
#include "creature_engine/systems/dynamic/EventSystem.h"
#include "creature_engine/systems/environment/EnvironmentSystem.h"
#include "creature_engine/systems/evolution/EvolutionSystem.h"
#include <random>

namespace crescent {

/**
 * @brief Main class for dynamic creature generation and management
 */
class DynamicCreature : protected EventSystem {
  public:
    // Construction & Generation
    DynamicCreature(const std::string &primaryTrait,
                    const std::string &baseName = "");

    static DynamicCreature
    generateRandomCreature(const std::string &preferredEnvironment = "",
                           int evolutionLevel = 0, bool fullyEvolved = false);

    static DynamicCreature
    generateForEnvironment(const std::string &environment);

    static DynamicCreature deserializeFromJson(const nlohmann::json &data,
                                               bool validateData = true,
                                               bool repairInvalid = false);

    // Core Evolution Interface
    void processTimeInEnvironment(const std::string &environment, int time);
    bool canEvolve() const;
    void evolve();
    void mutate(const std::string &catalyst = "");
    void adapt(const std::string &environment);
    void synthesize(const std::vector<std::string> &catalysts);

    // State Management
    CreatureState getCurrentState() const;
    nlohmann::json
    serializeToJson(const SerializationOptions &options = {}) const;
    bool isViable() const;
    ValidationResult validateState() const;

    // Event Interface
    using EventSystem::addEventListener;
    using EventSystem::removeAllListeners;
    using EventSystem::removeEventListener;

    // Creature Modification Interface
    bool addTheme(const std::string &theme, float initialStrength = 1.0f);
    bool removeTheme(const std::string &theme);
    bool addSecondaryTrait(const std::string &trait);
    bool addAbility(const Ability &ability);
    void removeAbility(const std::string &abilityName);

    // Query Interface
    bool canMutateInto(const std::string &form) const;
    bool canSurviveIn(const std::string &environment) const;
    float getMutationProbability() const;
    float getTraitDominance(const std::string &trait) const;
    ThemeEffect getCurrentThemeEffect() const;
    std::vector<Ability> getAbilitiesByType(AbilityType type) const;

    // Collection Getters
    std::unordered_set<std::string> getPossibleMutations() const;
    std::unordered_set<std::string> getPreferredEnvironments() const;
    std::unordered_set<std::string> getSuggestedThemes() const;

  private:
    CreatureState state;
    std::mt19937 gen;

    // Static Data
    static const std::unordered_map<std::string, TraitDefinition> baseTraits;
    static const std::unordered_map<std::string, ThemeDefinition> themes;
    static const std::unordered_map<std::string, std::vector<std::string>>
        traitCombinations;

    // State Management
    void updatePhysicalForm();
    void updateBehavior();
    void processEvolutionaryChange(const std::string &trigger);

    // Event Management
    void emitStateChange(const std::string &changeType,
                         const nlohmann::json &details = nlohmann::json());
    void emitEvolutionEvent(const std::string &evolutionType,
                            const nlohmann::json &details = nlohmann::json());
};

} // namespace crescent

#endif // CRESCENT_DYNAMIC_CREATURE_H