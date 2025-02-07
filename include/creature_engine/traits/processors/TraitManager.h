#ifndef CREATURE_ENGINE_TRAITS_PROCESSORS_TRAIT_MANAGER_H
#define CREATURE_ENGINE_TRAITS_PROCESSORS_TRAIT_MANAGER_H

#include "creature_engine/core/changes/FormChange.h"
#include "creature_engine/io/SerializationStructures.h"
#include "creature_engine/traits/base/TraitDefinition.h"
#include "creature_engine/traits/interfaces/ITraitProcessor.h"
#include "creature_engine/traits/interfaces/ITraitValidator.h"
#include "creature_engine/traits/state/TraitState.h"
#include "creature_engine/traits/synthesis/SynthesisProcessor.h"

#include <memory>
#include <string>
#include <unordered_map>
#include <vector>

namespace crescent::traits {

/**
 * @brief Coordinates trait lifecycle and adaptation
 */
class TraitManager {
  public:
    // Construction/Destruction
    TraitManager();
    ~TraitManager() = default;

    // Prevent copying, allow moving
    TraitManager(const TraitManager &) = delete;
    TraitManager &operator=(const TraitManager &) = delete;
    TraitManager(TraitManager &&) = default;
    TraitManager &operator=(TraitManager &&) = default;

    // Core trait operations
    struct TraitResult {
        bool success;
        std::string message;
        std::vector<std::string> sideEffects;
        std::optional<FormChange> change;
    };

    TraitResult addTrait(const std::string &traitId);
    TraitResult removeTrait(const std::string &traitId);

    // State management
    void updateTraits(float deltaTime);
    void processEnvironmentalEffects(const std::string &environment);

    // Adaptation tracking
    struct AdaptationMetrics {
        float overallAdaptation;
        std::unordered_map<std::string, float> traitContributions;
        std::vector<std::string> adaptingTraits;
        std::vector<std::string> suppressedTraits;
    };
    AdaptationMetrics getAdaptationMetrics() const;

    // Trait queries
    bool hasTrait(const std::string &traitId) const;
    const TraitState *getTraitState(const std::string &traitId) const;
    std::vector<std::string> getActiveTraits() const;

    // Environmental interaction
    float
    calculateEnvironmentalCompatibility(const std::string &environment) const;
    std::vector<std::string> getEnvironmentallyStressedTraits() const;

    // Change processing
    ChangeResult processChange(const FormChange &change);
    std::optional<FormChange> getLastChange() const;

    // Serialization
    nlohmann::json
    serializeToJson(const SerializationOptions &options = {}) const;
    static TraitManager deserializeFromJson(const nlohmann::json &data);

  private:
    // Core systems
    std::unique_ptr<ITraitProcessor> traitProcessor_;
    std::unique_ptr<ITraitValidator> traitValidator_;
    std::unique_ptr<SynthesisProcessor> synthesisProcessor_;

    // State tracking
    std::unordered_map<std::string, std::unique_ptr<TraitState>> traits_;
    std::vector<FormChange> changeHistory_;

    // Environmental tracking
    struct EnvironmentalState {
        std::string currentEnvironment;
        float exposureTime{0.0f};
        std::unordered_map<std::string, float> traitStressLevels;
    } environmentalState_;

    // Internal helpers
    void updateAdaptationMetrics();
    void processTraitInteractions();
    void cleanupInactiveTraits();
    bool validateTraitOperation(const std::string &traitId) const;
    void notifyTraitChanged(const std::string &traitId);
};

} // namespace crescent::traits

#endif // CREATURE_ENGINE_TRAITS_PROCESSORS_TRAIT_MANAGER_H