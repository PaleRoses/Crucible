// systems/environment/stress/StressManager.h
#ifndef CREATURE_ENGINE_STRESS_STRESS_MANAGER_H
#define CREATURE_ENGINE_STRESS_STRESS_MANAGER_H

#include "creature_engine/io/SerializationStructures.h"
#include "creature_engine/systems/environment/stress/StressState.h"
#include "creature_engine/systems/environment/stress/StressThresholds.h"
#include "creature_engine/systems/environment/stress/StressorDefinition.h"
#include <memory>
#include <nlohmann/json.hpp>
#include <string>
#include <unordered_map>

namespace crescent::environment {

class StressManager {
  public:
    static StressManager &getInstance() {
        static StressManager instance;
        return instance;
    }

    // Core stress management
    void processEnvironmentalStress(const std::string &creatureId,
                                    const std::string &environment,
                                    float deltaTime);

    // Stress state tracking
    void initializeStressState(const std::string &creatureId);
    StressState &getStressState(const std::string &creatureId);
    void removeStressState(const std::string &creatureId);

    // Environmental stress management
    void applyEnvironmentalStressors(const std::string &creatureId,
                                     const std::string &environment);
    void removeEnvironmentalStressors(const std::string &creatureId,
                                      const std::string &environment);

    // Resistance and adaptation
    bool canResist(const std::string &creatureId,
                   const std::string &stressorType) const;
    bool shouldTriggerAdaptation(const std::string &creatureId,
                                 const std::string &stressorType) const;
    void processAdaptationTriggers(const std::string &creatureId);

    // Event callbacks
    using StressCallback = std::function<void(const std::string &, float)>;
    void setThresholdCallback(const std::string &thresholdType,
                              StressCallback callback);
    void
    setExtinctionCallback(std::function<void(const std::string &)> callback);

    // Configuration
    void loadConfig(const std::string &configPath,
                    const SerializationOptions &options = {});
    void loadFromJson(const nlohmann::json &config,
                      const SerializationOptions &options = {});
    nlohmann::json toJson(const SerializationOptions &options = {}) const;

  private:
    StressManager() = default;

    // State tracking
    std::unordered_map<std::string, StressState> creatureStressStates_;

    // Callbacks
    std::unordered_map<std::string, StressCallback> thresholdCallbacks_;
    std::function<void(const std::string &)> extinctionCallback_;

    // Helper methods
    void checkThresholds(const std::string &creatureId);
    void processStressEffects(const std::string &creatureId);
    float calculateEffectiveStress(const std::string &creatureId,
                                   const std::string &stressorType) const;
    void updateResistances(const std::string &creatureId, float deltaTime);

    // Config validation
    bool validateConfig(const nlohmann::json &config) const;
};

} // namespace crescent::environment

#endif