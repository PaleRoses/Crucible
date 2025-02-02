// processors/ResourceProcessor.h
#ifndef CREATURE_ENGINE_ENVIRONMENT_PROCESSORS_RESOURCE_PROCESSOR_H
#define CREATURE_ENGINE_ENVIRONMENT_PROCESSORS_RESOURCE_PROCESSOR_H

#include "creature_engine/systems/environment/base/EnvironmentConstants.h"
#include "creature_engine/systems/environment/interfaces/IEnvironmentProcessor.h"
#include <string>
#include <unordered_map>

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

    // Existing ResourceProcessor methods
    static float calculateConsumptionRate(const std::string &resource,
                                          const std::string &environment);
    static bool checkResourceSufficiency(
        const std::unordered_map<std::string, float> &required,
        const std::unordered_map<std::string, float> &available);
    static float calculateResourceModifier(const std::string &resource,
                                           const std::string &environment);

  protected:
    void logProcessorActivity(const std::string &message,
                              const std::string &level = "INFO") const override;

  private:
    static float getBaseConsumptionRate(const std::string &resource);
    static float applyEnvironmentalModifiers(float baseRate,
                                             const std::string &environment);
    bool initialized_;
    std::unordered_map<std::string, std::string> configuration_;
};

} // namespace crescent::environment

#endif