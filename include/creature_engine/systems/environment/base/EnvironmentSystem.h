#ifndef CREATURE_ENGINE_ENVIRONMENT_BASE_ENVIRONMENT_SYSTEM_H
#define CREATURE_ENGINE_ENVIRONMENT_BASE_ENVIRONMENT_SYSTEM_H

#include "creature_engine/core/CreatureCore.h"
#include "creature_engine/io/SerializationStructures.h"
#include "creature_engine/systems/environment/types/data/EnvironmentTraitInteraction.h"
#include "creature_engine/systems/environment/types/data/EnvironmentalData.h"
#include "creature_engine/systems/environment/types/data/SynthesisCapability.h"
#include <nlohmann/json.hpp>
#include <optional>
#include <string>
#include <unordered_map>
#include <vector>

namespace crescent {
namespace environment {

/**
 * @brief Core system managing environmental interactions and trait
 * relationships
 */
class EnvironmentSystem {
  public:
    // Environment Processing
    std::optional<EnvironmentalData>
    processTimeInEnvironment(const std::string &environment, int time);

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

    // Synthesis Interface
    bool canSynthesizeWith(const std::string &trait,
                           const std::string &environment) const;
    std::optional<SynthesisCapability>
    attemptSynthesis(const std::string &trait, const std::string &environment);
    std::vector<std::string>
    getViableSynthesisTargets(const std::string &trait) const;

    // Serialization
    nlohmann::json
    serializeToJson(const SerializationOptions &options = {}) const;
    static EnvironmentSystem deserializeFromJson(const nlohmann::json &data);

  private:
    // State Members
    //-----------------
    std::unordered_map<std::string, EnvironmentalData> activeEnvironments;
    std::unordered_map<std::string, float> adaptationLevels;
    std::vector<EnvironmentalStressor> currentStressors;

    // Static Data
    //-----------------
    static const std::unordered_map<
        std::string,
        std::unordered_map<std::string, EnvironmentTraitInteraction>>
        interactions;

    // Core Processing Methods
    //-----------------
    void processEnvironmentalEffects();
    void calculateSynthesisPotential();
    void updateStressors();

    // Resource Management Methods
    //-----------------
    void updateResourceUsage(EnvironmentalData &envData);
    float getBaseResourceConsumption(const std::string &resource) const;
    float getEnvironmentalResourceModifier(const std::string &environment,
                                           const std::string &resource) const;

    // State Management Methods
    //-----------------
    void processAdaptationCycle(EnvironmentalData &envData);
    void processAbilityDevelopment(EnvironmentalData &envData);
    void checkLethalConditions(const EnvironmentalData &envData);
    float
    calculateBaseAdaptationPotential(const std::string &environment) const;

    // Initialization Methods
    //-----------------
    static void initializeInteractions();
};

} // namespace environment
} // namespace crescent

#endif