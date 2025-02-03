#ifndef CREATURE_ENGINE_CORE_STATE_ABILITY_STATE_H
#define CREATURE_ENGINE_CORE_STATE_ABILITY_STATE_H

#include "creature_engine/core/base/CreatureEnums.h"
#include "creature_engine/core/changes/ChangeTypes.h"
#include <nlohmann/json.hpp>
#include <optional>
#include <string>
#include <unordered_map>
#include <unordered_set>
#include <vector>

namespace crescent {

class AbilityState {
  public:
    // Construction
    AbilityState() = default;
    ~AbilityState() = default;

    // Core ability management
    bool addAbility(const Ability &ability);
    bool removeAbility(const std::string &abilityName);
    bool hasAbility(const std::string &abilityName) const;
    std::optional<Ability> getAbility(const std::string &abilityName) const;
    const std::vector<Ability> &getAllAbilities() const { return abilities_; }

    // Base ability modification
    bool modifyBasePower(const std::string &abilityName, float powerDelta);
    bool setAbilityActive(const std::string &abilityName, bool active);

    // Requirements management
    bool meetsBaseRequirements(const std::string &abilityName) const;
    void addRequirement(const std::string &abilityName,
                        const std::string &requirement);
    void removeRequirement(const std::string &abilityName,
                           const std::string &requirement);

    // Change application
    bool canApplyChange(const AbilityChange &change) const;
    bool applyChange(const AbilityChange &change);
    std::optional<AbilityChange>
    generateUndo(const AbilityChange &change) const;

    // Validation
    bool isValid() const;
    std::vector<std::string> validate() const;

    // Serialization
    nlohmann::json serializeToJson() const;
    static AbilityState deserializeFromJson(const nlohmann::json &json);

  private:
    // Core storage
    std::vector<Ability> abilities_;

    // Lookup maps for efficiency
    std::unordered_map<std::string, size_t> abilityIndices_;

    // Base requirement tracking
    std::unordered_map<std::string, std::unordered_set<std::string>>
        requirements_;

    // Basic validation
    bool validateBasics() const;
    bool validateAbilities() const;
    bool validateRequirements() const;

    // Helper methods
    void updateAbilityIndex(const std::string &abilityName, size_t index);
    void removeAbilityIndex(const std::string &abilityName);
    bool isTraitIndexValid(const std::string &abilityName) const;
};

} // namespace crescent

#endif // CREATURE_ENGINE_CORE_STATE_ABILITY_STATE_H