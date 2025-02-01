// systems/environment/types/data/EnvironmentalStressor.h
#ifndef CREATURE_ENGINE_ENVIRONMENT_TYPES_DATA_ENVIRONMENTAL_STRESSOR_H
#define CREATURE_ENGINE_ENVIRONMENT_TYPES_DATA_ENVIRONMENTAL_STRESSOR_H

#include "creature_engine/io/SerializationStructures.h"
#include <nlohmann/json.hpp>
#include <string>
#include <unordered_set>

namespace crescent {

/**
 * @brief Represents an environmental pressure or hazard
 */
struct EnvironmentalStressor {
    std::string source; // Source of the environmental stress
    float intensity;    // Stress intensity (0-1)
    std::unordered_set<std::string>
        effects;   // Active effects from this stressor
    bool isLethal; // Whether this stressor can cause fatal harm

    nlohmann::json
    serializeToJson(const SerializationOptions &options = {}) const;
    static EnvironmentalStressor
    deserializeFromJson(const nlohmann::json &data);
};

} // namespace crescent

#endif