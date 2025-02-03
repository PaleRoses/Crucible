// systems/environment/stress/StressEffects.h
#ifndef CREATURE_ENGINE_STRESS_STRESS_EFFECTS_H
#define CREATURE_ENGINE_STRESS_STRESS_EFFECTS_H

#include "creature_engine/io/SerializationStructures.h"
#include <nlohmann/json.hpp>
#include <string>
#include <unordered_map>
#include <vector>

namespace crescent::environment {

class StressEffects {
  public:
    struct EffectConfig {
        std::string id;
        std::string
            type; // "trait_pressure", "resource_drain", "adaptation_trigger"
        float intensity;  // How strong the effect is
        float duration;   // How long it lasts
        bool isPermanent; // Whether effect persists after stress reduces
        std::vector<std::string> targets; // What this effect impacts
    };

    static StressEffects &getInstance() {
        static StressEffects instance;
        return instance;
    }

    // Effect management
    void applyEffect(const std::string &creatureId, const EffectConfig &effect);
    void removeEffect(const std::string &creatureId,
                      const std::string &effectId);
    void updateEffect(const std::string &creatureId,
                      const std::string &effectId, float newIntensity);

    // Effect queries
    std::vector<EffectConfig>
    getActiveEffects(const std::string &creatureId) const;
    bool hasEffect(const std::string &creatureId,
                   const std::string &effectId) const;
    float getEffectIntensity(const std::string &creatureId,
                             const std::string &effectId) const;

    // Effect processing
    void processEffects(const std::string &creatureId, float deltaTime);
    void clearExpiredEffects(const std::string &creatureId);

    // Effect configuration
    void addEffectType(const std::string &type,
                       const EffectConfig &defaultConfig);
    void removeEffectType(const std::string &type);

    // Configuration
    void loadFromConfig(const std::string &configPath,
                        const SerializationOptions &options = {});
    void loadFromJson(const nlohmann::json &config,
                      const SerializationOptions &options = {});
    nlohmann::json toJson(const SerializationOptions &options = {}) const;

  private:
    StressEffects() = default;

    // Track effects per creature
    std::unordered_map<std::string,
                       std::unordered_map<std::string, EffectConfig>>
        activeEffects_;

    // Default effect configurations
    std::unordered_map<std::string, EffectConfig> effectTypes_;

    // Helper methods
    void processEffectDuration(const std::string &creatureId,
                               const std::string &effectId, float deltaTime);
    bool validateEffect(const EffectConfig &effect) const;
};

} // namespace crescent::environment

#endif