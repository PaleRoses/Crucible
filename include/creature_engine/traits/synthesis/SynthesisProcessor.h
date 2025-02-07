#ifndef CREATURE_ENGINE_TRAITS_SYNTHESIS_SYNTHESIS_PROCESSOR_H
#define CREATURE_ENGINE_TRAITS_SYNTHESIS_SYNTHESIS_PROCESSOR_H

#include "creature_engine/io/SerializationStructures.h"
#include "creature_engine/traits/base/TraitDefinition.h"
#include "creature_engine/traits/synthesis/SynthesisRules.h"
#include "creature_engine/traits/synthesis/SynthesisState.h"

#include <memory>
#include <mutex>
#include <string>
#include <unordered_map>
#include <vector>

namespace crescent::traits {

/**
 * @brief Result of a synthesis processing operation
 */
struct ProcessingResult {
    bool success;
    std::string message;
    std::optional<SynthesisFailureType> failureType;
    std::optional<SynthesisEvent> event;
    std::vector<std::string> warnings;
    float resultingStability;
};

/**
 * @brief Processes and coordinates trait synthesis transformations
 */
class SynthesisProcessor {
  public:
    // Construction/Destruction
    SynthesisProcessor();
    explicit SynthesisProcessor(std::shared_ptr<SynthesisRules> rules);
    ~SynthesisProcessor() = default;

    // Prevent copying, allow moving
    SynthesisProcessor(const SynthesisProcessor &) = delete;
    SynthesisProcessor &operator=(const SynthesisProcessor &) = delete;
    SynthesisProcessor(SynthesisProcessor &&) = default;
    SynthesisProcessor &operator=(SynthesisProcessor &&) = default;

    /**
     * @brief Attempts to synthesize a trait using a catalyst
     * @param trait Trait to synthesize
     * @param catalystType Type of triggering catalyst
     * @param catalystId Specific catalyst identifier
     * @param intensity Catalyst strength [0,1]
     * @return Complete processing result
     */
    ProcessingResult processSynthesis(const TraitDefinition &trait,
                                      CatalystType catalystType,
                                      const std::string &catalystId,
                                      float intensity);

    /**
     * @brief Updates all active synthesis processes
     * @param deltaTime Time elapsed since last update
     * @return Vector of completed or failed syntheses
     */
    std::vector<ProcessingResult> updateSyntheses(float deltaTime);

    /**
     * @brief Gets potential synthesis paths for a trait
     * @return Vector of valid target forms and their requirements
     */
    struct SynthesisPotential {
        std::string targetForm;
        SynthesisRequirement requirements;
        float estimatedStability;
    };
    std::vector<SynthesisPotential>
    getPotentialPaths(const TraitDefinition &trait,
                      CatalystType catalystType) const;

    /**
     * @brief Attempts to revert a trait's synthesis
     * @return Processing result including reversion details
     */
    ProcessingResult revertSynthesis(const TraitDefinition &trait);

    // State queries
    bool hasActiveSynthesis(const std::string &traitId) const;
    const SynthesisState *getSynthesisState(const std::string &traitId) const;
    std::vector<std::string> getTraitsInSynthesis() const;

    /**
     * @brief Gets statistics about synthesis processing
     */
    struct ProcessingMetrics {
        size_t activeProcesses;
        size_t completedSyntheses;
        size_t failedSyntheses;
        float averageStability;
        std::chrono::system_clock::time_point lastUpdate;
    };
    ProcessingMetrics getMetrics() const;

    // Serialization
    nlohmann::json
    serializeToJson(const SerializationOptions &options = {}) const;
    static SynthesisProcessor deserializeFromJson(const nlohmann::json &data);

  private:
    // Thread safety
    mutable std::mutex mutex_;

    // Core components
    std::shared_ptr<SynthesisRules> rules_;
    std::unordered_map<std::string, std::unique_ptr<SynthesisState>>
        activeStates_;

    // Metrics tracking
    struct MetricsData {
        size_t totalCompleted{0};
        size_t totalFailed{0};
        float stabilitySum{0.0f};
        size_t stabilityCount{0};
        std::chrono::system_clock::time_point lastUpdate;
    } metrics_;

    // Internal helpers
    ProcessingResult validateAndPrepare(const TraitDefinition &trait,
                                        const std::string &targetForm,
                                        CatalystType catalystType) const;

    void updateMetrics(const ProcessingResult &result);
    void cleanupCompletedSyntheses();
    ProcessingResult createResult(bool success, std::string message) const;
};

} // namespace crescent::traits

#endif // CREATURE_ENGINE_TRAITS_SYNTHESIS_SYNTHESIS_PROCESSOR_H