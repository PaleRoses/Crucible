// processors/AdaptationProcessor.h
#ifndef CREATURE_ENGINE_ENVIRONMENT_PROCESSORS_ADAPTATION_PROCESSOR_H
#define CREATURE_ENGINE_ENVIRONMENT_PROCESSORS_ADAPTATION_PROCESSOR_H

#include "creature_engine/systems/environment/interfaces/IEnvironmentProcessor.h"
#include "creature_engine/systems/environment/stress/StressHistory.h"
#include "creature_engine/systems/environment/stress/StressManager.h"
#include "creature_engine/systems/environment/stress/StressResponse.h"
#include "creature_engine/systems/environment/types/data/EnvironmentalData.h"

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

    // Updated methods to use new stress system
    bool processStressResponse(const std::string &creatureId,
                               EnvironmentalData &data);

    std::vector<std::string>
    getPotentialAdaptations(const std::string &creatureId,
                            const EnvironmentalData &data) const;

    float getAdaptationProgress(const std::string &creatureId,
                                const std::string &adaptation) const;

  protected:
    void logProcessorActivity(const std::string &message,
                              const std::string &level = "INFO") const override;

  private:
    bool initialized_;
    std::unordered_map<std::string, std::string> configuration_;

    // Helper methods
    void trackAdaptationProgress(const std::string &creatureId,
                                 const std::string &adaptation,
                                 EnvironmentalData &data);

    bool validateAdaptationRequirements(const std::string &creatureId,
                                        const std::string &adaptation,
                                        const EnvironmentalData &data) const;
};

} // namespace crescent::environment

#endif