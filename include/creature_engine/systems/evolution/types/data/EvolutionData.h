// types/data/EvolutionData.h - Add evolution namespace and update include
#ifndef CREATURE_ENGINE_EVOLUTION_TYPES_DATA_EVOLUTION_DATA_H
#define CREATURE_ENGINE_EVOLUTION_TYPES_DATA_EVOLUTION_DATA_H

#include "EvolutionaryPressure.h"
#include "creature_engine/io/SerializationStructures.h"
#include <nlohmann/json.hpp>
#include <string>
#include <unordered_map>
#include <unordered_set>
#include <vector>

namespace crescent {
namespace evolution {

struct EvolutionData {
    int currentStage;
    std::unordered_set<std::string> unlockedPaths;
    std::unordered_set<std::string> availableMutations;
    std::unordered_map<std::string, int> traitStrengths;
    std::vector<std::string> evolutionHistory;
    std::vector<EvolutionaryPressure> activePressures;

    nlohmann::json
    serializeToJson(const SerializationOptions &options = {}) const;
    static EvolutionData deserializeFromJson(const nlohmann::json &data);
};

} // namespace evolution
} // namespace crescent

#endif