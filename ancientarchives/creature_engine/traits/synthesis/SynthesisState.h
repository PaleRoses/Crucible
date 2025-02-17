#ifndef CREATURE_ENGINE_TRAITS_SYNTHESIS_SYNTHESIS_STATE_H
#define CREATURE_ENGINE_TRAITS_SYNTHESIS_SYNTHESIS_STATE_H

#include "creature_engine/io/SerializationStructures.h"
#include "creature_engine/traits/synthesis/SynthesisEnums.h"

#include <chrono>
#include <memory>
#include <optional>
#include <string>
#include <unordered_map>
#include <vector>

namespace crescent::traits {

/**
 * @brief Tracks synthesis progress and stability. All values are in range
 * [0,1].
 */
struct SynthesisProgress {
    float completionLevel{0.0f};  // Overall synthesis completion
    float stabilityFactor{1.0f};  // Current stability value
    float catalystStrength{0.0f}; // Current catalyst influence

    std::chrono::system_clock::time_point lastUpdate;
};

/**
 * @brief Records a synthesis transformation with complete context
 */
struct SynthesisEvent {
    std::string sourceForm;
    std::string resultForm;
    CatalystType catalystType;
    std::string catalystId;
    float intensity;
    SynthesisStage stage;
    std::vector<std::string> affectedTraits; // Traits modified by this event
    std::chrono::system_clock::time_point timestamp;

    // Validation
    bool isValid() const;
};

/**
 * @brief Key for tracking catalyst influences
 */
struct CatalystKey {
    CatalystType type;
    std::string id;

    bool operator==(const CatalystKey &other) const {
        return type == other.type && id == other.id;
    }

    struct Hash {
        std::size_t operator()(const CatalystKey &k) const {
            return std::hash<std::string>()(k.id) ^
                   (std::hash<int>()(static_cast<int>(k.type)) << 1);
        }
    };
};

/**
 * @brief Tracks the influence of a specific catalyst
 */
struct CatalystInfluence {
    float currentStrength{0.0f};
    float peakStrength{0.0f};
    int exposureCount{0};
    std::chrono::system_clock::time_point lastExposure;
    std::vector<std::string>
        affectedForms; // Forms this catalyst has influenced
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

    // Prevent copying, allow moving
    SynthesisState(const SynthesisState &) = delete;
    SynthesisState &operator=(const SynthesisState &) = delete;
    SynthesisState(SynthesisState &&) = default;
    SynthesisState &operator=(SynthesisState &&) = default;

    // Core state access
    const std::string &getTraitId() const { return traitId_; }
    const std::string &getCurrentForm() const { return currentForm_; }
    SynthesisStage getCurrentStage() const { return currentStage_; }
    StabilityClass getStabilityClass() const { return stabilityClass_; }

    /**
     * @brief Attempts to begin synthesis transformation
     * @return Complete synthesis result including failure details if applicable
     */
    SynthesisResult beginSynthesis(const std::string &targetForm,
                                   CatalystType catalystType,
                                   const std::string &catalystId,
                                   float intensity);

    /**
     * @brief Updates synthesis progress with elapsed time
     * @return Current synthesis state and any triggered events
     */
    SynthesisResult progressSynthesis(float deltaTime);

    /**
     * @brief Completes current synthesis if requirements are met
     * @return Result of completion attempt including any side effects
     */
    SynthesisResult completeSynthesis();

    /**
     * @brief Records exposure to a catalyst and updates influence
     */
    void recordCatalystExposure(CatalystType type,
                                const std::string &catalystId, float intensity);

    // State queries
    bool isInProgress() const { return currentStage_ != SynthesisStage::None; }
    const SynthesisProgress &getProgress() const { return progress_; }
    const std::unordered_map<CatalystKey, CatalystInfluence,
                             CatalystKey::Hash> &
    getCatalystInfluences() const {
        return catalystInfluences_;
    }

    /**
     * @brief Gets history of synthesis events, optionally filtered
     * @param count Maximum number of events to return (0 for all)
     * @param type Optional catalyst type filter
     */
    std::vector<SynthesisEvent>
    getHistory(size_t count = 0,
               std::optional<CatalystType> type = std::nullopt) const;

    // Serialization
    nlohmann::json
    serializeToJson(const SerializationOptions &options = {}) const;
    static SynthesisState deserializeFromJson(const nlohmann::json &data);

  private:
    // Core identification
    std::string traitId_;
    std::string currentForm_;

    // Current state
    SynthesisStage currentStage_{SynthesisStage::None};
    StabilityClass stabilityClass_{StabilityClass::Stable};
    SynthesisProgress progress_;

    // Tracking
    std::vector<SynthesisEvent> history_;
    std::unordered_map<CatalystKey, CatalystInfluence, CatalystKey::Hash>
        catalystInfluences_;

    // Internal helpers
    void updateStability();
    void recordEvent(SynthesisEvent event);
    bool validateTransition(SynthesisStage newStage) const;
    void pruneHistory(size_t maxSize = 100);
};

} // namespace crescent::traits

#endif // CREATURE_ENGINE_TRAITS_SYNTHESIS_SYNTHESIS_STATE_H