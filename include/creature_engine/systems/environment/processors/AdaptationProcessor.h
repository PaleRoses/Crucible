// AdaptationProcessor.h
#ifndef CREATURE_ENGINE_ENVIRONMENT_PROCESSORS_ADAPTATION_PROCESSOR_H
#define CREATURE_ENGINE_ENVIRONMENT_PROCESSORS_ADAPTATION_PROCESSOR_H

#include "creature_engine/systems/environment/base/EnvironmentConstants.h"
#include "creature_engine/systems/environment/types/data/EnvironmentalData.h"
#include "creature_engine/systems/environment/types/data/EnvironmentalStressor.h"
#include <string>
#include <unordered_set>
#include <vector>

namespace crescent {
namespace environment {

class AdaptationProcessor {
  public:
    static bool processAdaptation(const std::string &adaptation,
                                  EnvironmentalData &data);
    static bool
    meetsRequirements(const std::unordered_set<std::string> &requirements);
    static float
    getAdaptationPowerLevel(const std::string &adaptation,
                            const EnvironmentalData &environmentData);
    static float
    calculateStressLevel(const std::vector<EnvironmentalStressor> &stressors);
    static bool isAdaptationCompatible(const std::string &adaptation,
                                       const std::string &environment);

  private:
    static float calculateAdaptationProgress(const EnvironmentalData &data);
};

} // namespace environment
} // namespace crescent

#endif