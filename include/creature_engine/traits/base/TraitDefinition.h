#ifndef CREATURE_ENGINE_TRAITS_BASE_TRAIT_DEFINITION_H
#define CREATURE_ENGINE_TRAITS_BASE_TRAIT_DEFINITION_H

#include "creature_engine/io/SerializationStructures.h"
#include "creature_engine/traits/base/TraitAbility.h"
#include "creature_engine/traits/base/TraitEnums.h"

#include <memory>
#include <nlohmann/json.hpp>
#include <string>
#include <unordered_map>
#include <unordered_set>
#include <vector>

namespace crescent::traits {

/**
 * @brief Defines environmental interaction parameters
 */
struct EnvironmentalParameters {
    std::unordered_map<std::string, float>
        affinities;                              // Environment compatibility
    std::vector<std::string> enhancingFactors;   // Conditions that strengthen
    std::vector<std::string> suppressingFactors; // Conditions that weaken
    float minimumAffinity{0.0f};                 // Required environmental match
};

/**
 * @brief Defines manifestation characteristics
 */
struct ManifestationParameters {
    std::vector<std::string> primaryEffects;   // Core manifestations
    std::vector<std::string> secondaryEffects; // Side effects
    bool isPermanent{false};                   // Cannot be unmade
    bool requiresStability{false};             // Needs stable conditions
};

/**
 * @brief Core trait definition - immutable template for trait instances
 */
class TraitDefinition {
  public:
    // Construction/Destruction
    TraitDefinition() = default;
    explicit TraitDefinition(std::string id);
    ~TraitDefinition() = default;

    // Prevent copying, allow moving
    TraitDefinition(const TraitDefinition &) = delete;
    TraitDefinition &operator=(const TraitDefinition &) = delete;
    TraitDefinition(TraitDefinition &&) = default;
    TraitDefinition &operator=(TraitDefinition &&) = default;

    // Core property access
    const std::string &getId() const { return id_; }
    const std::string &getName() const { return name_; }
    const std::string &getDescription() const { return description_; }
    TraitCategory getCategory() const { return category_; }
    TraitOrigin getOrigin() const { return origin_; }

    // Manifestation access
    const ManifestationParameters &getManifestationParams() const {
        return manifestationParams_;
    }
    bool hasManifestion(const std::string &manifestation) const;

    // Environmental interaction
    const EnvironmentalParameters &getEnvironmentalParams() const {
        return environmentalParams_;
    }
    float getEnvironmentalAffinity(const std::string &environment) const;

    // Ability access
    const std::vector<TraitAbility> &getAbilities() const { return abilities_; }
    bool hasAbility(const std::string &abilityId) const;

    /**
     * @brief Validates trait stability in environment
     * @return Pair of bool (is stable) and list of destabilizing factors
     */
    std::pair<bool, std::vector<std::string>>
    validateStability(const std::string &environment) const;

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

    // Parameters
    ManifestationParameters manifestationParams_;
    EnvironmentalParameters environmentalParams_;
    std::vector<TraitAbility> abilities_;
};

/**
 * @brief Builder for constructing TraitDefinitions
 */
class TraitDefinition::Builder {
  public:
    explicit Builder(std::string id);

    // Core properties
    Builder &withName(std::string name);
    Builder &withDescription(std::string description);
    Builder &withCategory(TraitCategory category);
    Builder &withOrigin(TraitOrigin origin);

    // Manifestation configuration
    Builder &addPrimaryEffect(std::string effect);
    Builder &addSecondaryEffect(std::string effect);
    Builder &setPermanent(bool permanent = true);
    Builder &requiresStability(bool requires = true);

    // Environmental configuration
    Builder &addEnvironmentalAffinity(std::string environment, float affinity);
    Builder &addEnhancingFactor(std::string factor);
    Builder &addSuppressingFactor(std::string factor);
    Builder &setMinimumAffinity(float affinity);

    // Ability configuration
    Builder &addAbility(TraitAbility ability);

    TraitDefinition build();

  private:
    TraitDefinition trait_;
};

} // namespace crescent::traits

#endif // CREATURE_ENGINE_TRAITS_BASE_TRAIT_DEFINITION_H