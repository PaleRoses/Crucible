#ifndef CREATURE_ENGINE_CORE_VALIDATION_STATE_VALIDATOR_H
#define CREATURE_ENGINE_CORE_VALIDATION_STATE_VALIDATOR_H

#include "creature_engine/core/base/CreatureEnums.h"
#include "creature_engine/core/state/CreatureState.h"
#include <functional>
#include <string>
#include <unordered_map>
#include <vector>

namespace crescent {

class StateValidator {
  public:
    struct ValidationResult {
        bool isValid;
        std::vector<std::string> errors;
        std::vector<std::string> warnings;
        ValidationStatus status;
    };

    // Core state validation
    ValidationResult validateState(const CreatureState &state) const;

    // Specific subsystem validation
    ValidationResult validatePhysicalState(const PhysicalState &state) const;
    ValidationResult validateAbilityState(const AbilityState &state) const;
    ValidationResult validateTraitState(const TraitState &state) const;
    ValidationResult validateBehaviorState(const BehaviorState &state) const;

    // Cross-system validation
    ValidationResult
    validateStateRelationships(const CreatureState &state) const;

    // State transitions
    ValidationResult validateStateTransition(const CreatureState &from,
                                             const CreatureState &to) const;

    // Specific checks that other systems might need
    bool checkTraitRequirements(const TraitState &state) const;
    bool checkAbilityRequirements(const AbilityState &state) const;
    bool checkStateConsistency(const CreatureState &state) const;

  private:
    // Internal validation helpers
    bool validateBasicStateInvariants(const CreatureState &state,
                                      std::vector<std::string> &errors) const;
    bool validateStateDependencies(const CreatureState &state,
                                   std::vector<std::string> &errors) const;

    // Error handling
    void addError(std::vector<std::string> &errors,
                  const std::string &message) const;
    void addWarning(std::vector<std::string> &warnings,
                    const std::string &message) const;
};

} // namespace crescent

#endif // CREATURE_ENGINE_CORE_VALIDATION_STATE_VALIDATOR_H