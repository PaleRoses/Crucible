#ifndef CREATURE_ENGINE_TRAITS_BASE_TRAIT_DEFINITION_H
#define CREATURE_ENGINE_TRAITS_BASE_TRAIT_DEFINITION_H

#include "creature_engine/core/base/CreatureEnums.h"
#include "creature_engine/io/SerializationStructures.h"

#include <memory>
#include <nlohmann/json.hpp>
#include <string>
#include <unordered_map>
#include <unordered_set>
#include <vector>

namespace crescent::traits {

/**
 * @brief Defines a granted ability from a trait
 */
struct TraitAbility {
    std::string id;
    std::string name;
    std::string description;
    AbilityType type;

    // Requirements and modifiers
    std::unordered_set<std::string> requirements;
    std::unordered_map<std::string, float> environmentalModifiers;

    // Synthesis tracking
    bool isSynthesized = false;
    int synthesisLevel = 0;

    // Serialization
    nlohmann::json
    serializeToJson(const SerializationOptions &options = {}) const;
    static TraitAbility deserializeFromJson(const nlohmann::json &data);
};

/**
 * @brief Core trait definition - immutable template for trait instances
 */
class TraitDefinition {
  public:
    // Construction
    TraitDefinition() = default;
    explicit TraitDefinition(std::string id);

    // Core properties
    const std::string &getId() const { return id_; }
    const std::string &getName() const { return name_; }
    const std::string &getDescription() const { return description_; }
    TraitCategory getCategory() const { return category_; }
    TraitOrigin getOrigin() const { return origin_; }

    // Manifestation access
    const std::unordered_set<std::string> &getManifestations() const;
    bool hasManifestion(const std::string &manifestation) const;

    // Ability access
    const std::vector<TraitAbility> &getAbilities() const;
    bool hasAbility(const std::string &abilityId) const;

    // Compatibility checking
    bool isCompatibleWith(const TraitDefinition &other) const;
    bool isCompatibleWithEnvironment(const std::string &environment) const;

    // Synthesis potential
    bool canSynthesize() const { return canSynthesize_; }
    int getMaxSynthesisLevel() const { return maxSynthesisLevel_; }
    const std::vector<std::string> &getPotentialSynthesisForms() const;
    float getSynthesisThreshold(const std::string &catalyst) const;

    // Serialization
    nlohmann::json
    serializeToJson(const SerializationOptions &options = {}) const;
    static TraitDefinition deserializeFromJson(const nlohmann::json &data);

    // Builder pattern interface
    class Builder;
    static Builder create(std::string id);

  private:
    // Core identification
    std::string id_;
    std::string name_;
    std::string description_;
    TraitCategory category_ = TraitCategory::Physical;
    TraitOrigin origin_ = TraitOrigin::Innate;

    // Manifestations and abilities
    std::unordered_set<std::string> manifestations_;
    std::vector<TraitAbility> abilities_;

    // Compatibility
    std::unordered_set<std::string> incompatibleTraits_;
    std::unordered_map<std::string, float> environmentalAffinity_;

    // Synthesis properties
    bool canSynthesize_ = false;
    int maxSynthesisLevel_ = 0;
    std::vector<std::string> potentialSynthesisForms_;
    std::unordered_map<std::string, float> synthesisThresholds_;
};

/**
 * @brief Builder for constructing TraitDefinitions
 */
class TraitDefinition::Builder {
  public:
    explicit Builder(std::string id);

    Builder &withName(std::string name);
    Builder &withDescription(std::string description);
    Builder &withCategory(TraitCategory category);
    Builder &withOrigin(TraitOrigin origin);

    Builder &addManifestation(std::string manifestation);
    Builder &addAbility(TraitAbility ability);
    Builder &addIncompatibleTrait(std::string traitId);
    Builder &setEnvironmentalAffinity(std::string environment, float affinity);

    Builder &enableSynthesis(int maxLevel);
    Builder &addPotentialForm(std::string form);
    Builder &setSynthesisThreshold(std::string catalyst, float threshold);

    TraitDefinition build();

  private:
    TraitDefinition trait_;
};

} // namespace crescent::traits

#endif // CREATURE_ENGINE_TRAITS_BASE_TRAIT_DEFINITION_H