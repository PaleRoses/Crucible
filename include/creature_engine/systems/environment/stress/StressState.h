// systems/environment/stress/StressState.h
#ifndef CREATURE_ENGINE_STRESS_STRESS_STATE_H
#define CREATURE_ENGINE_STRESS_STRESS_STATE_H

#include <nlohmann/json.hpp>
#include <optional>
#include <string>
#include <unordered_map>
#include <vector>

namespace crescent::environment {

class StressState {
  public:
    // Core stress tracking structure
    struct StressProfile {
        float currentLevel;     // Current stress (0-1)
        float accumulatedLevel; // Total accumulated stress
        int exposureTime;       // Time under stress
        bool isIncreasing;      // Current trend

        // Active stressors and their levels
        struct ActiveStressor {
            std::string id;         // Reference to StressorDefinition
            float currentIntensity; // Current intensity level
            int activeTime;         // How long it's been active
            bool isContinuous;      // Is it constant or periodic
        };
        std::vector<ActiveStressor> activeStressors;

        // Validation
        bool isValid() const;

        // Serialization
        nlohmann::json toJson() const;
        static StressProfile fromJson(const nlohmann::json &j);
    };

    // Resistance tracking
    struct ResistanceProfile {
        // Per-stressor type resistance
        std::unordered_map<std::string, float> typeResistances;

        // Acquired resistance through adaptation
        struct AdaptiveResistance {
            float currentLevel;    // Current resistance level
            float acquisitionRate; // How fast resistance builds
            int timeUnderStress;   // Time spent building resistance
            std::vector<std::string>
                sourceTraits; // Traits providing resistance
        };
        std::unordered_map<std::string, AdaptiveResistance> adaptiveResistances;

        // Validation
        bool isValid() const;

        // Serialization
        nlohmann::json toJson() const;
        static ResistanceProfile fromJson(const nlohmann::json &j);
    };

    // Effect tracking
    struct EffectProfile {
        std::vector<std::string> activeAdaptations; // Current adaptations
        std::vector<std::string> pressuredTraits;   // Traits under stress

        struct AdaptationProgress {
            std::string adaptationType;
            float progress; // Progress towards adaptation (0-1)
            bool isViable;  // Can complete successfully
            std::vector<std::string> requirements; // What's needed to complete
        };
        std::vector<AdaptationProgress> ongoingAdaptations;

        // Validation
        bool isValid() const;

        // Serialization
        nlohmann::json toJson() const;
        static EffectProfile fromJson(const nlohmann::json &j);
    };

    // Core methods
    static StressState &getInstance() {
        static StressState instance;
        return instance;
    }

    void updateState(float deltaTime);
    float calculateEffectiveStress() const;
    bool isInDangerousState() const;

    // Accessors
    const StressProfile &getStressProfile() const { return stressProfile_; }
    const ResistanceProfile &getResistanceProfile() const {
        return resistanceProfile_;
    }
    const EffectProfile &getEffectProfile() const { return effectProfile_; }

    // Configuration methods
    void loadFromConfig(const std::string &configPath);
    void loadFromJson(const nlohmann::json &config);
    nlohmann::json toJson() const;

  private:
    StressState(); // Private constructor

    StressProfile stressProfile_;
    ResistanceProfile resistanceProfile_;
    EffectProfile effectProfile_;

    void updateStressProfile(float deltaTime);
    void updateResistances(float deltaTime);
    void evaluateEffects();
    bool validateState() const;
};

} // namespace crescent::environment

#endif