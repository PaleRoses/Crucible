#ifndef CREATURE_ENGINE_TRAITS_PROCESSORS_ABILITY_PROCESSOR_H
#define CREATURE_ENGINE_TRAITS_PROCESSORS_ABILITY_PROCESSOR_H

#include "creature_engine/io/SerializationStructures.h"
#include "creature_engine/traits/base/TraitAbility.h"
#include "creature_engine/traits/state/AbilityState.h"

#include <memory>
#include <mutex>
#include <string>
#include <unordered_map>
#include <vector>

namespace crescent::traits {

/**
 * @brief Key for tracking ability states
 */
struct AbilityStateKey {
    std::string abilityId;
    std::string traitId;

    bool operator==(const AbilityStateKey &other) const {
        return abilityId == other.abilityId && traitId == other.traitId;
    }

    struct Hash {
        std::size_t operator()(const AbilityStateKey &k) const {
            return std::hash<std::string>()(k.abilityId) ^
                   (std::hash<std::string>()(k.traitId) << 1);
        }
    };
};

/**
 * @brief Result of an ability operation
 */
struct AbilityResult {
    bool success;
    std::string message;
    std::vector<std::string> manifestedEffects;
    std::vector<std::string> suppressedEffects;
    std::vector<std::string> warnings;
    std::optional<std::string> failureReason;
};

/**
 * @brief Processes ability manifestations and interactions
 */
class AbilityProcessor {
  public:
    // Construction/Destruction
    AbilityProcessor();
    ~AbilityProcessor() = default;

    // Prevent copying, allow moving
    AbilityProcessor(const AbilityProcessor &) = delete;
    AbilityProcessor &operator=(const AbilityProcessor &) = delete;
    AbilityProcessor(AbilityProcessor &&) = default;
    AbilityProcessor &operator=(AbilityProcessor &&) = default;

    // Core ability operations
    AbilityResult registerAbility(const AbilityDefinition &ability);
    AbilityResult unregisterAbility(const std::string &abilityId);

    // Manifestation management
    struct ManifestationContext {
        std::string environment;
        float environmentalInfluence{0.0f};
        std::unordered_set<std::string> activeTraits;
        std::vector<std::string> activeEffects;
    };

    AbilityResult manifestAbility(const std::string &abilityId,
                                  const ManifestationContext &context);

    AbilityResult unmanifestAbility(const std::string &abilityId);

    // Environmental interaction
    struct EnvironmentalResult {
        std::vector<std::string> affectedAbilities;
        std::vector<std::string> enhancedEffects;
        std::vector<std::string> suppressedEffects;
    };

    EnvironmentalResult
    processEnvironmentalEffects(const std::string &environment,
                                float influence);

    std::vector<std::string> getEnvironmentallyAffectedAbilities() const;

    // Trait interaction
    void
    updateAvailableTraits(const std::unordered_set<std::string> &activeTraits);
    std::vector<std::string> getTraitDependentAbilities() const;

    // State queries
    bool hasAbility(const std::string &abilityId) const;
    bool isManifested(const std::string &abilityId) const;
    std::vector<std::string> getManifestableAbilities() const;

    /**
     * @brief Detailed ability status information
     */
    struct AbilityStatusInfo {
        bool isRegistered;
        bool isManifestable;
        bool isCurrentlyManifested;
        std::vector<std::string> activeEffects;
        std::vector<std::string> suppressedEffects;
        std::vector<std::string> missingRequirements;
        std::unordered_map<std::string, float> environmentalInfluences;
        std::chrono::system_clock::time_point lastStateChange;
    };
    AbilityStatusInfo getAbilityStatus(const std::string &abilityId) const;

    /**
     * @brief Processing statistics
     */
    struct ProcessingMetrics {
        size_t totalManifestations{0};
        size_t activeManifestations{0};
        size_t failedManifestations{0};
        float averageEnvironmentalInfluence{0.0f};
        std::chrono::system_clock::time_point lastUpdate;
    };
    ProcessingMetrics getMetrics() const;

    // Serialization
    nlohmann::json
    serializeToJson(const SerializationOptions &options = {}) const;
    static AbilityProcessor deserializeFromJson(const nlohmann::json &data);

  private:
    // Thread safety
    mutable std::mutex mutex_;

    // State tracking
    std::unordered_map<AbilityStateKey, std::unique_ptr<AbilityState>,
                       AbilityStateKey::Hash>
        abilities_;
    std::unordered_set<std::string> availableTraits_;

    // Environmental tracking
    struct EnvironmentalContext {
        std::string currentEnvironment;
        float influence{0.0f};
        std::vector<std::string> activeEffects;
        std::chrono::system_clock::time_point lastUpdate;
    } environmentalContext_;

    // Metrics
    ProcessingMetrics metrics_;

    // Internal helpers
    bool validateManifestationRequirements(
        const std::string &abilityId,
        const ManifestationContext &context) const;
    void updateAbilityStates();
    void updateMetrics(const AbilityResult &result);
    void notifyAbilityStateChanged(const std::string &abilityId);
    AbilityResult createResult(bool success, std::string message) const;
};

} // namespace crescent::traits

#endif // CREATURE_ENGINE_TRAITS_PROCESSORS_ABILITY_PROCESSOR_H