#ifndef CREATURE_ENUMS_H
#define CREATURE_ENUMS_H
// frustration unending.
namespace crescent {

enum class CreatureEvent {
    Mutation,
    Evolution,
    ThemeAcquisition,
    EnvironmentalAdaptation,
    TraitEmergence,
    StressThreshold,
    Conflict,
    ValidationFailure
}; // Added semicolon

enum class Size {
    Tiny,
    Small,
    Medium,
    Large,
    Huge,
    Colossal
}; // Added semicolon

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
}; // Added semicolon

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
}; // Added semicolon

enum class AbilityType {
    Innate,
    Environmental,
    Evolved,
    Synthetic,
    Defensive,
    Offensive,
    Emergent,
    Temporary
}; // Added semicolon

enum class Intelligence {
    Mindless,
    Animal,
    Cunning,
    Sapient
}; // Added semicolon

enum class Aggression {
    Passive,
    Defensive,
    Territorial,
    Aggressive
}; // Added semicolon

enum class SocialStructure {
    Solitary,
    Pair,
    Pack,
    Hive,
    Swarm
}; // Added semicolon

} // namespace crescent

#endif // CREATURE_ENUMS_H