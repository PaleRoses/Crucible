// types/data/EvolutionaryPressure.h - Add evolution namespace
#ifndef CREATURE_ENGINE_EVOLUTION_TYPES_DATA_EVOLUTIONARY_PRESSURE_H
#define CREATURE_ENGINE_EVOLUTION_TYPES_DATA_EVOLUTIONARY_PRESSURE_H

#include "creature_engine/io/SerializationStructures.h"
#include <nlohmann/json.hpp>
#include <string>
#include <unordered_map>
#include <unordered_set>

namespace crescent {
namespace evolution {

struct EvolutionaryPressure {
    std::string source;
    float intensity;
    std::unordered_set<std::string> possibleOutcomes;
    std::unordered_map<std::string, float> outcomeProbabilities;

    nlohmann::json
    serializeToJson(const SerializationOptions &options = {}) const;
    static EvolutionaryPressure deserializeFromJson(const nlohmann::json &data);
};

} // namespace evolution
} // namespace crescent

#endif