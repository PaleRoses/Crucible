#ifndef CREATURE_ENGINE_TRAITS_SYNTHESIS_SYNTHESIS_STATE_H
#define CREATURE_ENGINE_TRAITS_SYNTHESIS_SYNTHESIS_STATE_H

#include "creature_engine/core/base/CreatureEnums.h"
#include "creature_engine/io/SerializationStructures.h"
#include "creature_engine/traits/base/TraitEnums.h"

#include <chrono>
#include <memory>
#include <nlohmann/json.hpp>
#include <optional>
#include <string>
#include <unordered_map>
#include <vector>

namespace crescent::traits {

/**
 * @brief Tracks the current state and history of a trait's synthesis
 */
struct SynthesisProgress {
    float currentLevel{0.0f};         // Current synthesis progress (0-1)
    float stabilityFactor{1.0f};      // How stable the synthesis is
    float catalystAccumulation{0.0f}; // Accumulated catalyst influence
    std::chrono::system_clock::time_point lastProgress;
};

/**
 * @brief Records a specific synthesis transformation
 */
struct SynthesisEvent {
    std::string sourceForm;    // Original trait form
    std::string resultForm;    // Synthesized form
    CatalystType catalystType; // What triggered synthesis
    std::string catalystId;    // Specific catalyst
    float intensity;           // Synthesis strength
    std::chrono::system_clock::time_point timestamp;
};

/**
 * @brief Complete synthesis state management for a trait
 */
class SynthesisState {
  public:
    // Construction/Destruction
    SynthesisState() = default;
    explicit SynthesisState(std::string traitId);
    ~SynthesisState() = default;

    // Core state access
    const std::string &getTraitId() const { return traitId_; }
    const std::string &getCurrentForm() const { return currentForm_; }
    int getSynthesisLevel() const { return synthesisLevel_; }
    SynthesisStability getStability() const { return stability_; }

    // Progress tracking
    float getSynthesisProgress() const;
    const SynthesisProgress &getProgress() const { return progress_; }

    // Synthesis management
    bool beginSynthesis(const std::string &targetForm,
                        CatalystType catalystType,
                        const std::string &catalystId, float intensity);
    bool completeSynthesis();
    bool revertSynthesis();
    void updateProgress(float deltaTime);

    // State queries
    bool isCurrentlySynthesizing() const { return inProgress_; }
    bool canRevert() const;
    bool hasReachedMaxLevel() const;

    // History access
    const std::vector<SynthesisEvent> &getSynthesisHistory() const;
    std::optional<SynthesisEvent> getLastSynthesis() const;

    // Catalyst influence
    float getCatalystInfluence(CatalystType type) const;
    void recordCatalystExposure(CatalystType type,
                                const std::string &catalystId, float intensity);

    // Serialization
    nlohmann::json
    serializeToJson(const SerializationOptions &options = {}) const;
    static SynthesisState deserializeFromJson(const nlohmann::json &data);

  private:
    // Core identification
    std::string traitId_;
    std::string currentForm_;

    // Synthesis state
    int synthesisLevel_{0};
    SynthesisStability stability_{SynthesisStability::Stable};
    bool inProgress_{false};

    // Progress tracking
    SynthesisProgress progress_;
    std::vector<SynthesisEvent> synthesisHistory_;

    // Catalyst tracking
    struct CatalystExposure {
        float totalIntensity{0.0f};
        int exposureCount{0};
        std::chrono::system_clock::time_point lastExposure;
    };
    std::unordered_map<CatalystType,
                       std::unordered_map<std::string, CatalystExposure>>
        catalystExposures_;

    // Internal helpers
    void updateStability();
    void recordSynthesisEvent(const std::string &resultForm,
                              CatalystType catalystType,
                              const std::string &catalystId, float intensity);
    void clearProgress();
};

} // namespace crescent::traits

#endif // CREATURE_ENGINE_TRAITS_SYNTHESIS_SYNTHESIS_STATE_H