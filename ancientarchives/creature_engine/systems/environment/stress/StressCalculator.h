// systems/environment/stress/StressCalculator.h
#ifndef CREATURE_ENGINE_STRESS_STRESS_CALCULATOR_H
#define CREATURE_ENGINE_STRESS_STRESS_CALCULATOR_H

#include "creature_engine/io/SerializationStructures.h"
#include "creature_engine/systems/environment/stress/StressorDefinition.h"
#include <nlohmann/json.hpp>
#include <string>
#include <unordered_map>

namespace crescent::environment {

class StressCalculator {
  public:
    static StressCalculator &getInstance() {
        static StressCalculator instance;
        return instance;
    }

    // Core calculation methods
    float calculateEffectiveStress(
        const std::string &creatureId, const std::string &environment,
        const StressorDefinition::StressorConfig &stressor) const;

    float calculateNetStress(
        const std::string &creatureId,
        const std::vector<StressorDefinition::StressorConfig> &stressors) const;

    float calculateResistanceModifier(const std::string &creatureId,
                                      const std::string &stressorType) const;

    // Stress accumulation
    float calculateAccumulationRate(
        const StressorDefinition::StressorConfig &stressor, float currentStress,
        float resistance) const;

    float
    calculateDissipationRate(const StressorDefinition::StressorConfig &stressor,
                             float currentStress,
                             float adaptiveResistance) const;

    // Environmental modifiers
    void addEnvironmentalModifier(const std::string &environment,
                                  const std::string &stressorType,
                                  float modifier);

    void removeEnvironmentalModifier(const std::string &environment,
                                     const std::string &stressorType);

    // Configuration
    void loadFromConfig(const std::string &configPath,
                        const SerializationOptions &options = {});
    void loadFromJson(const nlohmann::json &config,
                      const SerializationOptions &options = {});
    nlohmann::json toJson(const SerializationOptions &options = {}) const;

  private:
    StressCalculator() = default;

    // Environmental stress modifiers
    std::unordered_map<std::string, std::unordered_map<std::string, float>>
        environmentalModifiers_;

    // Helper methods
    float applyEnvironmentalModifiers(float baseStress,
                                      const std::string &environment,
                                      const std::string &stressorType) const;

    float calculateInteractionEffects(
        const std::vector<StressorDefinition::StressorConfig> &stressors) const;
};

} // namespace crescent::environment

#endif