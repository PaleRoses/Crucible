#ifndef CREATURE_ENGINE_CORE_STATE_BEHAVIOR_STATE_H
#define CREATURE_ENGINE_CORE_STATE_BEHAVIOR_STATE_H

#include "creature_engine/core/base/CreatureEnums.h"
#include "creature_engine/core/changes/ChangeTypes.h"
#include <nlohmann/json.hpp>
#include <string>
#include <unordered_map>
#include <unordered_set>

namespace crescent {

class BehaviorState {
  public:
    // Construction
    BehaviorState() = default;
    ~BehaviorState() = default;

    // Core behavior properties
    Intelligence getIntelligence() const { return intelligence_; }
    void setIntelligence(Intelligence intel) { intelligence_ = intel; }

    Aggression getAggression() const { return aggression_; }
    void setAggression(Aggression aggr) { aggression_ = aggr; }

    SocialStructure getSocialStructure() const { return socialStructure_; }
    void setSocialStructure(SocialStructure social) {
        socialStructure_ = social;
    }

    // Base behavior patterns
    const std::unordered_set<std::string> &getBaseBehaviors() const {
        return baseBehaviors_;
    }
    bool addBaseBehavior(const std::string &behavior);
    bool removeBaseBehavior(const std::string &behavior);
    bool hasBaseBehavior(const std::string &behavior) const;

    // Theme influence on behavior
    float getThemeInfluence(const std::string &theme) const;
    void setThemeInfluence(const std::string &theme, float influence);

    // Change application
    bool canApplyChange(const BehaviorChange &change) const;
    bool applyChange(const BehaviorChange &change);
    std::optional<BehaviorChange>
    generateUndo(const BehaviorChange &change) const;

    // Validation
    bool isValid() const;
    std::vector<std::string> validate() const;

    // Serialization
    nlohmann::json serializeToJson() const;
    static BehaviorState deserializeFromJson(const nlohmann::json &json);

  private:
    // Core attributes
    Intelligence intelligence_ = Intelligence::Animal;
    Aggression aggression_ = Aggression::Defensive;
    SocialStructure socialStructure_ = SocialStructure::Solitary;

    // Base behaviors (before environmental/other modifications)
    std::unordered_set<std::string> baseBehaviors_;

    // Theme influences
    std::unordered_map<std::string, float> themeInfluences_;

    // Basic validation
    bool validateBasics() const;
    bool validateBehaviors() const;
    bool validateThemeInfluences() const;
};

} // namespace crescent

#endif // CREATURE_ENGINE_CORE_STATE_BEHAVIOR_STATE_H