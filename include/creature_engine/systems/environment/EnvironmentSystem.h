#ifndef CRESCENT_ENVIRONMENT_SYSTEM_H
#define CRESCENT_ENVIRONMENT_SYSTEM_H

#include "creature_engine/core/CreatureCore.h"
#include "creature_engine/core/CreatureEnums.h"
#include "creature_engine/io/SerializationStructures.h" // For SerializationOptions
#include <nlohmann/json.hpp>
#include <optional>
#include <string>
#include <unordered_map>
#include <unordered_set>
#include <vector>

namespace crescent {

/**
 * @brief Represents an environmental pressure or hazard
 */
struct EnvironmentalStressor {
    std::string source;
    float intensity;
    std::unordered_set<std::string> effects;
    bool isLethal;

    nlohmann::json
    serializeToJson(const SerializationOptions &options = {}) const;
    static EnvironmentalStressor
    deserializeFromJson(const nlohmann::json &data);
};

struct SynthesisCapability {
    std::string sourceTrait;     // Original trait
    std::string synthesizedWith; // Environment/theme synthesized with
    std::vector<std::string>
        grantedProperties;   // Properties gained from synthesis
    float synthesisStrength; // How well integrated the synthesis is

    // Track resource/ability costs of maintaining synthesis
    std::unordered_map<std::string, float> maintenanceCosts;
};

/**
 * @brief Represents a creature's adaptation to an environment
 */
struct EnvironmentalData {
    std::string environment;
    float adaptationLevel;
    int exposureTime;
    std::unordered_set<std::string> activeEffects;
    std::unordered_set<std::string> developedAbilities;
    std::unordered_set<std::string> currentWeaknesses;
    std::unordered_map<std::string, float> resourceUsage;
    std::vector<EnvironmentalStressor> activeStressors;
    bool canSynthesizeWith;

    nlohmann::json
    serializeToJson(const SerializationOptions &options = {}) const;
    static EnvironmentalData deserializeFromJson(const nlohmann::json &data);
};

/**
 * @brief Represents interaction between environment and trait
 */
struct EnvironmentTraitInteraction {
    std::unordered_set<std::string> manifestations;
    std::unordered_set<std::string> abilities;
    std::unordered_set<std::string> adaptations;
    float affinityModifier;
    bool canSynthesize;

    nlohmann::json
    serializeToJson(const SerializationOptions &options = {}) const;
    static EnvironmentTraitInteraction
    deserializeFromJson(const nlohmann::json &data);
};

/**
 * @brief Core system managing environmental interactions and trait
 * relationships
 */
class EnvironmentSystem {
  public:
    // Synthesis methods
    bool canSynthesizeWith(const std::string &trait,
                           const std::string &environment) const;

    std::optional<SynthesisCapability>
    attemptSynthesis(const std::string &trait, const std::string &environment);

    // Get available synthesis opportunities
    std::vector<std::string>
    getViableSynthesisTargets(const std::string &trait) const;

    // Environment Processing
    std::optional<EnvironmentalData>
    processTimeInEnvironment(const std::string &environment, int time);

    bool canSynthesize(const std::vector<std::string> &catalysts = {}) const;

    // Environment State Access
    const std::unordered_map<std::string, EnvironmentalData> &
    getActiveEnvironments() const;

    std::optional<float>
    getAdaptationLevel(const std::string &environment) const;

    std::vector<EnvironmentalStressor> getCurrentStressors() const;

    // Trait Interactions
    static std::optional<EnvironmentTraitInteraction>
    getTraitInteraction(const std::string &environment,
                        const std::string &trait);

    static std::unordered_set<std::string>
    getPossibleManifestations(const std::string &environment,
                              const std::string &trait);

    static std::unordered_set<std::string>
    getPossibleAbilities(const std::string &environment,
                         const std::string &trait);

    // Serialization
    nlohmann::json
    serializeToJson(const SerializationOptions &options = {}) const;
    static EnvironmentSystem deserializeFromJson(const nlohmann::json &data);

  private:
    std::unordered_map<std::string, EnvironmentalData> activeEnvironments;
    std::unordered_map<std::string, float> adaptationLevels;
    std::vector<EnvironmentalStressor> currentStressors;

    static const std::unordered_map<
        std::string,
        std::unordered_map<std::string, EnvironmentTraitInteraction>>
        interactions;

    // Core Processing
    void processEnvironmentalEffects();
    void calculateSynthesisPotential();
    void updateStressors();

    // Internal Utilities
    float
    calculateBaseAdaptationPotential(const std::string &environment) const;
    void processAdaptationCycle(EnvironmentalData &envData);
    void processAbilityDevelopment(EnvironmentalData &envData);
    void checkLethalConditions(const EnvironmentalData &envData);

    // Resource Management
    void updateResourceUsage(EnvironmentalData &envData);
    float getBaseResourceConsumption(const std::string &resource) const;
    float getEnvironmentalResourceModifier(const std::string &environment,
                                           const std::string &resource) const;

    static void initializeInteractions();
};

} // namespace crescent

#endif // CRESCENT_ENVIRONMENT_SYSTEM_H