// systems/environment/stress/StressResponse.h
#ifndef CREATURE_ENGINE_STRESS_STRESS_RESPONSE_H
#define CREATURE_ENGINE_STRESS_STRESS_RESPONSE_H

#include "creature_engine/io/SerializationStructures.h"
#include <nlohmann/json.hpp>
#include <string>
#include <unordered_map>
#include <vector>

namespace crescent::environment {

class StressResponse {
  public:
    struct ResponseConfig {
        std::string id;
        std::string type; // "adaptation", "trait_modification", "synthesis"
        float stressThreshold; // When this response triggers
        bool consumesStress;   // Whether triggering reduces stress
        float stressReduction; // How much stress is reduced if consumed

        struct Requirements {
            std::vector<std::string> requiredTraits;
            std::vector<std::string> conflictingTraits;
            float energyCost;
            int minExposureTime;
        } requirements;

        struct Outcome {
            std::vector<std::string> grantsTraits;
            std::vector<std::string> removesTraits;
            std::vector<std::string> modifiesTraits;
            float adaptationProgress;
        } outcome;
    };

    static StressResponse &getInstance() {
        static StressResponse instance;
        return instance;
    }

    // Response management
    void registerResponse(const ResponseConfig &config);
    void removeResponse(const std::string &responseId);
    std::vector<ResponseConfig>
    getAvailableResponses(const std::string &creatureId,
                          float currentStress) const;

    // Response triggering
    bool triggerResponse(const std::string &creatureId,
                         const std::string &responseId);
    bool canTriggerResponse(const std::string &creatureId,
                            const std::string &responseId) const;

    // Response queries
    std::vector<std::string>
    getPotentialResponses(const std::string &creatureId) const;
    float getResponseProbability(const std::string &creatureId,
                                 const std::string &responseId) const;

    // Configuration
    void loadFromConfig(const std::string &configPath,
                        const SerializationOptions &options = {});
    void loadFromJson(const nlohmann::json &config,
                      const SerializationOptions &options = {});
    nlohmann::json toJson(const SerializationOptions &options = {}) const;

  private:
    StressResponse() = default;

    std::unordered_map<std::string, ResponseConfig> responses_;
    std::unordered_map<std::string, std::vector<std::string>>
        activeResponses_; // Per creature

    // Helper methods
    bool checkRequirements(const std::string &creatureId,
                           const ResponseConfig &response) const;
    void applyOutcome(const std::string &creatureId,
                      const ResponseConfig::Outcome &outcome);
    float calculateResponseSuccess(const std::string &creatureId,
                                   const ResponseConfig &response) const;
};

} // namespace crescent::environment

#endif