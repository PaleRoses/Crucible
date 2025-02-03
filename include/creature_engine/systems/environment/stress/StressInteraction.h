// systems/environment/stress/StressInteraction.h
#ifndef CREATURE_ENGINE_STRESS_STRESS_INTERACTION_H
#define CREATURE_ENGINE_STRESS_STRESS_INTERACTION_H

#include "creature_engine/io/SerializationStructures.h"
#include <nlohmann/json.hpp>
#include <string>
#include <unordered_map>
#include <vector>

namespace crescent::environment {

class StressInteraction {
  public:
    enum class InteractionType {
        AMPLIFY,   // Stressors increase each other
        DIMINISH,  // Stressors reduce each other
        TRANSFORM, // Stressors combine into new type
        NEUTRALIZE // Stressors cancel each other
    };

    struct InteractionConfig {
        std::string stressor1;
        std::string stressor2;
        InteractionType type;
        float magnitude;        // How strong the interaction is
        std::string resultType; // For TRANSFORM interactions
        std::vector<std::string> sideEffects;
    };

    static StressInteraction &getInstance() {
        static StressInteraction instance;
        return instance;
    }

    // Interaction management
    void registerInteraction(const InteractionConfig &config);
    void removeInteraction(const std::string &stressor1,
                           const std::string &stressor2);

    // Interaction processing
    float calculateInteractionEffect(const std::string &stressor1,
                                     const std::string &stressor2,
                                     float intensity1, float intensity2) const;

    std::vector<std::string>
    getInteractionEffects(const std::string &stressor1,
                          const std::string &stressor2) const;

    // Interaction queries
    bool canInteract(const std::string &stressor1,
                     const std::string &stressor2) const;
    InteractionType getInteractionType(const std::string &stressor1,
                                       const std::string &stressor2) const;

    // Transformation handling
    std::optional<std::string>
    getTransformedStressor(const std::string &stressor1,
                           const std::string &stressor2) const;

    // Configuration
    void loadFromConfig(const std::string &configPath,
                        const SerializationOptions &options = {});
    void loadFromJson(const nlohmann::json &config,
                      const SerializationOptions &options = {});
    nlohmann::json toJson(const SerializationOptions &options = {}) const;

  private:
    StressInteraction() = default;

    std::unordered_map<std::string,
                       std::unordered_map<std::string, InteractionConfig>>
        interactions_;

    // Helper methods
    float processInteraction(const InteractionConfig &config, float intensity1,
                             float intensity2) const;
    bool validateInteraction(const InteractionConfig &config) const;
};

} // namespace crescent::environment

#endif