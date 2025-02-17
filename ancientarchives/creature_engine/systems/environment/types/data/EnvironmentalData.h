// systems/environment/types/data/EnvironmentalData.h
#ifndef CREATURE_ENGINE_ENVIRONMENT_TYPES_DATA_ENVIRONMENTAL_DATA_H
#define CREATURE_ENGINE_ENVIRONMENT_TYPES_DATA_ENVIRONMENTAL_DATA_H

#include "EnvironmentalStressor.h"
#include "creature_engine/io/SerializationStructures.h"
#include <nlohmann/json.hpp>

namespace crescent {

struct EnvironmentalData {
    std::string environment;
    std::string creatureId; // Added to track specific creature

    // Adaptation and stress tracking
    float adaptationLevel;
    float currentStress;
    int exposureTime;
    bool isStable;

    // Stress state tracking
    struct StressState {
        float accumulatedStress;
        float stressResistance;
        std::vector<std::string> activeStressors;
        std::vector<std::string> developedResistances;
        bool isIncreasing;
    } stressState;

    // Trait and ability state
    struct ExpressionState {
        std::unordered_set<std::string> activeEffects;
        std::unordered_set<std::string> developedAbilities;
        std::unordered_set<std::string> suppressedTraits;
        std::unordered_set<std::string> enhancedTraits;
    } expressionState;

    // Resource and capacity tracking
    struct ResourceState {
        std::unordered_map<std::string, float> resourceUsage;
        std::unordered_map<std::string, float> stressImpact;
        float adaptiveCap;
        float synthesisThreshold;
    } resourceState;

    // Synthesis tracking
    struct SynthesisState {
        bool canSynthesize;
        float synthesisProgress;
        std::vector<std::string> potentialSynthesis;
        std::unordered_map<std::string, float> synthesisStability;
    } synthesisState;

    // Serialization
    nlohmann::json
    serializeToJson(const SerializationOptions &options = {}) const;
    static EnvironmentalData deserializeFromJson(const nlohmann::json &data);
};

} // namespace crescent

#endif