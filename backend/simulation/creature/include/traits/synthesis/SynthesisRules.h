#ifndef CREATURE_ENGINE_TRAITS_SYNTHESIS_SYNTHESIS_RULES_H
#define CREATURE_ENGINE_TRAITS_SYNTHESIS_SYNTHESIS_RULES_H

#include "creature_engine/io/SerializationStructures.h"
#include "creature_engine/traits/base/TraitDefinition.h"
#include "creature_engine/traits/base/TraitEnums.h"

#include <memory>
#include <nlohmann/json.hpp>
#include <string>
#include <unordered_map>
#include <vector>

namespace crescent::traits {

/**
 * @brief Defines requirements for a specific synthesis path
 */
struct SynthesisRequirement {
    float minimumIntensity{0.0f};            // Required catalyst strength
    float minimumStability{0.0f};            // Required trait stability
    int requiredSynthesisLevel{0};           // Minimum synthesis level
    std::vector<std::string> requiredTraits; // Other traits needed

    bool evaluate(float intensity, float stability, int synthesisLevel,
                  const std::vector<std::string> &availableTraits) const;
};

/**
 * @brief Defines the outcome of a successful synthesis
 */
struct SynthesisOutcome {
    std::string resultForm;                    // New trait form
    std::vector<std::string> grantedAbilities; // New abilities
    float stabilityModifier{1.0f};             // Effect on stability
    std::vector<std::string> suppressedTraits; // Traits temporarily disabled
};

/**
 * @brief Core synthesis rules engine
 *
 * Defines and enforces rules for trait synthesis, including:
 * - Valid synthesis paths
 * - Requirements for synthesis
 * - Outcomes of synthesis
 * - Stability calculations
 */
class SynthesisRules {
  public:
    // Construction
    SynthesisRules();
    ~SynthesisRules() = default;

    /**
     * @brief Registers a valid synthesis path
     * @param sourceForm Original trait form
     * @param catalystType Type of catalyst
     * @param requirements Synthesis requirements
     * @param outcome Result of successful synthesis
     */
    void registerSynthesisPath(const std::string &sourceForm,
                               CatalystType catalystType,
                               const SynthesisRequirement &requirements,
                               const SynthesisOutcome &outcome);

    /**
     * @brief Checks if synthesis is possible
     */
    bool canSynthesize(const TraitDefinition &trait,
                       const std::string &targetForm, CatalystType catalystType,
                       float intensity,
                       const std::vector<std::string> &availableTraits) const;

    /**
     * @brief Gets all possible synthesis outcomes for a trait and catalyst
     * type.
     */
    std::vector<SynthesisOutcome>
    getPossibleOutcomes(const TraitDefinition &trait,
                        CatalystType catalystType) const;

    /**
     * @brief Calculates synthesis stability.  Returns the *resulting* stability
     * after synthesis.
     */
    float calculateStability(const TraitDefinition &trait,
                             const std::string &synthesizedForm,
                             float catalystIntensity) const;

    /**
     * @brief Validates a specific synthesis path
     */
    bool validateSynthesisPath(const std::string &sourceForm,
                               const std::string &targetForm,
                               CatalystType catalystType) const;

    // Rule queries
    bool hasRegisteredPath(const std::string &sourceForm,
                           CatalystType catalystType) const;

    const SynthesisRequirement *
    getRequirements(const std::string &sourceForm,
                    const std::string &targetForm,
                    CatalystType catalystType) const;

    // Serialization
    nlohmann::json
    serializeToJson(const SerializationOptions &options = {}) const;
    static SynthesisRules deserializeFromJson(const nlohmann::json &data);

  private:
    // Rule storage
    struct SynthesisPath {
        SynthesisRequirement requirements;
        SynthesisOutcome outcome;
    };

    //  More robust key structure for the map.  Using nested maps can be
    //  cumbersome and less efficient.  A custom key struct is cleaner.
    struct SynthesisPathKey {
        std::string sourceForm;
        CatalystType catalystType;
        std::string targetForm;

        bool operator==(const SynthesisPathKey &other) const {
            return sourceForm == other.sourceForm &&
                   catalystType == other.catalystType &&
                   targetForm == other.targetForm;
        }

        struct Hash {
            std::size_t operator()(const SynthesisPathKey &k) const {
                using std::hash;
                using std::size_t;

                return ((hash<std::string>()(k.sourceForm) ^
                         (hash<int>()(static_cast<int>(k.catalystType))
                          << 1)) >>
                        1) ^
                       (hash<std::string>()(k.targetForm) << 1);
            }
        };
    };

    std::unordered_map<SynthesisPathKey, SynthesisPath, SynthesisPathKey::Hash>
        synthesisPaths_;

    // Stability modifiers
    struct StabilityFactors {
        float baseStability{1.0f};
        float catalystMultiplier{1.0f};
        float levelPenalty{0.1f};
        float minStability{0.2f};
    } stabilityFactors_;

    // Internal helpers
    bool
    validateRequirements(const SynthesisRequirement &requirements,
                         float intensity,
                         const std::vector<std::string> &availableTraits) const;

    float computeStabilityModifier(const TraitDefinition &trait,
                                   const std::string &synthesizedForm) const;
};

} // namespace crescent::traits

#endif // CREATURE_ENGINE_TRAITS_SYNTHESIS_SYNTHESIS_RULES_H