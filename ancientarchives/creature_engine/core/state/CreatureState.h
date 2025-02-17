#ifndef CREATURE_ENGINE_CORE_STATE_CREATURE_STATE_H
#define CREATURE_ENGINE_CORE_STATE_CREATURE_STATE_H

#include "creature_engine/core/base/CreatureEnums.h"
#include "creature_engine/core/changes/FormChange.h"
#include "creature_engine/core/state/AbilityState.h"
#include "creature_engine/core/state/BehaviorState.h"
#include "creature_engine/core/state/PhysicalState.h"
#include "creature_engine/core/state/TraitState.h"

#include <memory>
#include <nlohmann/json.hpp>
#include <string>
#include <vector>

namespace crescent {

class CreatureState {
  public:
    // Construction
    CreatureState();
    explicit CreatureState(std::string id);
    ~CreatureState() = default;

    // Identity
    const std::string &getId() const { return id_; }
    void setId(const std::string &id) { id_ = id; }

    // State access
    PhysicalState &physical() { return physicalState_; }
    const PhysicalState &physical() const { return physicalState_; }

    AbilityState &abilities() { return abilityState_; }
    const AbilityState &abilities() const { return abilityState_; }

    TraitState &traits() { return traitState_; }
    const TraitState &traits() const { return traitState_; }

    BehaviorState &behavior() { return behaviorState_; }
    const BehaviorState &behavior() const { return behaviorState_; }

    // State validation
    bool isValid() const;
    std::vector<std::string> validate() const;
    void revertToLastValidState();

    // Change handling
    bool canApplyChange(const FormChange &change) const;
    ChangeResult applyChange(const FormChange &change);
    bool undoLastChange();

    // History
    const std::vector<FormChange> &getChangeHistory() const;
    void clearChangeHistory();

    // Serialization
    nlohmann::json serializeToJson() const;
    static CreatureState deserializeFromJson(const nlohmann::json &json);

    // State snapshots
    void saveSnapshot();
    bool restoreSnapshot();

  private:
    std::string id_;

    // Core states
    PhysicalState physicalState_;
    AbilityState abilityState_;
    TraitState traitState_;
    BehaviorState behaviorState_;

    // Change tracking
    std::vector<FormChange> changeHistory_;
    static constexpr size_t MAX_HISTORY_SIZE = 100;

    // State snapshots for reverting
    struct StateSnapshot {
        PhysicalState physical;
        AbilityState abilities;
        TraitState traits;
        BehaviorState behavior;
    };
    std::optional<StateSnapshot> lastValidState_;

    // Helper methods
    void pruneHistory();
    bool validateStateConsistency() const;
    void updateLastValidState();
};

} // namespace crescent

#endif // CREATURE_ENGINE_CORE_STATE_CREATURE_STATE_H