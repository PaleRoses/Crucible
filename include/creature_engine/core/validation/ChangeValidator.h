#ifndef CREATURE_ENGINE_CORE_VALIDATION_CHANGE_VALIDATOR_H
#define CREATURE_ENGINE_CORE_VALIDATION_CHANGE_VALIDATOR_H

#include "creature_engine/core/base/CreatureEnums.h"
#include "creature_engine/core/changes/ChangeTypes.h"
#include "creature_engine/core/state/CreatureState.h"
#include <functional>
#include <string>
#include <unordered_map>
#include <vector>

namespace crescent {

class ChangeValidator {
  public:
    // Validation result with details
    struct ValidationResult {
        bool isValid;
        std::vector<std::string> errors;
        std::vector<std::string> warnings;
    };

    // Custom validation rule
    using ValidationRule =
        std::function<bool(const FormChange &, const CreatureState &)>;

    // Core validation
    ValidationResult validateChange(const FormChange &change,
                                    const CreatureState &currentState) const;

    ValidationResult validateChanges(const std::vector<FormChange> &changes,
                                     const CreatureState &currentState) const;

    // State-specific validation
    ValidationResult validatePhysicalChanges(const PhysicalChange &change,
                                             const PhysicalState &state) const;
    ValidationResult validateAbilityChanges(const AbilityChange &change,
                                            const AbilityState &state) const;
    ValidationResult validateTraitChanges(const TraitChange &change,
                                          const TraitState &state) const;
    ValidationResult validateBehaviorChanges(const BehaviorChange &change,
                                             const BehaviorState &state) const;

    // Cross-state validation
    ValidationResult
    validateStateDependencies(const FormChange &change,
                              const CreatureState &state) const;

    // Rule management
    void addValidationRule(const std::string &ruleId, ValidationRule rule);
    void removeValidationRule(const std::string &ruleId);
    bool hasValidationRule(const std::string &ruleId) const;

    // Configuration
    void setValidationLevel(ValidationStatus minLevel);
    ValidationStatus getValidationLevel() const;

  private:
    // Validation rules storage
    std::unordered_map<std::string, ValidationRule> rules_;

    // Validation configuration
    ValidationStatus minValidationLevel_ = ValidationStatus::Warning;

    // Internal validation helpers
    bool checkBasicValidity(const FormChange &change,
                            std::vector<std::string> &errors) const;
    bool checkStateConsistency(const FormChange &change,
                               const CreatureState &state,
                               std::vector<std::string> &errors) const;
    bool checkSystemBoundaries(const FormChange &change,
                               std::vector<std::string> &errors) const;

    // Rule application
    ValidationResult applyRules(const FormChange &change,
                                const CreatureState &state) const;

    // Error handling
    void addError(std::vector<std::string> &errors,
                  const std::string &message) const;
    void addWarning(std::vector<std::string> &warnings,
                    const std::string &message) const;
};

} // namespace crescent

#endif // CREATURE_ENGINE_CORE_VALIDATION_CHANGE_VALIDATOR_H