#ifndef CREATURE_ENGINE_CORE_CHANGES_CHANGE_TYPES_H
#define CREATURE_ENGINE_CORE_CHANGES_CHANGE_TYPES_H

#include "creature_engine/core/base/CreatureEnums.h"
#include "creature_engine/traits/base/TraitDefinition.h"
#include <chrono>
#include <optional>
#include <string>
#include <unordered_map>
#include <vector>

namespace crescent {

struct ChangeSource {
    std::string sourceType; // "environment", "theme", etc
    std::string sourceId;   // Specific source identifier
    float intensity{0.0f};  // Source intensity/strength
};

struct ChangeMetadata {
    std::string id;                // Unique change identifier
    ChangeSource source;           // What triggered this change
    ChangePriority priority;       // Change importance
    std::string description;       // Human-readable description
    std::vector<std::string> tags; // For categorization
    std::chrono::system_clock::time_point timestamp;
};

struct SynthesisModification {
    std::string traitId;
    int newSynthesisLevel;
    float synthesisStrength;
    std::vector<std::string> grantedAbilities;
};

struct TraitChange {
    // Core trait changes
    std::vector<TraitDefinition> addTraits;
    std::vector<std::string> removeTraits;

    // Synthesis changes
    std::vector<SynthesisModification> synthesisChanges;

    // Stress response
    std::unordered_map<std::string, float> traitStressLevels;

    // Track what traits are suppressed/enhanced by stress
    std::unordered_set<std::string> suppressedTraits;
    std::unordered_set<std::string> enhancedTraits;
};

enum class ChangeResult {
    Success,          // Change applied successfully
    PartialSuccess,   // Some aspects applied
    ValidationFailed, // Failed validation
    ConflictDetected, // Conflicts with other changes
    BatchPending      // Part of uncommitted batch
};

} // namespace crescent

#endif // CREATURE_ENGINE_CORE_CHANGES_CHANGE_TYPES_H