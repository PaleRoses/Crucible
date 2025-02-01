#ifndef CRESCENT_ENVIRONMENT_PROCESSOR_H
#define CRESCENT_ENVIRONMENT_PROCESSOR_H

#include "creature_engine/systems/environment/EnvironmentSystem.h"
#include <string>
#include <unordered_set>

namespace crescent {

/**
 * @brief Environmental system configuration
 */
namespace EnvironmentConstants {
constexpr float MIN_ADAPTATION_LEVEL = 0.0f;
constexpr float MAX_ADAPTATION_LEVEL = 1.0f;
constexpr float SYNTHESIS_THRESHOLD = 0.8f;
constexpr int MIN_EXPOSURE_TIME = 100;
constexpr float LETHAL_STRESS_THRESHOLD = 0.9f;
} // namespace EnvironmentConstants

/**
 * @brief Adaptation processing utilities
 */
namespace AdaptationProcessor {
/**
 * @brief Processes a specific adaptation effect
 * @param adaptation Adaptation description
 * @param data Environmental data
 * @return True if adaptation was successful
 */
bool processAdaptation(const std::string &adaptation, EnvironmentalData &data);

/**
 * @brief Checks if adaptation requirements are met
 * @param requirements Set of requirements
 * @return True if all requirements are met
 */
bool meetsRequirements(const std::unordered_set<std::string> &requirements);

/**
 * @brief Gets adaptation power level
 * @param adaptation Adaptation description
 * @param environmentData Current environmental data
 * @return Power level between 0 and 1
 */
float getAdaptationPowerLevel(const std::string &adaptation,
                              const EnvironmentalData &environmentData);

/**
 * @brief Calculate environmental stress level
 * @param stressors Current environmental stressors
 * @return Combined stress level between 0 and 1
 */
float calculateStressLevel(const std::vector<EnvironmentalStressor> &stressors);

/**
 * @brief Validate adaptation compatibility
 * @param adaptation Adaptation to check
 * @param environment Target environment
 * @return True if adaptation is compatible
 */
bool isAdaptationCompatible(const std::string &adaptation,
                            const std::string &environment);
} // namespace AdaptationProcessor

/**
 * @brief Stressor processing utilities
 */
namespace StressorProcessor {
/**
 * @brief Generate stressors for an environment
 * @param environment Target environment
 * @return Vector of generated stressors
 */
std::vector<EnvironmentalStressor>
generateStressors(const std::string &environment);

/**
 * @brief Apply modifiers to stressor intensity
 * @param stressor Stressor to modify
 * @param environment Current environment
 * @return Modified stressor intensity
 */
float calculateModifiedIntensity(const EnvironmentalStressor &stressor,
                                 const std::string &environment);

/**
 * @brief Check if stressor combination is lethal
 * @param stressors Current stressors
 * @return True if combination is lethal
 */
bool isLethalCombination(const std::vector<EnvironmentalStressor> &stressors);
} // namespace StressorProcessor

/**
 * @brief Resource calculation utilities
 */
namespace ResourceProcessor {
/**
 * @brief Calculate resource consumption rate
 * @param resource Resource type
 * @param environment Current environment
 * @return Consumption rate
 */
float calculateConsumptionRate(const std::string &resource,
                               const std::string &environment);

/**
 * @brief Check if resources are sufficient
 * @param required Required resources
 * @param available Available resources
 * @return True if resources are sufficient
 */
bool checkResourceSufficiency(
    const std::unordered_map<std::string, float> &required,
    const std::unordered_map<std::string, float> &available);
} // namespace ResourceProcessor

} // namespace crescent

#endif // CRESCENT_ENVIRONMENT_PROCESSOR_H