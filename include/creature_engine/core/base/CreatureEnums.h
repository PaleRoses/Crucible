#ifndef CREATURE_ENGINE_CORE_BASE_CREATURE_ENUMS_H
#define CREATURE_ENGINE_CORE_BASE_CREATURE_ENUMS_H

namespace crescent {

/**
 * @brief Physical characteristics of creatures
 */
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

/**
 * @brief Trait and ability classifications
 */
enum class TraitOrigin {
    Innate,     // Born with trait
    Evolved,    // Developed through evolution
    Synthesized // Gained through synthesis
};

enum class TraitCategory {
    Physical,   // Physical attributes
    Magical,    // Magical capabilities
    Behavioral, // Behavioral patterns
    Adaptive,   // Adaptation-focused
    Synthetic   // Synthesis-derived
};

enum class AbilityType {
    Passive,   // Always active
    Active,    // Must be activated
    Reactive,  // Triggers in response
    Sustained, // Requires maintenance
    Permanent  // Cannot be lost
};

/**
 * @brief Behavioral characteristics
 */
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

/**
 * @brief Adaptation and synthesis tracking
 */
enum class AdaptationStage {
    None,       // No adaptation
    Initial,    // Beginning adaptation
    Partial,    // Partially adapted
    Complete,   // Fully adapted
    Specialized // Beyond full adaptation
};

enum class SynthesisLevel {
    Base,      // No synthesis
    Primary,   // First synthesis
    Secondary, // Second synthesis
    Tertiary,  // Third synthesis
    Quaternary // Final synthesis
};

/**
 * @brief System event and state tracking
 */
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

/**
 * @brief Change system classifications
 */
enum class ChangeSource {
    Environment, // Environmental pressure
    Evolution,   // Natural evolution
    Synthesis,   // Synthesis process
    Stress,      // Stress response
    Manual,      // Direct modification
    System       // System-driven change
};

enum class ChangePriority {
    Low = 0,       // Optional changes
    Normal = 50,   // Standard changes
    High = 75,     // Important changes
    Critical = 100 // Must-apply changes
};

} // namespace crescent

#endif // CREATURE_ENGINE_CORE_BASE_CREATURE_ENUMS_H