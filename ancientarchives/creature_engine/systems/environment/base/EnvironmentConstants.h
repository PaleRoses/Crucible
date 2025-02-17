// systems/environment/base/EnvironmentConstants.h
#ifndef CREATURE_ENGINE_ENVIRONMENT_BASE_ENVIRONMENT_CONSTANTS_H
#define CREATURE_ENGINE_ENVIRONMENT_BASE_ENVIRONMENT_CONSTANTS_H

#include <nlohmann/json.hpp>
#include <string>
#include <unordered_map>

namespace crescent::environment {

class EnvironmentConfig {
  public:
    static EnvironmentConfig &getInstance() {
        static EnvironmentConfig instance;
        return instance;
    }

    // Load configuration from file
    bool loadConfig(const std::string &configPath);

    // Stress thresholds
    float getStressThreshold(const std::string &thresholdType) const;
    float getRecoveryRate(const std::string &environmentType) const;
    float getAdaptationCost(const std::string &adaptationType) const;

    // Time constants
    int getTimeThreshold(const std::string &thresholdType) const;

    // Resource constants
    float getResourceCost(const std::string &resourceType) const;

  private:
    EnvironmentConfig() = default; // Private constructor for singleton

    nlohmann::json configData_;
    std::unordered_map<std::string, float> stressThresholds_;
    std::unordered_map<std::string, float> recoveryRates_;
    std::unordered_map<std::string, float> resourceCosts_;
    std::unordered_map<std::string, int> timeThresholds_;

    void parseConfig();
};

// Example usage:
// auto& config = EnvironmentConfig::getInstance();
// float lethalThreshold = config.getStressThreshold("lethal");

} // namespace crescent::environment

#endif