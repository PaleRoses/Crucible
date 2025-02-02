// types/data/MutationPath.h - Add evolution namespace
#ifndef CREATURE_ENGINE_EVOLUTION_TYPES_DATA_MUTATION_PATH_H
#define CREATURE_ENGINE_EVOLUTION_TYPES_DATA_MUTATION_PATH_H

#include "creature_engine/io/SerializationStructures.h"
#include <nlohmann/json.hpp>
#include <string>
#include <unordered_map>
#include <unordered_set>

namespace crescent {
namespace evolution {

struct MutationPath {
    std::string name;
    std::unordered_set<std::string> requirements;
    std::unordered_set<std::string> manifestations;
    std::unordered_set<std::string> grantedAbilities;
    std::unordered_map<std::string, float> traitModifiers;
    float powerLevel;

    nlohmann::json
    serializeToJson(const SerializationOptions &options = {}) const;
    static MutationPath deserializeFromJson(const nlohmann::json &data);
};

} // namespace evolution
} // namespace crescent

#endif