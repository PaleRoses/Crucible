// systems/environment/stress/StressThresholds.h
#ifndef CREATURE_ENGINE_STRESS_STRESS_THRESHOLDS_H
#define CREATURE_ENGINE_STRESS_STRESS_THRESHOLDS_H

#include "creature_engine/io/SerializationStructures.h"
#include <nlohmann/json.hpp>
#include <optional>
#include <string>
#include <unordered_map>
#include <vector>

namespace crescent::environment {

class StressThresholds {
  public:
    enum class ThresholdType {
        MINOR_ADAPTATION,  // Minor trait adjustments
        MAJOR_ADAPTATION,  // Significant trait changes
        SYNTHESIS_ENABLED, // Can begin synthesis
        EXTINCTION_RISK,   // Population at risk
        CRITICAL           // Immediate extinction risk
    };

    struct ThresholdConfig {
        float value;             // Threshold value (0-1)
        float duration;          // How long it needs to be at this level
        bool requiresContinuous; // Must be continuous or cumulative?
        std::vector<std::string> effects; // What happens at this threshold
    };

    // Singleton access
    static StressThresholds &getInstance() {
        static StressThresholds instance;
        return instance;
    }

    // Core threshold methods
    const ThresholdConfig &getThreshold(ThresholdType type) const;
    bool isThresholdExceeded(ThresholdType type, float currentStress,
                             float duration) const;
    std::optional<ThresholdType> getNextThreshold(float currentStress) const;

    // Threshold management
    void addThreshold(ThresholdType type, const ThresholdConfig &config);
    void removeThreshold(ThresholdType type);
    void updateThreshold(ThresholdType type, const ThresholdConfig &newConfig);

    // Effects management
    std::vector<std::string> getThresholdEffects(ThresholdType type) const;
    void addThresholdEffect(ThresholdType type, const std::string &effect);
    void removeThresholdEffect(ThresholdType type, const std::string &effect);

    // Configuration using serialization infrastructure
    void loadFromConfig(const std::string &configPath,
                        const SerializationOptions &options = {});
    void loadFromJson(const nlohmann::json &config,
                      const SerializationOptions &options = {});
    nlohmann::json toJson(const SerializationOptions &options = {}) const;

  private:
    StressThresholds(); // Private constructor

    std::unordered_map<ThresholdType, ThresholdConfig> thresholds_;

    // Helper methods
    void initializeDefaultThresholds();
    bool isValidThresholdConfig(const ThresholdConfig &config) const;
    ThresholdType determineNextThreshold(float currentStress) const;

    // Threshold evaluation helpers
    bool checkContinuousRequirement(ThresholdType type, float currentStress,
                                    float duration) const;
    bool checkCumulativeRequirement(ThresholdType type,
                                    float currentStress) const;
};

} // namespace crescent::environment

#endif