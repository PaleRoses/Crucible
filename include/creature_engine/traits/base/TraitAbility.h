#ifndef CREATURE_ENGINE_TRAITS_BASE_TRAIT_ABILITY_H
#define CREATURE_ENGINE_TRAITS_BASE_TRAIT_ABILITY_H

#include "creature_engine/io/SerializationStructures.h"
#include "creature_engine/traits/base/TraitEnums.h"
#include "creature_engine/traits/synthesis/SynthesisEnums.h"

#include <optional>
#include <string>
#include <unordered_map>
#include <unordered_set>
#include <vector>

namespace crescent::traits {

/**
 * @brief Key for tracking ability requirements and conflicts
 */
struct AbilityRequirementKey {
    std::string traitId;
    std::string abilityId;

    bool operator==(const AbilityRequirementKey &other) const {
        return traitId == other.traitId && abilityId == other.abilityId;
    }

    struct Hash {
        std::size_t operator()(const AbilityRequirementKey &k) const {
            return std::hash<std::string>()(k.traitId) ^
                   (std::hash<std::string>()(k.abilityId) << 1);
        }
    };
};

/**
 * @brief Core definition of an ability granted by a trait
 */
class AbilityDefinition {
  public:
    // Construction/Destruction
    AbilityDefinition() = default;
    explicit AbilityDefinition(std::string id);
    ~AbilityDefinition() = default;

    // Core identification
    const std::string &getId() const { return id_; }
    const std::string &getName() const { return name_; }
    const std::string &getDescription() const { return description_; }
    AbilityType getType() const { return type_; }

    // Manifestation parameters
    struct ManifestationDetails {
        std::vector<std::string> primaryEffects;   // Core effects
        std::vector<std::string> secondaryEffects; // Side effects
        bool isPermanent{false};                   // Cannot be unmade
        bool requiresStability{false};             // Needs stable conditions
        std::optional<std::string> catalyst;       // Required catalyst
    };
    const ManifestationDetails &getManifestationDetails() const {
        return manifestation_;
    }

    // Environmental interaction
    struct EnvironmentalFactors {
        std::unordered_map<std::string, float> affinities;
        std::vector<std::string> enhancingConditions;
        std::vector<std::string> suppressingConditions;
        float minimumEnvironmentalAffinity{0.0f};
    };
    const EnvironmentalFactors &getEnvironmentalFactors() const {
        return environmental_;
    }

    // Requirements
    struct Requirements {
        std::unordered_map<AbilityRequirementKey, float,
                           AbilityRequirementKey::Hash>
            dependencies;
        std::vector<std::string> conflictingManifestations;
        float minimumTraitStrength{0.0f};
    };
    const Requirements &getRequirements() const { return requirements_; }

    // Validation
    struct ValidationResult {
        bool isValid;
        std::vector<std::string> errors;
        std::vector<std::string> warnings;
    };
    ValidationResult validate() const;

    // Environmental checks
    float calculateEnvironmentalAffinity(const std::string &environment) const;
    bool meetsEnvironmentalRequirements(const std::string &environment) const;
    std::vector<std::string>
    getEnhancingConditions(const std::string &environment) const;

    // Requirement checks
    bool checkDependencies(
        const std::unordered_set<std::string> &availableTraits) const;
    std::vector<std::string> getMissingRequirements() const;

    // Serialization
    nlohmann::json
    serializeToJson(const SerializationOptions &options = {}) const;
    static AbilityDefinition deserializeFromJson(const nlohmann::json &data);

    // Builder interface
    class Builder;
    static Builder create(std::string id);

  private:
    // Core identification
    std::string id_;
    std::string name_;
    std::string description_;
    AbilityType type_;

    // Parameters
    ManifestationDetails manifestation_;
    EnvironmentalFactors environmental_;
    Requirements requirements_;

    friend class Builder;
};

/**
 * @brief Builder for constructing ability definitions
 */
class AbilityDefinition::Builder {
  public:
    static Builder create(std::string id);

    // Core properties
    Builder &withName(std::string name);
    Builder &withDescription(std::string description);
    Builder &withType(AbilityType type);

    // Manifestation details
    Builder &addPrimaryEffect(std::string effect);
    Builder &addSecondaryEffect(std::string effect);
    Builder &setPermanent(bool permanent = true);
    Builder &requiresStability(bool requires = true);
    Builder &withCatalyst(std::string catalyst);

    // Environmental factors
    Builder &addEnvironmentalAffinity(std::string environment, float affinity);
    Builder &addEnhancingCondition(std::string condition);
    Builder &addSuppressingCondition(std::string condition);
    Builder &setMinimumEnvironmentalAffinity(float threshold);

    // Requirements
    Builder &addDependency(std::string traitId, std::string abilityId,
                           float strength);
    Builder &addConflictingManifestation(std::string manifestationId);
    Builder &setMinimumTraitStrength(float strength);

    AbilityDefinition build();

  private:
    AbilityDefinition ability_;
    explicit Builder(std::string id);
    ValidationResult validateBuild() const;
};

} // namespace crescent::traits

#endif // CREATURE_ENGINE_TRAITS_BASE_TRAIT_ABILITY_H