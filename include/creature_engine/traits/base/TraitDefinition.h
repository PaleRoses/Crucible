#ifndef CREATURE_ENGINE_TRAITS_BASE_TRAIT_DEFINITION_H
#define CREATURE_ENGINE_TRAITS_BASE_TRAIT_DEFINITION_H

#include "creature_engine/core/base/CreatureEnums.h"
#include "creature_engine/io/SerializationStructures.h"
#include "creature_engine/traits/base/TraitAbility.h" // Moved to separate header
#include "creature_engine/traits/base/TraitEnums.h"

#include <memory>
#include <nlohmann/json.hpp>
#include <string>
#include <unordered_set>
#include <vector>

namespace crescent::traits {

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
    const std::unordered_set<std::string> &getManifestations() const {
        return manifestations_;
    }
    bool hasManifestion(const std::string &manifestation) const;

    // Ability access
    const std::vector<TraitAbility> &getAbilities() const { return abilities_; }
    bool hasAbility(const std::string &abilityId) const;

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

    TraitDefinition build();

  private:
    TraitDefinition trait_;
};

} // namespace crescent::traits

#endif // CREATURE_ENGINE_TRAITS_BASE_TRAIT_DEFINITION_H