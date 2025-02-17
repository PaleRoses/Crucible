#ifndef CRUCIBLE_ENGINES_CREATURE_CORE_ENUMS_HPP
#define CRUCIBLE_ENGINES_CREATURE_CORE_ENUMS_HPP

namespace crucible {

// Physical characteristics
enum class Size {
    Tiny,    // Insect-sized
    Small,   // Cat-sized
    Medium,  // Human-sized
    Large,   // Horse-sized
    Huge,    // Elephant-sized
    Colossal // Building-sized
};

enum class BodyShape {
    Avian,      // Bird-like form
    Draconic,   // Dragon-like form
    Serpentine, // Snake-like form
    Arachnid,   // Spider-like form
    Chitinous,  // Insect-like form
    Amorphous,  // Shapeless form
    Humanoid,   // Human-like form
    Bestial,    // Beast-like form
    Aberrant    // Unnatural form
};

enum class Locomotion {
    Walker,     // Ground-based movement
    Flyer,      // Aerial movement
    Swimmer,    // Aquatic movement
    Burrower,   // Underground movement
    Phaser,     // Phase-based movement
    Teleporter, // Teleportation movement
    Crawler,    // Surface-clinging movement
    Floater,    // Hovering movement
    Slitherer   // Serpentine movement
};

// Behavioral characteristics
enum class Intelligence {
    Mindless, // No intelligence
    Animal,   // Basic intelligence
    Cunning,  // Advanced intelligence
    Sapient   // Human-like intelligence
};

enum class Aggression {
    Passive,     // Non-aggressive
    Defensive,   // Defends only
    Territorial, // Defends territory
    Aggressive   // Actively hostile
};

enum class SocialStructure {
    Solitary, // Lives alone
    Pair,     // Lives in pairs
    Pack,     // Small groups
    Hive,     // Large colony
    Swarm     // Massive groups
};

// Core system events and validation
enum class CreatureEvent {
    Created,           // Creature creation
    Adapted,           // Adaptation occurred
    Synthesized,       // Synthesis occurred
    TraitGained,       // New trait acquired
    TraitLost,         // Trait removed
    AbilityUnlocked,   // New ability available
    SpeciesEvolved,    // Species change
    StressThreshold,   // Stress threshold hit
    EnvironmentChange, // Environment changed
    ValidationFailed   // Validation error
};

enum class ValidationStatus {
    Success, // Validation passed
    Warning, // Non-critical issues
    Error,   // Critical issues
    Critical // Fatal issues
};

} // namespace crucible

#endif // CRUCIBLE_ENGINES_CREATURE_CORE_ENUMS_HPP