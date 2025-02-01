// systems/environment/types/data/SynthesisCapability.h
#ifndef CREATURE_ENGINE_ENVIRONMENT_TYPES_DATA_SYNTHESIS_CAPABILITY_H
#define CREATURE_ENGINE_ENVIRONMENT_TYPES_DATA_SYNTHESIS_CAPABILITY_H

#include "creature_engine/io/SerializationStructures.h"
#include <nlohmann/json.hpp>
#include <string>
#include <unordered_map>
#include <vector>

namespace crescent {

/**
 * @brief Tracks a trait's ability to synthesize with an environment
 */
struct SynthesisCapability {
    std::string sourceTrait;     // Original trait attempting synthesis
    std::string synthesizedWith; // Environment/theme being synthesized with
    std::vector<std::string>
        grantedProperties;   // Properties gained through synthesis
    float synthesisStrength; // Integration level (0-1)

    // Resource costs for maintaining the synthesis
    std::unordered_map<std::string, float> maintenanceCosts;

    nlohmann::json
    serializeToJson(const SerializationOptions &options = {}) const;
    static SynthesisCapability deserializeFromJson(const nlohmann::json &data);
};

} // namespace crescent

#endif