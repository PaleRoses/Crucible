// systems/environment/types/data/EnvironmentalStressor.h
#ifndef CREATURE_ENGINE_ENVIRONMENT_TYPES_DATA_ENVIRONMENTAL_STRESSOR_H
#define CREATURE_ENGINE_ENVIRONMENT_TYPES_DATA_ENVIRONMENTAL_STRESSOR_H

#include "creature_engine/io/SerializationStructures.h"
#include <nlohmann/json.hpp>
#include <string>
#include <unordered_set>

namespace crescent {

/**
 * @brief Represents an environmental pressure or hazard that can drive
 * adaptation
 */
struct EnvironmentalStressor {
    // Core properties
    std::string source;     // What's causing the stress
    float intensity;        // Current stress level (0-1)
    float accumulationRate; // How fast stress builds up
    float dissipationRate;  // How fast stress reduces

    // Effect tracking
    std::unordered_set<std::string> effects; // Current active effects
    std::unordered_set<std::string>
        possibleAdaptations; // What it might trigger

    // State flags
    bool isLethal;     // Can cause extinction
    bool isContinuous; // Applies constantly vs periodically

    // Serialization
    nlohmann::json
    serializeToJson(const SerializationOptions &options = {}) const;
    static EnvironmentalStressor
    deserializeFromJson(const nlohmann::json &data);
};

} // namespace crescent

#endif