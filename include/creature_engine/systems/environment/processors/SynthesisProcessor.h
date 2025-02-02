// systems/environment/processors/SynthesisProcessor.h
#ifndef CREATURE_ENGINE_ENVIRONMENT_PROCESSORS_SYNTHESIS_PROCESSOR_H
#define CREATURE_ENGINE_ENVIRONMENT_PROCESSORS_SYNTHESIS_PROCESSOR_H

#include "creature_engine/systems/environment/types/data/EnvironmentalData.h"
#include "creature_engine/systems/environment/types/data/SynthesisCapability.h"
#include <optional>
#include <string>
#include <vector>

namespace crescent {
namespace environment {

class SynthesisProcessor {
  public:
    static std::optional<SynthesisCapability>
    attemptSynthesis(const std::string &trait, const std::string &environment,
                     const EnvironmentalData &envData);

    static bool canInitiateSynthesis(const std::string &trait,
                                     const std::string &environment);

    static std::vector<std::string>
    getViableSynthesisTargets(const std::string &trait,
                              const EnvironmentalData &envData);

  private:
    static float calculateSynthesisPotential(const std::string &trait,
                                             const EnvironmentalData &envData);

    static std::unordered_map<std::string, float>
    calculateMaintenanceCosts(const std::string &trait,
                              const std::string &environment);

    static bool validateSynthesisRequirements(const std::string &trait,
                                              const std::string &environment);
};

} // namespace environment
} // namespace crescent

#endif