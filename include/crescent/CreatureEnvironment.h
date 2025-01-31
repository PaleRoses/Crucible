#ifndef CREATURE_ENVIRONMENT_H
#define CREATURE_ENVIRONMENT_H

#include "CreatureEnums.h"
#include "CreatureStructures.h"
#include <nlohmann/json.hpp>
#include <optional>
#include <string>
#include <unordered_map>
#include <unordered_set>
#include <vector>

namespace crescent {

/**
 * @brief Represents an environmental pressure or hazard
 */
struct EnvironmentalStressor {
    std::string source;
    float intensity;
    std::unordered_set<std::string> effects;
    bool isLethal;

    nlohmann::json
    serializeToJson(const SerializationOptions &options = {}) const;
    static EnvironmentalStressor
    deserializeFromJson(const nlohmann::json &data);
};

/**
 * @brief Represents a creature's adaptation to an environment
 */
struct EnvironmentalData {
    std::string environment;
    float adaptationLevel;
    int exposureTime;
    std::unordered_set<std::string> activeEffects;
    std::unordered_set<std::string> developedAbilities;
    std::unordered_set<std::string> currentWeaknesses;
    std::unordered_map<std::string, float> resourceUsage;
    std::vector<EnvironmentalStressor> activeStressors;
    bool canSynthesizeWith;

    nlohmann::json
    serializeToJson(const SerializationOptions &options = {}) const;
    static EnvironmentalData deserializeFromJson(const nlohmann::json &data);
};

/**
 * @brief Manages environmental effects and adaptations
 */
class EnvironmentalInteraction {
  public:
    /**
     * @brief Processes time spent in an environment
     * @param environment Environment name
     * @param time Duration of exposure
     * @return Updated environmental data
     */
    std::optional<EnvironmentalData>
    processTimeInEnvironment(const std::string &environment, int time);

    /**
     * @brief Checks if synthesis is possible in current environment
     * @param catalysts Additional synthesis components
     * @return True if synthesis is possible
     */
    bool canSynthesize(const std::vector<std::string> &catalysts = {}) const;

    /**
     * @brief Gets active environments and their data
     * @return Map of environment names to their data
     */
    const std::unordered_map<std::string, EnvironmentalData> &
    getActiveEnvironments() const;

    /**
     * @brief Gets current adaptation level for an environment
     * @param environment Environment to check
     * @return Optional containing adaptation level if environment is active
     */
    std::optional<float>
    getAdaptationLevel(const std::string &environment) const;

    /**
     * @brief Gets current environmental stressors
     * @return Vector of active stressors
     */
    std::vector<EnvironmentalStressor> getCurrentStressors() const;

    nlohmann::json
    serializeToJson(const SerializationOptions &options = {}) const;
    static EnvironmentalInteraction
    deserializeFromJson(const nlohmann::json &data);

  private:
    std::unordered_map<std::string, EnvironmentalData> activeEnvironments;
    std::unordered_map<std::string, float> adaptationLevels;
    std::vector<EnvironmentalStressor> currentStressors;

    /**
     * @brief Updates environmental effects
     */
    void processEnvironmentalEffects();

    /**
     * @brief Updates synthesis potential
     */
    void calculateSynthesisPotential();

    /**
     * @brief Updates active stressors
     */
    void updateStressors();
};

/**
 * @brief Represents interaction between environment and trait
 */
struct EnvironmentTraitInteraction {
    std::unordered_set<std::string> manifestations;
    std::unordered_set<std::string> abilities;
    std::unordered_set<std::string> adaptations;
    float affinityModifier;
    bool canSynthesize;

    nlohmann::json
    serializeToJson(const SerializationOptions &options = {}) const;
    static EnvironmentTraitInteraction
    deserializeFromJson(const nlohmann::json &data);
};

/**
 * @brief Management of environment-trait relationships
 */
class EnvironmentTraitSystem {
  public:
    /**
     * @brief Gets available interactions for environment/trait combo
     * @param environment Environment name
     * @param trait Trait name
     * @return Optional containing interaction data if available
     */
    static std::optional<EnvironmentTraitInteraction>
    getInteraction(const std::string &environment, const std::string &trait);

    /**
     * @brief Gets possible manifestations for environment/trait combo
     * @param environment Environment name
     * @param trait Trait name
     * @return Set of possible manifestations
     */
    static std::unordered_set<std::string>
    getPossibleManifestations(const std::string &environment,
                              const std::string &trait);

    /**
     * @brief Gets possible abilities for environment/trait combo
     * @param environment Environment name
     * @param trait Trait name
     * @return Set of possible abilities
     */
    static std::unordered_set<std::string>
    getPossibleAbilities(const std::string &environment,
                         const std::string &trait);

  private:
    static const std::unordered_map std::string,
        std::unordered_map < std::string,
        EnvironmentTraitInteraction >> interactions;

    /**
     * @brief Initializes interaction data
     */
    static void initializeInteractions();
};

/**
 * @brief Environmental system configuration
 */
namespace EnvironmentConstants {
constexpr float MIN_ADAPTATION_LEVEL = 0.0f;
constexpr float MAX_ADAPTATION_LEVEL = 1.0f;
constexpr float SYNTHESIS_THRESHOLD = 0.8f;
constexpr int MIN_EXPOSURE_TIME = 100;
constexpr float LETHAL_STRESS_THRESHOLD = 0.9f;
} // namespace EnvironmentConstants

/**
 * @brief Adaptation processing utilities
 */
namespace AdaptationProcessor {
/**
 * @brief Processes a specific adaptation effect
 * @param adaptation Adaptation description
 * @param data Environmental data
 * @return True if adaptation was successful
 */
bool processAdaptation(const std::string &adaptation, EnvironmentalData &data);

/**
 * @brief Checks if adaptation requirements are met
 * @param requirements Set of requirements
 * @return True if all requirements are met
 */
bool meetsRequirements(const std::unordered_set<std::string> &requirements);

/**
 * @brief Gets adaptation power level
 * @param adaptation Adaptation description
 * @param environmentData Current environmental data
 * @return Power level between 0 and 1
 */
float getAdaptationPowerLevel(const std::string &adaptation,
                              const EnvironmentalData &environmentData);
} // namespace AdaptationProcessor

} // namespace crescent

#endif // CREATURE_ENVIRONMENT_H