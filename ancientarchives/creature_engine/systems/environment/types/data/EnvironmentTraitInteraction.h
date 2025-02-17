// systems/environment/types/data/EnvironmentTraitInteraction.h
#ifndef CREATURE_ENGINE_ENVIRONMENT_TYPES_DATA_ENVIRONMENT_TRAIT_INTERACTION_H
#define CREATURE_ENGINE_ENVIRONMENT_TYPES_DATA_ENVIRONMENT_TRAIT_INTERACTION_H

#include "creature_engine/io/SerializationStructures.h"
#include <nlohmann/json.hpp>
#include <string>
#include <unordered_set>

namespace crescent {

/**
 * @brief Defines how a trait interacts with an environment
 */
struct EnvironmentTraitInteraction {
    std::unordered_set<std::string>
        manifestations; // How trait manifests in environment
    std::unordered_set<std::string>
        abilities; // Abilities available in environment
    std::unordered_set<std::string> adaptations; // Possible adaptations
    float affinityModifier;                      // Base affinity modifier
    bool canSynthesize; // Whether synthesis is possible

    nlohmann::json
    serializeToJson(const SerializationOptions &options = {}) const;
    static EnvironmentTraitInteraction
    deserializeFromJson(const nlohmann::json &data);
};

} // namespace crescent

#endif