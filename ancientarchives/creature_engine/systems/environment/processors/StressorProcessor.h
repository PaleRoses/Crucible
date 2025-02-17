// processors/ResourceProcessor.h
#ifndef CREATURE_ENGINE_ENVIRONMENT_PROCESSORS_RESOURCE_PROCESSOR_H
#define CREATURE_ENGINE_ENVIRONMENT_PROCESSORS_RESOURCE_PROCESSOR_H

#include "creature_engine/systems/environment/interfaces/IEnvironmentProcessor.h"
#include "creature_engine/systems/environment/stress/StressEffects.h"
#include "creature_engine/systems/environment/stress/StressManager.h"
#include "creature_engine/systems/environment/types/data/EnvironmentalData.h"

namespace crescent::environment {

class ResourceProcessor : public IEnvironmentProcessor {
  public:
    ResourceProcessor();

    // IEnvironmentProcessor interface implementation
    void process(EnvironmentalData &data) override;
    bool canProcess(const EnvironmentalData &data) const override;
    std::unordered_map<std::string, float>
    getResourceRequirements() const override;
    std::string getProcessorName() const override;
    bool configure(
        const std::unordered_map<std::string, std::string> &config) override;
    bool isValid() const override;

    // Updated resource methods
    float calculateConsumptionRate(const std::string &creatureId,
                                   const std::string &resource,
                                   const EnvironmentalData &data) const;

    bool checkResourceSufficiency(const std::string &creatureId,
                                  const EnvironmentalData &data) const;

    // New stress-aware methods
    void applyStressImpact(const std::string &creatureId,
                           const std::string &resource,
                           EnvironmentalData &data);

    float getStressModifiedConsumption(const std::string &creatureId,
                                       const std::string &resource,
                                       float baseRate) const;

  protected:
    void logProcessorActivity(const std::string &message,
                              const std::string &level = "INFO") const override;

  private:
    bool initialized_;
    std::unordered_map<std::string, std::string> configuration_;

    float calculateBaseConsumption(const std::string &resource,
                                   const EnvironmentalData &data) const;

    float applyStressModifiers(const std::string &creatureId, float baseRate,
                               const EnvironmentalData &data) const;
};

} // namespace crescent::environment

#endif