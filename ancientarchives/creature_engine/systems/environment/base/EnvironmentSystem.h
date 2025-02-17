// systems/environment/base/EnvironmentSystem.h
#ifndef CREATURE_ENGINE_ENVIRONMENT_BASE_ENVIRONMENT_SYSTEM_H
#define CREATURE_ENGINE_ENVIRONMENT_BASE_ENVIRONMENT_SYSTEM_H

#include "creature_engine/core/CreatureCore.h"
#include "creature_engine/systems/environment/adaptation/AdaptationManager.h"
#include "creature_engine/systems/environment/stress/StressManager.h"
#include "creature_engine/systems/environment/types/data/EnvironmentalData.h"
#include <memory>
#include <optional>
#include <string>
#include <unordered_map>

namespace crescent::environment {

class EnvironmentSystem {
  public:
    // Singleton access - since this coordinates the whole environment system
    static EnvironmentSystem &getInstance() {
        static EnvironmentSystem instance;
        return instance;
    }

    // Core environment processing
    void processEnvironmentalExposure(CreatureState &creature,
                                      const std::string &environment,
                                      float deltaTime);

    // Stress management
    float getCurrentStressLevel(const std::string &creatureId,
                                const std::string &environment) const;
    void evaluateStressors(CreatureState &creature,
                           const std::string &environment);
    bool isEnvironmentLethalFor(const CreatureState &creature,
                                const std::string &environment) const;

    // Adaptation handling
    bool canAdaptToEnvironment(const CreatureState &creature,
                               const std::string &environment) const;
    std::vector<std::string>
    getPossibleAdaptations(const CreatureState &creature,
                           const std::string &environment) const;
    void attemptAdaptation(CreatureState &creature,
                           const std::string &environment);

    // Stability tracking
    bool isCreatureStable(const CreatureState &creature,
                          const std::string &environment) const;
    void processStability(CreatureState &creature,
                          const std::string &environment);

    // Resource and maintenance
    void processResourceConsumption(CreatureState &creature,
                                    const std::string &environment);
    bool hasRequiredResources(const CreatureState &creature,
                              const std::string &environment) const;

    // Environment state querying
    std::vector<std::string>
    getViableEnvironments(const CreatureState &creature) const;
    float getEnvironmentalCompatibility(const CreatureState &creature,
                                        const std::string &environment) const;

  private:
    EnvironmentSystem(); // Private constructor for singleton

    // Core subsystem managers
    std::unique_ptr<StressManager> stressManager_;
    std::unique_ptr<AdaptationManager> adaptationManager_;

    // State tracking
    std::unordered_map<std::string, EnvironmentalData> activeEnvironments_;

    // Helper methods
    void initializeSubsystems();
    void updateEnvironmentalState(const std::string &environment);
    bool validateEnvironmentalTransition(const CreatureState &creature,
                                         const std::string &fromEnv,
                                         const std::string &toEnv) const;

    // Event handling
    void onStressThresholdReached(CreatureState &creature, float stressLevel);
    void onAdaptationTriggered(CreatureState &creature,
                               const std::string &environment);
    void onEnvironmentalDeath(CreatureState &creature,
                              const std::string &environment);
};

} // namespace crescent::environment

#endif