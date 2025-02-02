// processors/SynthesisProcessor.h
#ifndef CREATURE_ENGINE_ENVIRONMENT_PROCESSORS_SYNTHESIS_PROCESSOR_H
#define CREATURE_ENGINE_ENVIRONMENT_PROCESSORS_SYNTHESIS_PROCESSOR_H

#include "creature_engine/systems/environment/base/EnvironmentConstants.h"
#include "creature_engine/systems/environment/interfaces/IEnvironmentProcessor.h"
#include "creature_engine/systems/environment/types/data/EnvironmentalData.h"
#include "creature_engine/systems/environment/types/data/SynthesisCapability.h"
#include <optional>
#include <string>
#include <unordered_map>
#include <vector>

namespace crescent::environment {

class SynthesisProcessor : public IEnvironmentProcessor {
  public:
    SynthesisProcessor();

    // IEnvironmentProcessor interface implementation
    void process(EnvironmentalData &data) override;
    bool canProcess(const EnvironmentalData &data) const override;
    std::unordered_map<std::string, float>
    getResourceRequirements() const override;
    std::string getProcessorName() const override;
    bool configure(
        const std::unordered_map<std::string, std::string> &config) override;
    bool isValid() const override;

    // Existing SynthesisProcessor methods
    static std::optional<SynthesisCapability>
    attemptSynthesis(const std::string &trait, const std::string &environment,
                     const EnvironmentalData &envData);

    static bool canInitiateSynthesis(const std::string &trait,
                                     const std::string &environment);

    static std::vector<std::string>
    getViableSynthesisTargets(const std::string &trait,
                              const EnvironmentalData &envData);

  protected:
    void logProcessorActivity(const std::string &message,
                              const std::string &level = "INFO") const override;

  private:
    static float calculateSynthesisPotential(const std::string &trait,
                                             const EnvironmentalData &envData);

    static std::unordered_map<std::string, float>
    calculateMaintenanceCosts(const std::string &trait,
                              const std::string &environment);

    static bool validateSynthesisRequirements(const std::string &trait,
                                              const std::string &environment);

    bool initialized_;
    std::unordered_map<std::string, std::string> configuration_;
};

} // namespace crescent::environment

#endif