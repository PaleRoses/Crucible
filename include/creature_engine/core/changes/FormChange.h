#ifndef CREATURE_ENGINE_CORE_CHANGES_FORM_CHANGE_H
#define CREATURE_ENGINE_CORE_CHANGES_FORM_CHANGE_H

#include "creature_engine/core/base/CreatureEnums.h"
#include "creature_engine/core/base/CreatureExceptions.h"
#include "creature_engine/core/changes/ChangeTypes.h"
#include <chrono>
#include <nlohmann/json.hpp>
#include <optional>
#include <string>
#include <vector>

namespace crescent {

class FormChange {
  public:
    // Construction/Destruction
    FormChange() = default;
    explicit FormChange(ChangeSource source, std::string description = "");
    ~FormChange() = default;

    // Core data
    ChangeMetadata metadata;
    std::optional<PhysicalChange> physical;
    std::optional<AbilityChange> abilities;
    std::optional<TraitChange> traits;
    std::optional<BehaviorChange> behavior;

    // Builder pattern methods for fluent interface
    FormChange &setSource(ChangeSource source);
    FormChange &setPriority(ChangePriority priority);
    FormChange &setDescription(std::string description);
    FormChange &addTag(std::string tag);

    FormChange &withPhysicalChanges(PhysicalChange changes);
    FormChange &withAbilityChanges(AbilityChange changes);
    FormChange &withTraitChanges(TraitChange changes);
    FormChange &withBehaviorChanges(BehaviorChange changes);

    // Validation
    bool isValid() const;
    std::vector<std::string> validate() const;
    bool hasConflictsWith(const FormChange &other) const;
    bool canCombineWith(const FormChange &other) const;

    // Change operations
    std::optional<FormChange> generateUndo() const;
    FormChange combineWith(const FormChange &other) const;

    // Comparison
    bool operator==(const FormChange &other) const;
    bool operator!=(const FormChange &other) const;

    // Serialization
    nlohmann::json serializeToJson() const;
    static FormChange deserializeFromJson(const nlohmann::json &json);

    // Query methods
    bool hasPhysicalChanges() const { return physical.has_value(); }
    bool hasAbilityChanges() const { return abilities.has_value(); }
    bool hasTraitChanges() const { return traits.has_value(); }
    bool hasBehaviorChanges() const { return behavior.has_value(); }

    bool isEmpty() const {
        return !hasPhysicalChanges() && !hasAbilityChanges() &&
               !hasTraitChanges() && !hasBehaviorChanges();
    }

    // Timestamp access
    std::chrono::system_clock::time_point getTimestamp() const {
        return timestamp_;
    }

  private:
    std::chrono::system_clock::time_point timestamp_;

    // Validation helpers
    bool validatePhysicalChanges() const;
    bool validateAbilityChanges() const;
    bool validateTraitChanges() const;
    bool validateBehaviorChanges() const;

    // Conflict detection helpers
    bool checkPhysicalConflicts(const FormChange &other) const;
    bool checkAbilityConflicts(const FormChange &other) const;
    bool checkTraitConflicts(const FormChange &other) const;
    bool checkBehaviorConflicts(const FormChange &other) const;
};

// Utility functions
inline FormChange createPhysicalFormChange(ChangeSource source,
                                           PhysicalChange changes) {
    return FormChange(source).withPhysicalChanges(std::move(changes));
}

inline FormChange createAbilityFormChange(ChangeSource source,
                                          AbilityChange changes) {
    return FormChange(source).withAbilityChanges(std::move(changes));
}

inline FormChange createTraitFormChange(ChangeSource source,
                                        TraitChange changes) {
    return FormChange(source).withTraitChanges(std::move(changes));
}

inline FormChange createBehaviorFormChange(ChangeSource source,
                                           BehaviorChange changes) {
    return FormChange(source).withBehaviorChanges(std::move(changes));
}

} // namespace crescent

#endif // CREATURE_ENGINE_CORE_CHANGES_FORM_CHANGE_H