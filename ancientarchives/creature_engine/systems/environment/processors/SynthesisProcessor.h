// processors/SynthesisProcessor.h
#ifndef CREATURE_ENGINE_ENVIRONMENT_PROCESSORS_SYNTHESIS_PROCESSOR_H
#define CREATURE_ENGINE_ENVIRONMENT_PROCESSORS_SYNTHESIS_PROCESSOR_H

#include "creature_engine/systems/environment/interfaces/IEnvironmentProcessor.h"
#include "creature_engine/systems/environment/stress/StressManager.h"
#include "creature_engine/systems/environment/stress/StressResponse.h"
#include "creature_engine/systems/environment/types/data/EnvironmentalData.h"
#include "creature_engine/systems/environment/types/data/SynthesisCapability.h"

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

    // Updated synthesis methods
    std::optional<SynthesisCapability>
    attemptSynthesis(const std::string &creatureId, const std::string &trait,
                     const EnvironmentalData &data);

    bool canInitiateSynthesis(const std::string &creatureId,
                              const std::string &trait,
                              const EnvironmentalData &data) const;

    // New stress-aware methods
    float calculateStressImpactOnSynthesis(const std::string &creatureId,
                                           const std::string &trait) const;

    bool isStressLevelSuitableForSynthesis(const std::string &creatureId) const;

    std::vector<std::string>
    getStressUnlockedSynthesis(const std::string &creatureId,
                               const EnvironmentalData &data) const;

  protected:
    void logProcessorActivity(const std::string &message,
                              const std::string &level = "INFO") const override;

  private:
    bool initialized_;
    std::unordered_map<std::string, std::string> configuration_;

    float calculateSynthesisPotential(const std::string &creatureId,
                                      const std::string &trait,
                                      const EnvironmentalData &data) const;

    std::unordered_map<std::string, float>
    calculateStressModifiedCosts(const std::string &creatureId,
                                 const std::string &trait) const;
};

} // namespace crescent::environment

#endif