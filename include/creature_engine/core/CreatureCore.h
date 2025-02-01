#ifndef CREATURE_ENGINE_CREATURE_CORE_H
#define CREATURE_ENGINE_CREATURE_CORE_H

#include "creature_engine/core/CreatureEnums.h"
#include "creature_engine/io/SerializationStructures.h"
#include <nlohmann/json.hpp>
#include <string>
#include <unordered_map>
#include <unordered_set>
#include <vector>

namespace crescent {

/**
 * @brief Tracks the synthesis state of a trait with an environment
 */
struct SynthesisState {
    std::string sourceTrait;       // Original trait being synthesized
    std::string targetEnvironment; // Environment being synthesized with
    float integrationLevel;        // How well the synthesis has taken (0-1)
    std::unordered_set<std::string>
        grantedProperties; // Properties gained from synthesis

    nlohmann::json
    serializeToJson(const SerializationOptions &options = {}) const;
    static SynthesisState deserializeFromJson(const nlohmann::json &data);
};

/**
 * @brief Tracks environmental or evolutionary stress on the creature
 */
struct StressState {
    std::string source;                      // Source of the stress
    float level;                             // Current stress level (0-1)
    std::unordered_set<std::string> effects; // Active effects from stress

    nlohmann::json
    serializeToJson(const SerializationOptions &options = {}) const;
    static StressState deserializeFromJson(const nlohmann::json &data);
};

/**
 * @brief Represents the physical form and attributes of a creature
 */
struct PhysicalForm {
    Size size;
    BodyShape shape;
    Locomotion primaryMovement;
    std::vector<Locomotion> secondaryMovements;
    std::unordered_set<std::string> distinctiveFeatures;

    // Adaptation and synthesis capabilities
    std::unordered_map<std::string, float>
        adaptabilityScores; // Base adaptability to different factors
    std::unordered_map<std::string, float>
        synthesisAffinities; // Natural affinity for synthesis

    nlohmann::json
    serializeToJson(const SerializationOptions &options = {}) const;
    static PhysicalForm deserializeFromJson(const nlohmann::json &data);
};

/**
 * @brief Represents a specific ability or power
 */
struct Ability {
    std::string name;
    std::string description;
    AbilityType type;
    int powerLevel;
    bool isActive;

    // Requirements and interactions
    std::unordered_set<std::string> requirements;
    std::unordered_map<std::string, float> environmentalModifiers;

    // Synthesis properties
    bool canSynthesize;
    std::unordered_set<std::string>
        synthesisCompatibility; // What this ability can synthesize with

    nlohmann::json
    serializeToJson(const SerializationOptions &options = {}) const;
    static Ability deserializeFromJson(const nlohmann::json &data);
};

/**
 * @brief Defines a trait and its manifestations
 */
struct TraitDefinition {
    std::unordered_set<std::string> manifestations;
    std::vector<Ability> abilities;

    // Environmental interactions
    std::unordered_map<std::string, float> environmentalAffinities;
    std::unordered_set<std::string> incompatibleWith;

    // Evolution and synthesis
    std::unordered_set<std::string> mutations;
    std::unordered_map<std::string, float> themeResonance;
    std::unordered_map<std::string, float>
        synthesisThresholds; // Required levels for synthesis

    nlohmann::json
    serializeToJson(const SerializationOptions &options = {}) const;
    static TraitDefinition deserializeFromJson(const nlohmann::json &data);
};

/**
 * @brief Defines creature behavior patterns
 */
struct Behavior {
    Intelligence intelligence;
    Aggression aggression;
    SocialStructure socialStructure;

    std::unordered_set<std::string> specialBehaviors;
    std::unordered_map<std::string, float> environmentalBehaviors;
    std::unordered_map<std::string, float> themeInfluences;

    // Stress and synthesis effects on behavior
    std::unordered_map<std::string, float>
        stressResponses; // How behavior changes under stress
    std::unordered_map<std::string, float>
        synthesisInfluences; // How synthesis affects behavior

    nlohmann::json
    serializeToJson(const SerializationOptions &options = {}) const;
    static Behavior deserializeFromJson(const nlohmann::json &data);
};

/**
 * @brief Core state of a creature instance
 */
struct CreatureState {
    // Identity
    std::string name;
    std::string suggestedName;
    std::string uniqueIdentifier;

    // Core attributes
    PhysicalForm form;
    std::vector<TraitDefinition> activeTraits;
    std::vector<Ability> abilities;
    Behavior behavior;

    // Status
    int powerLevel;
    bool isMutated;

    // Environmental interaction states
    std::vector<SynthesisState> activeSyntheses;
    std::vector<StressState> stressStates;

    nlohmann::json
    serializeToJson(const SerializationOptions &options = {}) const;
    static CreatureState deserializeFromJson(const nlohmann::json &data);
};

} // namespace crescent

#endif // CREATURE_ENGINE_CREATURE_CORE_H