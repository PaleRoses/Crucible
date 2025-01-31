#include "crescent/CreatureExceptions.h"
#include "crescent/private/InternalDetails.h"
#include <array>
#include <string>
#include <unordered_map>

namespace crescent {

// Define string conversion maps for each enum
namespace {

const std::unordered_map<Size, std::string> sizeToString = {
    {Size::Tiny, "Tiny"},     {Size::Small, "Small"},
    {Size::Medium, "Medium"}, {Size::Large, "Large"},
    {Size::Huge, "Huge"},     {Size::Colossal, "Colossal"}};

const std::unordered_map<BodyShape, std::string> shapeToString = {
    {BodyShape::Avian, "Avian"},           {BodyShape::Draconic, "Draconic"},
    {BodyShape::Serpentine, "Serpentine"}, {BodyShape::Arachnid, "Arachnid"},
    {BodyShape::Chitinous, "Chitinous"},   {BodyShape::Amorphous, "Amorphous"},
    {BodyShape::Humanoid, "Humanoid"},     {BodyShape::Bestial, "Bestial"},
    {BodyShape::Aberrant, "Aberrant"}};

const std::unordered_map<Locomotion, std::string> locomotionToString = {
    {Locomotion::Walker, "Walker"},      {Locomotion::Flyer, "Flyer"},
    {Locomotion::Swimmer, "Swimmer"},    {Locomotion::Burrower, "Burrower"},
    {Locomotion::Phaser, "Phaser"},      {Locomotion::Teleporter, "Teleporter"},
    {Locomotion::Crawler, "Crawler"},    {Locomotion::Floater, "Floater"},
    {Locomotion::Slitherer, "Slitherer"}};

const std::unordered_map<AbilityType, std::string> abilityTypeToString = {
    {AbilityType::Innate, "Innate"},
    {AbilityType::Environmental, "Environmental"},
    {AbilityType::Evolved, "Evolved"},
    {AbilityType::Synthetic, "Synthetic"},
    {AbilityType::Defensive, "Defensive"},
    {AbilityType::Offensive, "Offensive"},
    {AbilityType::Emergent, "Emergent"},
    {AbilityType::Temporary, "Temporary"}};

const std::unordered_map<Intelligence, std::string> intelligenceToString = {
    {Intelligence::Mindless, "Mindless"},
    {Intelligence::Animal, "Animal"},
    {Intelligence::Cunning, "Cunning"},
    {Intelligence::Sapient, "Sapient"}};

const std::unordered_map<Aggression, std::string> aggressionToString = {
    {Aggression::Passive, "Passive"},
    {Aggression::Defensive, "Defensive"},
    {Aggression::Territorial, "Territorial"},
    {Aggression::Aggressive, "Aggressive"}};

const std::unordered_map<SocialStructure, std::string> socialStructureToString =
    {{SocialStructure::Solitary, "Solitary"},
     {SocialStructure::Pair, "Pair"},
     {SocialStructure::Pack, "Pack"},
     {SocialStructure::Hive, "Hive"},
     {SocialStructure::Swarm, "Swarm"}};

// Reverse maps for string to enum conversion
template <typename T>
std::unordered_map<std::string, T>
createReverseMap(const std::unordered_map<T, std::string> &forward) {

    std::unordered_map<std::string, T> reverse;
    for (const auto &[key, value] : forward) {
        reverse[value] = key;
    }
    return reverse;
}

} // anonymous namespace

// Serializer implementation
template <> std::string Serializer::enumToString(Size value) {
    try {
        return sizeToString.at(value);
    } catch (const std::out_of_range &) {
        throw SerializationException("Invalid Size enum value");
    }
}

template <>
std::optional<Size> Serializer::stringToEnum(const std::string &str) {
    static const auto reverseMap = createReverseMap(sizeToString);
    auto it = reverseMap.find(str);
    return it != reverseMap.end() ? std::optional{it->second} : std::nullopt;
}

// Similar implementations for other enum types...
template <> std::string Serializer::enumToString(BodyShape value) {
    try {
        return shapeToString.at(value);
    } catch (const std::out_of_range &) {
        throw SerializationException("Invalid BodyShape enum value");
    }
}

template <>
std::optional<BodyShape> Serializer::stringToEnum(const std::string &str) {
    static const auto reverseMap = createReverseMap(shapeToString);
    auto it = reverseMap.find(str);
    return it != reverseMap.end() ? std::optional{it->second} : std::nullopt;
}

// JSON serialization helpers
namespace detail {

template <typename T> nlohmann::json serializeEnum(T value) {
    return Serializer::enumToString(value);
}

template <typename T> T deserializeEnum(const nlohmann::json &json) {
    if (!json.is_string()) {
        throw SerializationException(
            "Expected string for enum deserialization");
    }

    auto value = Serializer::stringToEnum<T>(json.get<std::string>());
    if (!value) {
        throw SerializationException("Invalid enum value: " +
                                     json.get<std::string>());
    }

    return *value;
}

template <typename T>
nlohmann::json serializeVector(const std::vector<T> &vec) {
    nlohmann::json array = nlohmann::json::array();
    for (const auto &item : vec) {
        array.push_back(item.serializeToJson());
    }
    return array;
}

template <typename T>
std::vector<T> deserializeVector(const nlohmann::json &json) {
    if (!json.is_array()) {
        throw SerializationException(
            "Expected array for vector deserialization");
    }

    std::vector<T> result;
    for (const auto &item : json) {
        result.push_back(T::deserializeFromJson(item));
    }
    return result;
}

// Container validation
template <typename T> bool validateContainer(const T &container) {
    for (const auto &item : container) {
        if (!item.isValid())
            return false;
    }
    return true;
}

// Custom type serialization
nlohmann::json
serializeAbilitySet(const std::unordered_set<Ability> &abilities) {
    nlohmann::json array = nlohmann::json::array();
    for (const auto &ability : abilities) {
        array.push_back(ability.serializeToJson());
    }
    return array;
}

std::unordered_set<Ability> deserializeAbilitySet(const nlohmann::json &json) {
    if (!json.is_array()) {
        throw SerializationException(
            "Expected array for ability set deserialization");
    }

    std::unordered_set<Ability> result;
    for (const auto &item : json) {
        result.insert(Ability::deserializeFromJson(item));
    }
    return result;
}

} // namespace detail

} // namespace crescent