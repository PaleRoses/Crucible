#ifndef CREATURE_ENGINE_CORE_CHANGES_FORM_CHANGE_H
#define CREATURE_ENGINE_CORE_CHANGES_FORM_CHANGE_H

#include "creature_engine/core/base/CreatureExceptions.h"
#include "creature_engine/core/changes/ChangeTypes.h"
#include <nlohmann/json.hpp>

namespace crescent {

class FormChange {
  public:
    // Construction/Destruction
    FormChange();
    explicit FormChange(ChangeSource source, std::string description = "");
    ~FormChange() = default;

    // Core data
    ChangeMetadata metadata;
    TraitChange traitChanges;

    // Builder pattern interface
    FormChange &setSource(ChangeSource source);
    FormChange &setPriority(ChangePriority priority);
    FormChange &setDescription(std::string description);
    FormChange &addTag(std::string tag);

    // Validation
    bool isValid() const;
    std::vector<std::string> validate() const;
    bool hasConflictsWith(const FormChange &other) const;

    // Change operations
    std::optional<FormChange> generateUndo() const;
    FormChange combineWith(const FormChange &other) const;

    // Serialization
    nlohmann::json serializeToJson() const;
    static FormChange deserializeFromJson(const nlohmann::json &json);

  private:
    // Validation helpers
    bool validateTraitChanges() const;
    bool validateSynthesisChanges() const;

    // Conflict detection
    bool checkTraitConflicts(const FormChange &other) const;
    bool checkSynthesisConflicts(const FormChange &other) const;
};

} // namespace crescent

#endif // CREATURE_ENGINE_CORE_CHANGES_FORM_CHANGE_H