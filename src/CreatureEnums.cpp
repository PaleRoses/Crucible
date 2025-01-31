#include "crescent/CreatureEnums.h"
#include "crescent/CreatureExceptions.h"
#include <optional>
#include <string>
#include <unordered_map>

namespace crescent {

namespace {
// String conversion maps
const std::unordered_map<CreatureEvent, std::string> eventToString = {
    {CreatureEvent::Mutation, "Mutation"},
    {CreatureEvent::Evolution, "Evolution"},
    {CreatureEvent::ThemeAcquisition, "ThemeAcquisition"},
    {CreatureEvent::EnvironmentalAdaptation, "EnvironmentalAdaptation"},
    {CreatureEvent::TraitEmergence, "TraitEmergence"},
    {CreatureEvent::StressThreshold, "StressThreshold"},
    {CreatureEvent::Conflict, "Conflict"},
    {CreatureEvent::ValidationFailure, "ValidationFailure"}};

const std::unordered_map<std::string, CreatureEvent> stringToEvent = {
    {"Mutation", CreatureEvent::Mutation},
    {"Evolution", CreatureEvent::Evolution},
    {"ThemeAcquisition", CreatureEvent::ThemeAcquisition},
    {"EnvironmentalAdaptation", CreatureEvent::EnvironmentalAdaptation},
    {"TraitEmergence", CreatureEvent::TraitEmergence},
    {"StressThreshold", CreatureEvent::StressThreshold},
    {"Conflict", CreatureEvent::Conflict},
    {"ValidationFailure", CreatureEvent::ValidationFailure}};

// String conversion maps for Size
const std::unordered_map<Size, std::string> sizeToString = {
    {Size::Tiny, "Tiny"},     {Size::Small, "Small"},
    {Size::Medium, "Medium"}, {Size::Large, "Large"},
    {Size::Huge, "Huge"},     {Size::Colossal, "Colossal"}};

const std::unordered_map<std::string, Size> stringToSize = {
    {"Tiny", Size::Tiny},     {"Small", Size::Small},
    {"Medium", Size::Medium}, {"Large", Size::Large},
    {"Huge", Size::Huge},     {"Colossal", Size::Colossal}};

// String conversion maps for BodyShape
const std::unordered_map<BodyShape, std::string> bodyShapeToString = {
    {BodyShape::Avian, "Avian"},           {BodyShape::Draconic, "Draconic"},
    {BodyShape::Serpentine, "Serpentine"}, {BodyShape::Arachnid, "Arachnid"},
    {BodyShape::Chitinous, "Chitinous"},   {BodyShape::Amorphous, "Amorphous"},
    {BodyShape::Humanoid, "Humanoid"},     {BodyShape::Bestial, "Bestial"},
    {BodyShape::Aberrant, "Aberrant"}};

const std::unordered_map<std::string, BodyShape> stringToBodyShape = {
    {"Avian", BodyShape::Avian},           {"Draconic", BodyShape::Draconic},
    {"Serpentine", BodyShape::Serpentine}, {"Arachnid", BodyShape::Arachnid},
    {"Chitinous", BodyShape::Chitinous},   {"Amorphous", BodyShape::Amorphous},
    {"Humanoid", BodyShape::Humanoid},     {"Bestial", BodyShape::Bestial},
    {"Aberrant", BodyShape::Aberrant}};

// String conversion maps for Locomotion
const std::unordered_map<Locomotion, std::string> locomotionToString = {
    {Locomotion::Walker, "Walker"},      {Locomotion::Flyer, "Flyer"},
    {Locomotion::Swimmer, "Swimmer"},    {Locomotion::Burrower, "Burrower"},
    {Locomotion::Phaser, "Phaser"},      {Locomotion::Teleporter, "Teleporter"},
    {Locomotion::Crawler, "Crawler"},    {Locomotion::Floater, "Floater"},
    {Locomotion::Slitherer, "Slitherer"}};

const std::unordered_map<std::string, Locomotion> stringToLocomotion = {
    {"Walker", Locomotion::Walker},      {"Flyer", Locomotion::Flyer},
    {"Swimmer", Locomotion::Swimmer},    {"Burrower", Locomotion::Burrower},
    {"Phaser", Locomotion::Phaser},      {"Teleporter", Locomotion::Teleporter},
    {"Crawler", Locomotion::Crawler},    {"Floater", Locomotion::Floater},
    {"Slitherer", Locomotion::Slitherer}};

// String conversion maps for AbilityType
const std::unordered_map<AbilityType, std::string> abilityTypeToString = {
    {AbilityType::Innate, "Innate"},
    {AbilityType::Environmental, "Environmental"},
    {AbilityType::Evolved, "Evolved"},
    {AbilityType::Synthetic, "Synthetic"},
    {AbilityType::Defensive, "Defensive"},
    {AbilityType::Offensive, "Offensive"},
    {AbilityType::Emergent, "Emergent"},
    {AbilityType::Temporary, "Temporary"}};

const std::unordered_map<std::string, AbilityType> stringToAbilityType = {
    {"Innate", AbilityType::Innate},
    {"Environmental", AbilityType::Environmental},
    {"Evolved", AbilityType::Evolved},
    {"Synthetic", AbilityType::Synthetic},
    {"Defensive", AbilityType::Defensive},
    {"Offensive", AbilityType::Offensive},
    {"Emergent", AbilityType::Emergent},
    {"Temporary", AbilityType::Temporary}};

// String conversion maps for Intelligence
const std::unordered_map<Intelligence, std::string> intelligenceToString = {
    {Intelligence::Mindless, "Mindless"},
    {Intelligence::Animal, "Animal"},
    {Intelligence::Cunning, "Cunning"},
    {Intelligence::Sapient, "Sapient"}};

const std::unordered_map<std::string, Intelligence> stringToIntelligence = {
    {"Mindless", Intelligence::Mindless},
    {"Animal", Intelligence::Animal},
    {"Cunning", Intelligence::Cunning},
    {"Sapient", Intelligence::Sapient}};

// String conversion maps for Aggression
const std::unordered_map<Aggression, std::string> aggressionToString = {
    {Aggression::Passive, "Passive"},
    {Aggression::Defensive, "Defensive"},
    {Aggression::Territorial, "Territorial"},
    {Aggression::Aggressive, "Aggressive"}};

const std::unordered_map<std::string, Aggression> stringToAggression = {
    {"Passive", Aggression::Passive},
    {"Defensive", Aggression::Defensive},
    {"Territorial", Aggression::Territorial},
    {"Aggressive", Aggression::Aggressive}};

// String conversion maps for SocialStructure
const std::unordered_map<SocialStructure, std::string> socialStructureToString =
    {{SocialStructure::Solitary, "Solitary"},
     {SocialStructure::Pair, "Pair"},
     {SocialStructure::Pack, "Pack"},
     {SocialStructure::Hive, "Hive"},
     {SocialStructure::Swarm, "Swarm"}};

const std::unordered_map<std::string, SocialStructure> stringToSocialStructure =
    {{"Solitary", SocialStructure::Solitary},
     {"Pair", SocialStructure::Pair},
     {"Pack", SocialStructure::Pack},
     {"Hive", SocialStructure::Hive},
     {"Swarm", SocialStructure::Swarm}};

// Template functions for enum conversion
template <typename EnumType>
std::string enumToString(const std::unordered_map<EnumType, std::string> &map,
                         EnumType value) {
    try {
        return map.at(value);
    } catch (const std::out_of_range &) {
        throw CreatureException("Invalid enum value");
    }
}

template <typename EnumType>
std::optional<EnumType>
stringToEnum(const std::unordered_map<std::string, EnumType> &map,
             const std::string &str) {
    auto it = map.find(str);
    if (it != map.end()) {
        return it->second;
    }
    return std::nullopt;
}
} // namespace

// Enum utilities
std::string enumToString(CreatureEvent event) {
    return enumToString(eventToString, event);
}

std::optional<CreatureEvent> stringToEnumCreatureEvent(const std::string &str) {
    return stringToEnum(stringToEvent, str);
}

std::string enumToString(Size size) { return enumToString(sizeToString, size); }

std::optional<Size> stringToEnumSize(const std::string &str) {
    return stringToEnum(stringToSize, str);
}

std::string enumToString(BodyShape shape) {
    return enumToString(bodyShapeToString, shape);
}

std::optional<BodyShape> stringToEnumBodyShape(const std::string &str) {
    return stringToEnum(stringToBodyShape, str);
}

std::string enumToString(Locomotion locomotion) {
    return enumToString(locomotionToString, locomotion);
}

std::optional<Locomotion> stringToEnumLocomotion(const std::string &str) {
    return stringToEnum(stringToLocomotion, str);
}

std::string enumToString(AbilityType type) {
    return enumToString(abilityTypeToString, type);
}

std::optional<AbilityType> stringToEnumAbilityType(const std::string &str) {
    return stringToEnum(stringToAbilityType, str);
}

std::string enumToString(Intelligence intelligence) {
    return enumToString(intelligenceToString, intelligence);
}

std::optional<Intelligence> stringToEnumIntelligence(const std::string &str) {
    return stringToEnum(stringToIntelligence, str);
}

std::string enumToString(Aggression aggression) {
    return enumToString(aggressionToString, aggression);
}

std::optional<Aggression> stringToEnumAggression(const std::string &str) {
    return stringToEnum(stringToAggression, str);
}

std::string enumToString(SocialStructure structure) {
    return enumToString(socialStructureToString, structure);
}

std::optional<SocialStructure>
stringToEnumSocialStructure(const std::string &str) {
    return stringToEnum(stringToSocialStructure, str);
}

// Enum type traits and characteristics
namespace EnumTraits {
bool isHostile(Aggression aggression) {
    return aggression == Aggression::Aggressive ||
           aggression == Aggression::Territorial;
}

bool isSocial(SocialStructure structure) {
    return structure != SocialStructure::Solitary;
}

bool canFly(Locomotion movement) { return movement == Locomotion::Flyer; }

bool isAquatic(Locomotion movement) { return movement == Locomotion::Swimmer; }

bool isEthereal(BodyShape shape) { return shape == BodyShape::Amorphous; }

size_t getMaxGroupSize(SocialStructure structure) {
    switch (structure) {
    case SocialStructure::Solitary:
        return 1;
    case SocialStructure::Pair:
        return 2;
    case SocialStructure::Pack:
        return 8;
    case SocialStructure::Hive:
        return 100;
    case SocialStructure::Swarm:
        return 1000;
    default:
        throw CreatureException("Invalid SocialStructure value");
    }
}

float getRelativeSize(Size size) {
    switch (size) {
    case Size::Tiny:
        return 0.1f;
    case Size::Small:
        return 0.5f;
    case Size::Medium:
        return 1.0f;
    case Size::Large:
        return 2.0f;
    case Size::Huge:
        return 5.0f;
    case Size::Colossal:
        return 10.0f;
    default:
        throw CreatureException("Invalid Size value");
    }
}

AbilityType getUpgradedType(AbilityType type) {
    switch (type) {
    case AbilityType::Innate:
        return AbilityType::Evolved;
    case AbilityType::Environmental:
        return AbilityType::Synthetic;
    case AbilityType::Defensive:
        return AbilityType::Offensive;
    default:
        return type;
    }
}
} // namespace EnumTraits

} // namespace crescent