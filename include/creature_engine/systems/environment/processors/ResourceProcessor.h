// ResourceProcessor.h
#ifndef CREATURE_ENGINE_ENVIRONMENT_PROCESSORS_RESOURCE_PROCESSOR_H
#define CREATURE_ENGINE_ENVIRONMENT_PROCESSORS_RESOURCE_PROCESSOR_H

#include "creature_engine/systems/environment/base/EnvironmentConstants.h"
#include "creature_engine/systems/environment/types/data/EnvironmentalData.h"
#include <string>
#include <unordered_map>

namespace crescent {
namespace environment {

class ResourceProcessor {
  public:
    static float calculateConsumptionRate(const std::string &resource,
                                          const std::string &environment);

    static bool checkResourceSufficiency(
        const std::unordered_map<std::string, float> &required,
        const std::unordered_map<std::string, float> &available);

    static float calculateResourceModifier(const std::string &resource,
                                           const std::string &environment);

    static void updateResourceUsage(EnvironmentalData &envData);

    static float getBaseResourceConsumption(const std::string &resource);

    static float
    getEnvironmentalResourceModifier(const std::string &environment,
                                     const std::string &resource);

  private:
    static float applyEnvironmentalModifiers(float baseRate,
                                             const std::string &environment);
};

} // namespace environment
} // namespace crescent

#endif