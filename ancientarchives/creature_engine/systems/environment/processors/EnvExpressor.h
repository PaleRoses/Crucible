// systems/environment/types/data/EnvironmentalData.h
#ifndef CREATURE_ENGINE_ENVIRONMENT_TYPES_DATA_ENVIRONMENTAL_DATA_H
#define CREATURE_ENGINE_ENVIRONMENT_TYPES_DATA_ENVIRONMENTAL_DATA_H

#include "EnvironmentalStressor.h"
#include "creature_engine/io/SerializationStructures.h"
#include <nlohmann/json.hpp>
#include <string>
#include <unordered_map>
#include <unordered_set>
#include <vector>

namespace crescent {

/**
 * @brief Tracks a creature's adaptation state in an environment
 */
struct EnvironmentalData {
    std::string environment; // Environment being adapted to
    float adaptationLevel;   // Current adaptation level (0-1)
    int exposureTime;        // Time spent in environment

    // Active states
    std::unordered_set<std::string>
        activeEffects; // Current environmental effects
    std::unordered_set<std::string>
        developedAbilities; // Abilities gained from adaptation
    std::unordered_set<std::string>
        currentWeaknesses; // Current vulnerabilities

    // Resource management
    std::unordered_map<std::string, float>
        resourceUsage; // Resource consumption rates
    std::vector<EnvironmentalStressor>
        activeStressors; // Active environmental pressures

    // Synthesis state
    bool canSynthesizeWith; // Whether synthesis is possible

    nlohmann::json
    serializeToJson(const SerializationOptions &options = {}) const;
    static EnvironmentalData deserializeFromJson(const nlohmann::json &data);
};

} // namespace crescent

#endif