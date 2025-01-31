#ifndef CREATURE_STRUCTURES_H
#define CREATURE_STRUCTURES_H

#include "CreatureEnums.h"
#include <memory>
#include <nlohmann/json.hpp>
#include <optional>
#include <string>
#include <unordered_map>
#include <unordered_set>
#include <vector>

namespace crescent {

/**
 * @brief Serialization options for controlling JSON output
 */
struct SerializationOptions {
    bool includeHistory = true;
    bool includeTemporary = false;
    bool includeProbabilities = false;
    std::unordered_set<std::string> excludedFields;
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
    std::unordered_map<std::string, float> adaptabilityScores;

    /**
     * @brief Serializes the physical form to JSON
     * @param options Serialization configuration
     * @return JSON representation
     */
    nlohmann::json
    serializeToJson(const SerializationOptions &options = {}) const;

    /**
     * @brief Creates a PhysicalForm from JSON data
     * @param data JSON representation
     * @return Constructed PhysicalForm
     */
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
    std::unordered_set<std::string> requirements;
    std::unordered_map<std::string, float> environmentalModifiers;

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
    std::unordered_map<std::string, float> environmentalAffinities;
    std::unordered_set<std::string> incompatibleWith;
    std::unordered_set<std::string> mutations;
    std::unordered_map<std::string, float> themeResonance;

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

    nlohmann::json
    serializeToJson(const SerializationOptions &options = {}) const;
    static Behavior deserializeFromJson(const nlohmann::json &data);
};

/**
 * @brief Result of creature state validation
 */
struct ValidationResult {
    bool isValid;
    std::vector<std::string> warnings;
    std::vector<std::string> errors;
    std::unordered_map<std::string, float> stabilityMetrics;

    nlohmann::json
    serializeToJson(const SerializationOptions &options = {}) const;
};

/**
 * @brief Core state of a creature instance
 */
struct CreatureState {
    std::string name;
    std::string suggestedName;
    std::string uniqueIdentifier;
    PhysicalForm form;
    std::vector<TraitDefinition> activeTraits;
    std::vector<Ability> abilities;
    Behavior behavior;
    int powerLevel;
    bool isMutated;

    nlohmann::json
    serializeToJson(const SerializationOptions &options = {}) const;
    static CreatureState deserializeFromJson(const nlohmann::json &data);
};

/**
 * @brief Stores component information for name generation
 */
struct NameComponents {
    static const std::unordered_map<Size, std::vector<std::string>>
        sizePrefixes;
    static const std::unordered_map<std::string, std::vector<std::string>>
        traitDescriptors;
    static const std::unordered_map<
        std::string, std::unordered_map<std::string, std::vector<std::string>>>
        environmentalNames;
    static constexpr float PREFIX_CHANCE = 0.3f;

    /**
     * @brief Generates a name based on creature attributes
     * @param form Physical form of the creature
     * @param traits Active traits
     * @param environment Current environment
     * @return Generated name
     */
    static std::string generateName(const PhysicalForm &form,
                                    const std::vector<TraitDefinition> &traits,
                                    const std::string &environment);
};

/**
 * @brief Helper for serialization operations
 */
class Serializer {
  public:
    /**
     * @brief Converts an enum to its string representation
     * @param value Enum value to convert
     * @return String representation
     */
    template <typename T> static std::string enumToString(T value);

    /**
     * @brief Converts a string to its enum representation
     * @param str String to convert
     * @return Optional enum value
     */
    template <typename T>
    static std::optional<T> stringToEnum(const std::string &str);
};

} // namespace crescent

#endif // CREATURE_STRUCTURES_H