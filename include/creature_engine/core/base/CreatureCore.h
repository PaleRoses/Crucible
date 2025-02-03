#ifndef CREATURE_ENGINE_CORE_BASE_CREATURE_CORE_H
#define CREATURE_ENGINE_CORE_BASE_CREATURE_CORE_H

#include "creature_engine/core/base/CreatureEnums.h"
#include "creature_engine/core/changes/ChangeProcessor.h"
#include "creature_engine/core/changes/FormChange.h"
#include "creature_engine/core/state/CreatureState.h"
#include "creature_engine/io/SerializationStructures.h"

#include <memory>
#include <nlohmann/json.hpp>
#include <string>
#include <unordered_map>
#include <unordered_set>
#include <vector>

namespace crescent {

class CreatureCore {
  public:
    // Construction/Destruction
    CreatureCore();
    ~CreatureCore() = default;

    // Prevent copying, allow moving
    CreatureCore(const CreatureCore &) = delete;
    CreatureCore &operator=(const CreatureCore &) = delete;
    CreatureCore(CreatureCore &&) = default;
    CreatureCore &operator=(CreatureCore &&) = default;

    // Core state access
    CreatureState &getState() { return state_; }
    const CreatureState &getState() const { return state_; }

    // Change processing
    void applyChange(const FormChange &change);
    void applyChanges(const std::vector<FormChange> &changes);
    bool undoLastChange();
    const std::vector<FormChange> &getRecentChanges(size_t count = 10) const;

    // State management
    bool isValid() const;
    void revertToLastValidState();

    // Serialization
    nlohmann::json
    serializeToJson(const SerializationOptions &options = {}) const;
    static CreatureCore deserializeFromJson(const nlohmann::json &data);

  private:
    CreatureState state_;
    std::unique_ptr<ChangeProcessor> changeProcessor_;

    // History tracking
    std::vector<FormChange> changeHistory_;
    size_t maxHistorySize_ = 100; // Configurable

    // Internal helpers
    void pruneHistory();
    bool validateChange(const FormChange &change) const;
    void notifyChangeApplied(const FormChange &change);
};

// Core state structures
struct SynthesisState {
    std::string sourceTrait;
    std::string targetEnvironment;
    float integrationLevel;
    std::unordered_set<std::string> grantedProperties;

    nlohmann::json
    serializeToJson(const SerializationOptions &options = {}) const;
    static SynthesisState deserializeFromJson(const nlohmann::json &data);
};

struct StressState {
    std::string source;
    float level;
    std::unordered_set<std::string> effects;

    nlohmann::json
    serializeToJson(const SerializationOptions &options = {}) const;
    static StressState deserializeFromJson(const nlohmann::json &data);
};

struct PhysicalForm {
    Size size;
    BodyShape shape;
    Locomotion primaryMovement;
    std::vector<Locomotion> secondaryMovements;
    std::unordered_set<std::string> distinctiveFeatures;

    // Adaptation and synthesis capabilities
    std::unordered_map<std::string, float> adaptabilityScores;
    std::unordered_map<std::string, float> synthesisAffinities;

    nlohmann::json
    serializeToJson(const SerializationOptions &options = {}) const;
    static PhysicalForm deserializeFromJson(const nlohmann::json &data);
};

struct Ability {
    std::string name;
    std::string description;
    AbilityType type;
    int powerLevel;
    bool isActive;

    std::unordered_set<std::string> requirements;
    std::unordered_map<std::string, float> environmentalModifiers;

    bool canSynthesize;
    std::unordered_set<std::string> synthesisCompatibility;

    nlohmann::json
    serializeToJson(const SerializationOptions &options = {}) const;
    static Ability deserializeFromJson(const nlohmann::json &data);
};

struct TraitDefinition {
    std::unordered_set<std::string> manifestations;
    std::vector<Ability> abilities;
    std::unordered_map<std::string, float> environmentalAffinities;
    std::unordered_set<std::string> incompatibleWith;
    std::unordered_set<std::string> mutations;
    std::unordered_map<std::string, float> themeResonance;
    std::unordered_map<std::string, float> synthesisThresholds;

    nlohmann::json
    serializeToJson(const SerializationOptions &options = {}) const;
    static TraitDefinition deserializeFromJson(const nlohmann::json &data);
};

struct Behavior {
    Intelligence intelligence;
    Aggression aggression;
    SocialStructure socialStructure;

    std::unordered_set<std::string> specialBehaviors;
    std::unordered_map<std::string, float> environmentalBehaviors;
    std::unordered_map<std::string, float> themeInfluences;
    std::unordered_map<std::string, float> stressResponses;
    std::unordered_map<std::string, float> synthesisInfluences;

    nlohmann::json
    serializeToJson(const SerializationOptions &options = {}) const;
    static Behavior deserializeFromJson(const nlohmann::json &data);
};

} // namespace crescent

#endif // CREATURE_ENGINE_CORE_BASE_CREATURE_CORE_H