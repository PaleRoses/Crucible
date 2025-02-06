#ifndef CREATURE_ENGINE_TRAITS_SYNTHESIS_SYNTHESIS_PROCESSOR_H
#define CREATURE_ENGINE_TRAITS_SYNTHESIS_SYNTHESIS_PROCESSOR_H

#include "creature_engine/core/base/CreatureEnums.h"
#include "creature_engine/io/SerializationStructures.h"
#include "creature_engine/traits/base/TraitDefinition.h"
#include "creature_engine/traits/base/TraitEnums.h"
#include "creature_engine/traits/synthesis/SynthesisRules.h"

#include <memory>
#include <nlohmann/json.hpp>
#include <optional>
#include <string>
#include <unordered_map>
#include <vector>

namespace crescent::traits {

/**
 * @brief Processes trait synthesis based on environmental and stress catalysts
 *
 * Handles the mechanics of trait synthesis, following defined rules and
 * maintaining synthesis state. Coordinates with the rules engine to determine
 * valid synthesis paths.
 */
class SynthesisProcessor {
  public:
    // Construction
    SynthesisProcessor();
    explicit SynthesisProcessor(std::shared_ptr<SynthesisRules> rules);

    /**
     * @brief Attempts to synthesize a trait based on a catalyst
     * @param trait Trait to synthesize
     * @param catalystType Type of catalyst triggering synthesis
     * @param catalystId Specific catalyst identifier
     * @param intensity Catalyst intensity
     * @return Optional containing synthesis result if successful
     */
    std::optional<SynthesisResult>
    processSynthesis(const TraitDefinition &trait, CatalystType catalystType,
                     const std::string &catalystId, float intensity);

    /**
     * @brief Checks if synthesis is possible for a trait/catalyst combination
     */
    bool canSynthesize(const TraitDefinition &trait, CatalystType catalystType,
                       const std::string &catalystId) const;

    /**
     * @brief Gets potential synthesis forms for a trait
     */
    std::vector<std::string> getPotentialForms(const TraitDefinition &trait,
                                               CatalystType catalystType) const;

    /**
     * @brief Calculates current synthesis stability
     */
    float calculateStability(const TraitDefinition &trait,
                             const std::string &synthesizedForm) const;

    /**
     * @brief Attempts to revert a synthesis
     * @return True if reversion successful
     */
    bool revertSynthesis(const TraitDefinition &trait);

    // Serialization
    nlohmann::json
    serializeToJson(const SerializationOptions &options = {}) const;
    static SynthesisProcessor deserializeFromJson(const nlohmann::json &data);

  private:
    std::shared_ptr<SynthesisRules> rules_;

    // Synthesis tracking
    struct SynthesisState {
        std::string currentForm;
        int synthesisLevel;
        float stability;
        std::chrono::system_clock::time_point lastUpdate;
    };
    std::unordered_map<std::string, SynthesisState> synthesisStates_;

    // Internal processing
    bool validateSynthesis(const TraitDefinition &trait,
                           const std::string &targetForm) const;
    float calculateSynthesisPotential(const TraitDefinition &trait,
                                      CatalystType catalystType,
                                      float intensity) const;
    void updateSynthesisState(const std::string &traitId,
                              const SynthesisState &state);
};

} // namespace crescent::traits

#endif // CREATURE_ENGINE_TRAITS_SYNTHESIS_SYNTHESIS_PROCESSOR_H