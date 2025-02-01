#ifndef CREATURE_ENUMS_H
#define CREATURE_ENUMS_H
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
};

enum class Size { Tiny, Small, Medium, Large, Huge, Colossal };

enum class AdaptabilityType { Physical, Mental, Environmental, Social };

enum class ValidationStatus { Success, Warning, Error, Critical };

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

enum class Intelligence { Mindless, Animal, Cunning, Sapient };

enum class Aggression { Passive, Defensive, Territorial, Aggressive };

enum class SocialStructure { Solitary, Pair, Pack, Hive, Swarm };

} // namespace crescent

#endif // CREATURE_ENUMS_H