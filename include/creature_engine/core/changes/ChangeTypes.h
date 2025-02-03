#ifndef CREATURE_ENGINE_CORE_CHANGES_CHANGE_TYPES_H
#define CREATURE_ENGINE_CORE_CHANGES_CHANGE_TYPES_H

#include "creature_engine/core/base/CreatureEnums.h"
#include <optional>
#include <string>
#include <unordered_map>
#include <unordered_set>
#include <vector>

namespace crescent {

// Forward declarations
class CreatureState;

struct ChangeMetadata {
    std::string id;                // Unique change identifier
    ChangeSource source;           // What system requested this
    ChangePriority priority;       // How important is this change
    std::string description;       // Human-readable description
    std::vector<std::string> tags; // For filtering/categorizing changes
};

struct PhysicalChange {
    std::optional<Size> size;
    std::optional<BodyShape> shape;
    std::vector<std::pair<Locomotion, bool>>
        locomotionChanges; // add/remove pairs

    // Feature modifications
    std::unordered_map<std::string, float> featureModifiers;
    std::unordered_set<std::string> addFeatures;
    std::unordered_set<std::string> removeFeatures;

    // Adaptation capabilities
    std::unordered_map<std::string, float> adaptabilityModifiers;
};

struct AbilityChange {
    // Direct ability modifications
    std::vector<Ability> addAbilities;
    std::vector<std::string> removeAbilities;
    std::unordered_map<std::string, float> powerModifiers;

    // Capability changes
    std::unordered_map<std::string, float> effectiveness;
    std::unordered_set<std::string> unlockRequirements;
    std::unordered_set<std::string> addSynthesisCompatibility;
};

struct TraitChange {
    // Core trait changes
    std::vector<TraitDefinition> addTraits;
    std::vector<std::string> removeTraits;

    // Manifestation changes
    std::unordered_map<std::string, float> traitStrengthModifiers;
    std::unordered_map<std::string, float> environmentalAffinityModifiers;

    // Synthesis and mutation
    std::unordered_map<std::string, float> synthesisThresholdModifiers;
    std::unordered_set<std::string> addMutationPaths;
};

struct BehaviorChange {
    std::optional<Intelligence> intelligence;
    std::optional<Aggression> aggression;
    std::optional<SocialStructure> socialStructure;

    // Behavior modifications
    std::unordered_map<std::string, float> behaviorModifiers;
    std::unordered_set<std::string> addBehaviors;
    std::unordered_set<std::string> removeBehaviors;

    // Response changes
    std::unordered_map<std::string, float> stressResponseModifiers;
    std::unordered_map<std::string, float> environmentalResponseModifiers;
};

struct FormChange {
    ChangeMetadata metadata;

    // Core changes - all optional
    std::optional<PhysicalChange> physical;
    std::optional<AbilityChange> abilities;
    std::optional<TraitChange> traits;
    std::optional<BehaviorChange> behavior;

    // Validation and combination
    bool isValid() const;
    bool canCombineWith(const FormChange &other) const;
    bool conflictsWith(const FormChange &other) const;

    // Undo support
    std::optional<FormChange> generateUndo() const;

    // Application results
    ChangeResult apply(CreatureState &state) const;
};

} // namespace crescent

#endif // CREATURE_ENGINE_CORE_CHANGES_CHANGE_TYPES_H