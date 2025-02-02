// base/EnvironmentSystem.h
#ifndef CREATURE_ENGINE_ENVIRONMENT_BASE_ENVIRONMENT_SYSTEM_H
#define CREATURE_ENGINE_ENVIRONMENT_BASE_ENVIRONMENT_SYSTEM_H

#include "creature_engine/core/CreatureCore.h"
#include "creature_engine/io/SerializationStructures.h"
#include "creature_engine/systems/environment/interfaces/IDataValidator.h"
#include "creature_engine/systems/environment/interfaces/IEnvironmentProcessor.h"
#include "creature_engine/systems/environment/types/data/EnvironmentTraitInteraction.h"
#include "creature_engine/systems/environment/types/data/EnvironmentalData.h"
#include "creature_engine/systems/environment/types/data/SynthesisCapability.h"
#include <memory>
#include <nlohmann/json.hpp>
#include <optional>
#include <string>
#include <unordered_map>
#include <vector>

namespace crescent::environment {

class EnvironmentSystem {
  public:
    // Constructor taking ownership of processors and validators
    EnvironmentSystem(
        std::unique_ptr<IEnvironmentProcessor> adaptationProcessor,
        std::unique_ptr<IEnvironmentProcessor> resourceProcessor,
        std::unique_ptr<IEnvironmentProcessor> stressorProcessor,
        std::unique_ptr<IEnvironmentProcessor> synthesisProcessor,
        std::unique_ptr<IDataValidator<EnvironmentalData>>
            environmentalDataValidator,
        std::unique_ptr<IDataValidator<EnvironmentalStressor>>
            stressorValidator,
        std::unique_ptr<IDataValidator<SynthesisCapability>> synthesisValidator,
        std::unique_ptr<IDataValidator<EnvironmentTraitInteraction>>
            traitInteractionValidator);

    // Core processing methods
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

    // Configuration
    bool configureProcessor(
        const std::string &processorName,
        const std::unordered_map<std::string, std::string> &config);
    bool addValidationRule(const std::string &dataType,
                           const std::string &field, const std::string &rule);

    // System State
    bool isValid() const;
    std::vector<std::string> getSystemErrors() const;

    // Serialization
    nlohmann::json
    serializeToJson(const SerializationOptions &options = {}) const;
    static EnvironmentSystem deserializeFromJson(const nlohmann::json &data);

  private:
    // Processor ownership
    std::unique_ptr<IEnvironmentProcessor> adaptationProcessor_;
    std::unique_ptr<IEnvironmentProcessor> resourceProcessor_;
    std::unique_ptr<IEnvironmentProcessor> stressorProcessor_;
    std::unique_ptr<IEnvironmentProcessor> synthesisProcessor_;

    // Validator ownership
    std::unique_ptr<IDataValidator<EnvironmentalData>>
        environmentalDataValidator_;
    std::unique_ptr<IDataValidator<EnvironmentalStressor>> stressorValidator_;
    std::unique_ptr<IDataValidator<SynthesisCapability>> synthesisValidator_;
    std::unique_ptr<IDataValidator<EnvironmentTraitInteraction>>
        traitInteractionValidator_;

    // State Members
    std::unordered_map<std::string, EnvironmentalData> activeEnvironments_;
    std::unordered_map<std::string, float> adaptationLevels_;
    std::vector<EnvironmentalStressor> currentStressors_;
    std::vector<std::string> systemErrors_;

    // Static Data
    static const std::unordered_map<
        std::string,
        std::unordered_map<std::string, EnvironmentTraitInteraction>>
        interactions_;

    // Core Processing Methods
    void processEnvironmentalEffects();
    void calculateSynthesisPotential();
    void updateStressors();

    // Resource Management Methods
    void updateResourceUsage(EnvironmentalData &envData);
    float getBaseResourceConsumption(const std::string &resource) const;
    float getEnvironmentalResourceModifier(const std::string &environment,
                                           const std::string &resource) const;

    // State Management Methods
    void processAdaptationCycle(EnvironmentalData &envData);
    void processAbilityDevelopment(EnvironmentalData &envData);
    void checkLethalConditions(const EnvironmentalData &envData);
    float
    calculateBaseAdaptationPotential(const std::string &environment) const;

    // Validation Methods
    bool validateEnvironmentalData(const EnvironmentalData &data);
    bool validateStressor(const EnvironmentalStressor &stressor);
    bool validateSynthesisCapability(const SynthesisCapability &capability);
    bool
    validateTraitInteraction(const EnvironmentTraitInteraction &interaction);

    // Initialization Methods
    static void initializeInteractions();
    void initializeProcessors();
    void initializeValidators();
};

} // namespace crescent::environment

#endif