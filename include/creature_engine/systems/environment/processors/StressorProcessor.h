// StressorProcessor.h
#ifndef CREATURE_ENGINE_ENVIRONMENT_PROCESSORS_STRESSOR_PROCESSOR_H
#define CREATURE_ENGINE_ENVIRONMENT_PROCESSORS_STRESSOR_PROCESSOR_H

#include "creature_engine/systems/environment/base/EnvironmentConstants.h"
#include "creature_engine/systems/environment/types/data/EnvironmentalStressor.h"
#include <string>
#include <unordered_set>
#include <vector>

namespace crescent {
namespace environment {

class StressorProcessor {
  public:
    static std::vector<EnvironmentalStressor>
    generateStressors(const std::string &environment);
    static float
    calculateModifiedIntensity(const EnvironmentalStressor &stressor,
                               const std::string &environment);
    static EnvironmentalStressor
    createEvolutionaryStressor(const std::string &evolutionPath);
    static void modifyStressorByTheme(EnvironmentalStressor &stressor,
                                      const std::string &theme);
    static std::vector<EnvironmentalStressor>
    combineEnvironmentStressors(const std::string &primaryEnv,
                                const std::string &secondaryEnv);
    static bool
    isLethalCombination(const std::vector<EnvironmentalStressor> &stressors);
    static float calculateCumulativeIntensity(
        const std::vector<EnvironmentalStressor> &stressors);

  private:
    static float calculateBaseStressIntensity(const std::string &environment);
    static std::unordered_set<std::string>
    generateStressorEffects(const std::string &source);
    static bool validateStressorCompatibility(const std::string &env1,
                                              const std::string &env2);
};

} // namespace environment
} // namespace crescent

#endif