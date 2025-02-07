#ifndef CREATURE_ENGINE_TRAITS_DATA_TRAIT_DATA_H
#define CREATURE_ENGINE_TRAITS_DATA_TRAIT_DATA_H

#include "creature_engine/io/SerializationStructures.h"
#include "creature_engine/traits/base/TraitEnums.h"

#include <optional>
#include <string>
#include <unordered_map>
#include <unordered_set>
#include <vector>

namespace crescent::traits {

/**
 * @brief Data structure for ability information loaded from external sources
 */
struct AbilityLoadData {
    // Core identification
    std::string id;
    std::string name;
    std::string description;
    AbilityType type;

    // Requirements and effects
    std::unordered_set<std::string> requirements;
    std::vector<std::string> manifestations;
    std::unordered_map<std::string, float> environmentalModifiers;

    // Validation
    bool validate() const;
};

/**
 * @brief Data structure for trait information loaded from external sources
 */
struct TraitLoadData {
    // Core identification
    std::string id;
    std::string name;
    std::string description;
    TraitCategory category;
    TraitOrigin origin;

    // Manifestations
    std::unordered_set<std::string> manifestations;
    std::vector<AbilityLoadData> abilities;

    // Environmental interaction
    std::unordered_map<std::string, float> environmentalAffinity;
    std::unordered_set<std::string> incompatibleTraits;

    // Synthesis potential
    struct SynthesisPotential {
        bool canSynthesize{false};
        int maxSynthesisLevel{0};
        std::vector<std::string> potentialForms;
        std::unordered_map<std::string, float> catalystThresholds;
    } synthesisPotential;

    // Metadata
    struct LoadMetadata {
        std::string source;
        int schemaVersion;
        std::chrono::system_clock::time_point loadTime;
        std::vector<std::string> tags;
    } metadata;

    // Validation
    bool validate() const;
};

/**
 * @brief Schema definition for trait data files
 */
struct TraitSchema {
    static nlohmann::json getSchema();
    static bool validateAgainstSchema(const nlohmann::json &data);
    static std::vector<std::string> getSchemaErrors(const nlohmann::json &data);
};

/**
 * @brief Factory for creating trait definitions from load data
 */
class TraitDataFactory {
  public:
    static std::unique_ptr<TraitDefinition>
    createFromLoadData(const TraitLoadData &data);

    static TraitLoadData createLoadData(const TraitDefinition &definition);

  private:
    static bool validateLoadData(const TraitLoadData &data);
    static void enrichLoadData(TraitLoadData &data);
};

} // namespace crescent::traits

#endif // CREATURE_ENGINE_TRAITS_DATA_TRAIT_DATA_H