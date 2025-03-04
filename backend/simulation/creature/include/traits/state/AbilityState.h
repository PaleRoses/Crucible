#ifndef CREATURE_ENGINE_TRAITS_STATE_ABILITY_STATE_H
#define CREATURE_ENGINE_TRAITS_STATE_ABILITY_STATE_H

#include "creature_engine/io/SerializationStructures.h"
#include "creature_engine/traits/base/TraitAbility.h"
#include "creature_engine/traits/base/TraitEnums.h"

#include <chrono>
#include <optional>
#include <string>
#include <unordered_map>
#include <vector>

namespace crescent::traits {

/**
 * @brief Tracks the manifestation state of a trait-granted ability
 */
struct AbilityManifestation {
    bool isManifested{false};
    std::vector<std::string> activeEffects;
    std::unordered_map<std::string, float> environmentalInfluences;
    std::chrono::system_clock::time_point lastStateChange;
};

/**
 * @brief Manages the state of abilities granted by traits
 */
class AbilityState {
  public:
    // Construction/Destruction
    AbilityState() = default;
    explicit AbilityState(const AbilityDefinition &definition);
    ~AbilityState() = default;

    // Prevent copying, allow moving
    AbilityState(const AbilityState &) = delete;
    AbilityState &operator=(const AbilityState &) = delete;
    AbilityState(AbilityState &&) = default;
    AbilityState &operator=(AbilityState &&) = default;

    // Core state access
    const std::string &getId() const { return id_; }
    bool isAvailable() const;
    bool isManifested() const;

    // State changes
    struct ManifestationResult {
        bool success;
        std::string message;
        std::vector<std::string> manifestedEffects;
    };

    ManifestationResult manifest();
    ManifestationResult unmanifest();

    // Environmental interaction
    void updateEnvironmentalInfluence(const std::string &environment,
                                      float influence);
    float getEnvironmentalAffinity(const std::string &environment) const;

    // Requirement checking
    bool meetsRequirements(
        const std::unordered_set<std::string> &availableTraits) const;
    std::vector<std::string> getMissingRequirements() const;

    // State queries
    struct AbilityStatus {
        bool isAvailable;
        bool isManifested;
        std::vector<std::string> activeEffects;
        std::unordered_map<std::string, float> environmentalInfluences;
        std::chrono::system_clock::time_point lastStateChange;
    };
    AbilityStatus getStatus() const;

    // Serialization
    nlohmann::json
    serializeToJson(const SerializationOptions &options = {}) const;
    static AbilityState deserializeFromJson(const nlohmann::json &data);

  private:
    // Core identification
    std::string id_;
    std::shared_ptr<const AbilityDefinition> definition_;

    // Current state
    AbilityManifestation manifestation_;

    // Internal helpers
    void notifyStateChanged();
    bool validateManifestationRequirements() const;
};

} // namespace crescent::traits

#endif // CREATURE_ENGINE_TRAITS_STATE_ABILITY_STATE_H