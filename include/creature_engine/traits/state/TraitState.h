#ifndef CREATURE_ENGINE_TRAITS_STATE_TRAIT_STATE_H
#define CREATURE_ENGINE_TRAITS_STATE_TRAIT_STATE_H

#include "creature_engine/io/SerializationStructures.h"
#include "creature_engine/traits/base/TraitDefinition.h"
#include "creature_engine/traits/base/TraitEnums.h"
#include "creature_engine/traits/synthesis/SynthesisState.h"

#include <chrono>
#include <memory>
#include <optional>
#include <string>
#include <unordered_map>
#include <vector>

namespace crescent::traits {

/**
 * @brief Tracks active effects and modifications to a trait
 */
struct TraitModification {
    float strengthModifier{1.0f};
    bool isSuppressed{false};
    std::vector<std::string> activeEffects;
    std::chrono::system_clock::time_point lastUpdate;
};

/**
 * @brief Manages the current state and history of a trait
 */
class TraitState {
  public:
    // Construction/Destruction
    TraitState() = default;
    explicit TraitState(const TraitDefinition &definition);
    ~TraitState() = default;

    // Prevent copying, allow moving
    TraitState(const TraitState &) = delete;
    TraitState &operator=(const TraitState &) = delete;
    TraitState(TraitState &&) = default;
    TraitState &operator=(TraitState &&) = default;

    // Core state access
    const std::string &getId() const { return id_; }
    const TraitDefinition &getDefinition() const { return *definition_; }
    float getStrength() const { return strength_; }
    bool isActive() const { return isActive_; }

    // Modification management
    struct ModificationResult {
        bool success;
        std::string message;
        std::vector<std::string> appliedEffects;
        std::optional<float> strengthChange;
    };

    ModificationResult
    applyModification(const std::string &source, float strengthModifier,
                      const std::vector<std::string> &effects = {});

    ModificationResult removeModification(const std::string &source);

    const std::unordered_map<std::string, TraitModification> &
    getActiveModifications() const {
        return modifications_;
    }

    // Environmental interaction
    float calculateEnvironmentalAffinity(const std::string &environment) const;
    void updateEnvironmentalResponse(const std::string &environment,
                                     float deltaTime);

    // State transitions
    bool activate();
    bool deactivate();
    bool suppress();
    bool unsuppress();

    // Status tracking
    struct StatusInfo {
        bool isActive;
        bool isSuppressed;
        float currentStrength;
        std::vector<std::string> activeEffects;
        std::chrono::system_clock::time_point lastStateChange;
    };
    StatusInfo getStatus() const;

    // Serialization
    nlohmann::json
    serializeToJson(const SerializationOptions &options = {}) const;
    static TraitState deserializeFromJson(const nlohmann::json &data);

  private:
    // Core identification
    std::string id_;
    std::shared_ptr<const TraitDefinition> definition_;

    // Current state
    bool isActive_{false};
    bool isSuppressed_{false};
    float strength_{1.0f};

    // Modification tracking
    std::unordered_map<std::string, TraitModification> modifications_;
    std::chrono::system_clock::time_point lastStateChange_;

    // Internal helpers
    void updateStrength();
    void cleanupExpiredModifications();
    void notifyStateChanged();
};

} // namespace crescent::traits

#endif // CREATURE_ENGINE_TRAITS_STATE_TRAIT_STATE_H