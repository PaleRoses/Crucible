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
    // Core synthesis operations
    static bool canSynthesizeWith(const std::string &trait,
                                  const std::string &environment,
                                  const EnvironmentalData &envData);

    static std::optional<SynthesisCapability>
    attemptSynthesis(const std::string &trait, const std::string &environment,
                     const EnvironmentalData &envData);

    static std::vector<std::string>
    getViableSynthesisTargets(const std::string &trait,
                              const EnvironmentalData &envData);

    // Synthesis potential and calculations
    static void calculateSynthesisPotential(const std::string &trait,
                                            const EnvironmentalData &envData);

    static float getSynthesisAffinity(const std::string &trait,
                                      const std::string &environment);

    // Synthesis state management
    static void updateActiveSynthesis(SynthesisCapability &synthesis,
                                      const EnvironmentalData &envData);

    static bool validateSynthesisStability(const SynthesisCapability &synthesis,
                                           const EnvironmentalData &envData);

    // Synthesis compatibility
    static bool checkSynthesisCompatibility(const std::string &trait,
                                            const std::string &environment);

    static float calculateSynthesisStrength(const std::string &trait,
                                            const std::string &environment,
                                            const EnvironmentalData &envData);

  private:
    // Internal helpers
    static std::unordered_map<std::string, float>
    calculateMaintenanceCosts(const std::string &trait,
                              const std::string &environment);

    static std::vector<std::string>
    determineGrantedProperties(const std::string &trait,
                               const std::string &environment,
                               float synthesisStrength);

    static bool validateSynthesisRequirements(const std::string &trait,
                                              const std::string &environment);

    static float
    calculateBaseSynthesisPotential(const std::string &trait,
                                    const std::string &environment);
};

} // namespace environment
} // namespace crescent

#endif