// processors/AdaptationProcessor.h
#ifndef CREATURE_ENGINE_ENVIRONMENT_PROCESSORS_ADAPTATION_PROCESSOR_H
#define CREATURE_ENGINE_ENVIRONMENT_PROCESSORS_ADAPTATION_PROCESSOR_H

#include "creature_engine/systems/environment/base/EnvironmentConstants.h"
#include "creature_engine/systems/environment/interfaces/IEnvironmentProcessor.h"
#include "creature_engine/systems/environment/types/data/EnvironmentalData.h"
#include "creature_engine/systems/environment/types/data/EnvironmentalStressor.h"
#include <string>
#include <unordered_map>
#include <unordered_set>
#include <vector>

namespace crescent::environment {

class AdaptationProcessor : public IEnvironmentProcessor {
  public:
    AdaptationProcessor();

    // IEnvironmentProcessor interface implementation
    void process(EnvironmentalData &data) override;
    bool canProcess(const EnvironmentalData &data) const override;
    std::unordered_map<std::string, float>
    getResourceRequirements() const override;
    std::string getProcessorName() const override;
    bool configure(
        const std::unordered_map<std::string, std::string> &config) override;
    bool isValid() const override;

    // Existing AdaptationProcessor methods
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

  protected:
    void logProcessorActivity(const std::string &message,
                              const std::string &level = "INFO") const override;

  private:
    static float calculateAdaptationProgress(const EnvironmentalData &data);
    bool initialized_;
    std::unordered_map<std::string, std::string> configuration_;
};

} // namespace crescent::environment

#endif