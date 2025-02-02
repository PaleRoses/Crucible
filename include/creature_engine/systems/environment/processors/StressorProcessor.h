// processors/StressorProcessor.h
#ifndef CREATURE_ENGINE_ENVIRONMENT_PROCESSORS_STRESSOR_PROCESSOR_H
#define CREATURE_ENGINE_ENVIRONMENT_PROCESSORS_STRESSOR_PROCESSOR_H

#include "creature_engine/systems/environment/base/EnvironmentConstants.h"
#include "creature_engine/systems/environment/interfaces/IEnvironmentProcessor.h"
#include "creature_engine/systems/environment/types/data/EnvironmentalData.h"
#include "creature_engine/systems/environment/types/data/EnvironmentalStressor.h"
#include <string>
#include <unordered_map>
#include <unordered_set>
#include <vector>

namespace crescent::environment {

class StressorProcessor : public IEnvironmentProcessor {
  public:
    StressorProcessor();

    // IEnvironmentProcessor interface implementation
    void process(EnvironmentalData &data) override;
    bool canProcess(const EnvironmentalData &data) const override;
    std::unordered_map<std::string, float>
    getResourceRequirements() const override;
    std::string getProcessorName() const override;
    bool configure(
        const std::unordered_map<std::string, std::string> &config) override;
    bool isValid() const override;

    // Existing StressorProcessor methods
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

  protected:
    void logProcessorActivity(const std::string &message,
                              const std::string &level = "INFO") const override;

  private:
    static float calculateBaseStressIntensity(const std::string &environment);
    static std::unordered_set<std::string>
    generateStressorEffects(const std::string &source);
    static bool validateStressorCompatibility(const std::string &env1,
                                              const std::string &env2);
    bool initialized_;
    std::unordered_map<std::string, std::string> configuration_;
};

} // namespace crescent::environment

#endif