// systems/environment/stress/StressorDefinition.h
#ifndef CREATURE_ENGINE_STRESS_STRESSOR_DEFINITION_H
#define CREATURE_ENGINE_STRESS_STRESSOR_DEFINITION_H

#include "creature_engine/io/SerializationStructures.h"
#include <nlohmann/json.hpp>
#include <optional>
#include <string>
#include <unordered_map>
#include <vector>

namespace crescent::environment {

class StressorDefinition {
  public:
    enum class StressorType {
        THERMAL,      // Temperature-based stress
        CHEMICAL,     // Chemical/toxicity stress
        PHYSICAL,     // Physical environment pressure
        RESOURCE,     // Resource scarcity stress
        COMPETITION,  // Inter-species pressure
        ENVIRONMENTAL // General environmental mismatch
    };

    struct StressorConfig {
        std::string id;
        std::string name;
        StressorType type;

        // Core characteristics
        float baseIntensity;    // Base stress level (0-1)
        float accumulationRate; // How fast it builds
        float dissipationRate;  // How fast it reduces
        bool isContinuous;      // Constant vs periodic

        // Resistance configuration
        struct ResistanceProfile {
            float baseResistance; // Default resistance level
            std::vector<std::string> resistantTraits; // Traits that help resist
            std::vector<std::string>
                vulnerableTraits; // Traits that increase vulnerability
            float adaptationRate; // How quickly resistance can be built
        } resistance;

        // Effect configuration
        struct EffectProfile {
            std::vector<std::string> possibleAdaptations;
            std::unordered_map<std::string, float> traitPressures;
            std::vector<std::string> resourceImpacts;
        } effects;
    };

    // Core methods
    static StressorDefinition &getInstance() {
        static StressorDefinition instance;
        return instance;
    }

    const StressorConfig &getStressor(const std::string &id) const;
    std::vector<StressorConfig>
    getStressorsForEnvironment(const std::string &environment) const;

    // Configuration using our serialization infrastructure
    void loadFromConfig(const std::string &configPath,
                        const SerializationOptions &options = {});
    void loadFromJson(const nlohmann::json &config,
                      const SerializationOptions &options = {});
    nlohmann::json toJson(const SerializationOptions &options = {}) const;

    // Additional configuration methods
    bool addStressor(const StressorConfig &config);
    bool removeStressor(const std::string &id);
    bool updateStressor(const std::string &id, const StressorConfig &newConfig);

    // Environment mapping
    void mapStressorToEnvironment(const std::string &stressorId,
                                  const std::string &environment);
    void unmapStressorFromEnvironment(const std::string &stressorId,
                                      const std::string &environment);

  private:
    StressorDefinition(); // Private constructor

    std::unordered_map<std::string, StressorConfig> stressors_;
    std::unordered_map<std::string, std::vector<std::string>>
        environmentStressors_;

    void initializeDefaultStressors();
};

} // namespace crescent::environment

#endif