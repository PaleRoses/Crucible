#ifndef CREATURE_ENGINE_TRAITS_PROCESSORS_TRAIT_PROCESSOR_H
#define CREATURE_ENGINE_TRAITS_PROCESSORS_TRAIT_PROCESSOR_H

#include "creature_engine/core/changes/FormChange.h"
#include "creature_engine/io/SerializationStructures.h"
#include "creature_engine/traits/interfaces/ITraitProcessor.h"
#include "creature_engine/traits/state/TraitState.h"
#include "creature_engine/traits/validation/TraitValidator.h"

#include <memory>
#include <mutex>
#include <string>
#include <unordered_map>
#include <vector>

namespace crescent::traits {

/**
 * @brief Result of a trait processing operation
 */
struct ProcessingResult {
    bool success;
    std::string message;
    std::vector<std::string> warnings;
    std::optional<FormChange> change;
    std::vector<std::string> affectedTraits;
};

/**
 * @brief Processes and manages trait states and changes
 */
class TraitProcessor : public ITraitProcessor {
  public:
    // Construction/Destruction
    TraitProcessor();
    explicit TraitProcessor(std::shared_ptr<TraitValidator> validator);
    ~TraitProcessor() override = default;

    // Core state changes (from ITraitProcessor)
    ProcessingResult processTrait(const TraitDefinition &trait) override;
    ProcessingResult applyChange(const FormChange &change) override;
    std::optional<FormChange> getLastChange() const override;

    // Query interface (from ITraitProcessor)
    bool hasTrait(const std::string &traitId) const override;
    std::vector<std::string> getActiveTraits() const override;
    float getTraitStrength(const std::string &traitId) const override;

    /**
     * @brief Gets environmental affinity for a trait
     * @return Pair of affinity value and any environmental effects
     */
    std::pair<float, std::vector<std::string>>
    getEnvironmentalAffinity(const std::string &traitId,
                             const std::string &environment) const;

    /**
     * @brief Updates trait states based on environment
     * @return Vector of traits affected by environmental changes
     */
    std::vector<std::string>
    processEnvironmentalEffects(const std::string &environment);

    // Batch processing
    void startBatch();
    ProcessingResult commitBatch();
    void rollbackBatch();

    /**
     * @brief Processing metrics and statistics
     */
    struct ProcessingMetrics {
        size_t activeTraits{0};
        size_t pendingChanges{0};
        size_t successfulChanges{0};
        size_t failedChanges{0};
        float averageTraitStrength{0.0f};
        std::vector<std::string> recentWarnings;
        std::chrono::system_clock::time_point lastUpdate;
    };
    ProcessingMetrics getMetrics() const;

    // Serialization
    nlohmann::json
    serializeToJson(const SerializationOptions &options = {}) const override;

  private:
    // Thread safety
    mutable std::mutex mutex_;

    // Core components
    std::shared_ptr<TraitValidator> validator_;
    std::unordered_map<std::string, std::unique_ptr<TraitState>> traitStates_;

    // Change tracking
    std::vector<FormChange> changeHistory_;
    static constexpr size_t MAX_HISTORY_SIZE = 100;

    // Batch processing
    bool batchMode_{false};
    std::vector<FormChange> pendingChanges_;
    std::unordered_map<std::string, std::unique_ptr<TraitState>> batchStates_;

    // Metrics tracking
    struct MetricsData {
        size_t totalSuccessful{0};
        size_t totalFailed{0};
        float strengthSum{0.0f};
        size_t strengthCount{0};
        std::chrono::system_clock::time_point lastUpdate;
    } metrics_;

    // Processing helpers
    ProcessingResult validateChange(const FormChange &change) const;
    void applyValidatedChange(const FormChange &change);
    void recordChange(const FormChange &change);
    void pruneHistory();

    // State management
    void updateTraitState(const std::string &traitId, const FormChange &change);
    bool resolveTraitConflicts(const std::string &traitId);
    void updateMetrics(const ProcessingResult &result);
    ProcessingResult createResult(bool success, std::string message) const;
};

} // namespace crescent::traits

#endif // CREATURE_ENGINE_TRAITS_PROCESSORS_TRAIT_PROCESSOR_H