#ifndef CREATURE_ENGINE_CORE_BASE_CREATURE_ENUMS_H
#define CREATURE_ENGINE_CORE_BASE_CREATURE_ENUMS_H

namespace crescent {

// Event tracking
enum class CreatureEvent {
    Mutation,
    Evolution,
    ThemeAcquisition,
    EnvironmentalAdaptation,
    TraitEmergence,
    StressThreshold,
    Conflict,
    ValidationFailure,
    ChangeApplied,  // New: Track form changes
    ChangeRejected, // New: Failed changes
    ChangeReverted, // New: Undo operations
    StateInvalid    // New: Invalid state detection
};

// Physical characteristics
enum class Size { Tiny, Small, Medium, Large, Huge, Colossal };

enum class BodyShape {
    Avian,
    Draconic,
    Serpentine,
    Arachnid,
    Chitinous,
    Amorphous,
    Humanoid,
    Bestial,
    Aberrant
};

enum class Locomotion {
    Walker,
    Flyer,
    Swimmer,
    Burrower,
    Phaser,
    Teleporter,
    Crawler,
    Floater,
    Slitherer
};

// Capability classifications
enum class AbilityType {
    Innate,
    Environmental,
    Evolved,
    Synthetic,
    Defensive,
    Offensive,
    Emergent,
    Temporary
};

// Behavior patterns
enum class Intelligence { Mindless, Animal, Cunning, Sapient };

enum class Aggression { Passive, Defensive, Territorial, Aggressive };

enum class SocialStructure { Solitary, Pair, Pack, Hive, Swarm };

// Change system enums
enum class ChangeSource {
    Environment,
    Evolution,
    Theme,
    Stress,
    Mutation,
    Synthesis,
    Manual,    // Direct user/system changes
    Correction // Validation fixes
};

enum class ChangePriority {
    Critical = 100, // Must be applied
    High = 75,      // Strong preference
    Normal = 50,    // Standard changes
    Low = 25,       // Optional changes
    Cosmetic = 0    // Visual only
};

enum class ChangeResult {
    Applied,      // Change was successful
    Rejected,     // Change was invalid
    Partial,      // Only some aspects applied
    Conflicting,  // Conflicts with other changes
    InvalidState, // Would create invalid state
    Pending       // Awaiting other changes
};

// Validation statuses
enum class ValidationStatus { Success, Warning, Error, Critical };

// Adaptability types
enum class AdaptabilityType { Physical, Mental, Environmental, Social };

} // namespace crescent

#endif // CREATURE_ENGINE_CORE_BASE_CREATURE_ENUMS_H