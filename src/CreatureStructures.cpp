#include "crescent/CreatureStructures.h"
#include "crescent/CreatureExceptions.h"
#include "crescent/private/InternalDetails.h"
#include <algorithm>
#include <sstream>

namespace crescent {

// PhysicalForm Implementation
nlohmann::json
PhysicalForm::serializeToJson(const SerializationOptions &options) const {
    nlohmann::json data;

    // Core attributes
    data["size"] = Serializer::enumToString(size);
    data["shape"] = Serializer::enumToString(shape);
    data["primaryMovement"] = Serializer::enumToString(primaryMovement);

    // Secondary movements
    data["secondaryMovements"] = nlohmann::json::array();
    for (const auto &movement : secondaryMovements) {
        data["secondaryMovements"].push_back(
            Serializer::enumToString(movement));
    }

    // Distinctive features
    if (!distinctiveFeatures.empty()) {
        data["distinctiveFeatures"] = nlohmann::json(distinctiveFeatures);
    }

    // Adaptability scores
    if (!adaptabilityScores.empty()) {
        data["adaptabilityScores"] = adaptabilityScores;
    }

    return data;
}

PhysicalForm PhysicalForm::deserializeFromJson(const nlohmann::json &data) {
    PhysicalForm form;

    try {
        // Core attributes
        if (auto size = Serializer::stringToEnum<Size>(data["size"])) {
            form.size = *size;
        } else {
            throw SerializationException("Invalid size value");
        }

        if (auto shape = Serializer::stringToEnum<BodyShape>(data["shape"])) {
            form.shape = *shape;
        } else {
            throw SerializationException("Invalid shape value");
        }

        if (auto movement =
                Serializer::stringToEnum<Locomotion>(data["primaryMovement"])) {
            form.primaryMovement = *movement;
        } else {
            throw SerializationException("Invalid primary movement value");
        }

        // Secondary movements
        if (data.contains("secondaryMovements")) {
            for (const auto &movementStr : data["secondaryMovements"]) {
                if (auto movement =
                        Serializer::stringToEnum<Locomotion>(movementStr)) {
                    form.secondaryMovements.push_back(*movement);
                }
            }
        }

        // Distinctive features
        if (data.contains("distinctiveFeatures")) {
            for (const auto &feature : data["distinctiveFeatures"]) {
                form.distinctiveFeatures.insert(feature.get<std::string>());
            }
        }

        // Adaptability scores
        if (data.contains("adaptabilityScores")) {
            form.adaptabilityScores =
                data["adaptabilityScores"]
                    .get<std::unordered_map<std::string, float>>();
        }

    } catch (const nlohmann::json::exception &e) {
        throw SerializationException("Failed to deserialize PhysicalForm: " +
                                     std::string(e.what()));
    }

    return form;
}

// Ability Implementation
nlohmann::json
Ability::serializeToJson(const SerializationOptions &options) const {
    nlohmann::json data;

    data["name"] = name;
    data["description"] = description;
    data["type"] = Serializer::enumToString(type);
    data["powerLevel"] = powerLevel;
    data["isActive"] = isActive;

    if (!requirements.empty()) {
        data["requirements"] = requirements;
    }

    if (!environmentalModifiers.empty()) {
        data["environmentalModifiers"] = environmentalModifiers;
    }

    return data;
}

Ability Ability::deserializeFromJson(const nlohmann::json &data) {
    Ability ability;

    try {
        ability.name = data["name"].get<std::string>();
        ability.description = data["description"].get<std::string>();

        if (auto type = Serializer::stringToEnum<AbilityType>(data["type"])) {
            ability.type = *type;
        } else {
            throw SerializationException("Invalid ability type value");
        }

        ability.powerLevel = data["powerLevel"].get<int>();
        ability.isActive = data["isActive"].get<bool>();

        if (data.contains("requirements")) {
            for (const auto &req : data["requirements"]) {
                ability.requirements.insert(req.get<std::string>());
            }
        }

        if (data.contains("environmentalModifiers")) {
            ability.environmentalModifiers =
                data["environmentalModifiers"]
                    .get<std::unordered_map<std::string, float>>();
        }

    } catch (const nlohmann::json::exception &e) {
        throw SerializationException("Failed to deserialize Ability: " +
                                     std::string(e.what()));
    }

    return ability;
}

// TraitDefinition Implementation
nlohmann::json
TraitDefinition::serializeToJson(const SerializationOptions &options) const {
    nlohmann::json data;

    if (!manifestations.empty()) {
        data["manifestations"] = manifestations;
    }

    // Serialize abilities
    data["abilities"] = nlohmann::json::array();
    for (const auto &ability : abilities) {
        data["abilities"].push_back(ability.serializeToJson(options));
    }

    if (!environmentalAffinities.empty()) {
        data["environmentalAffinities"] = environmentalAffinities;
    }

    if (!incompatibleWith.empty()) {
        data["incompatibleWith"] = incompatibleWith;
    }

    if (!mutations.empty()) {
        data["mutations"] = mutations;
    }

    if (!themeResonance.empty()) {
        data["themeResonance"] = themeResonance;
    }

    return data;
}

TraitDefinition
TraitDefinition::deserializeFromJson(const nlohmann::json &data) {
    TraitDefinition trait;

    try {
        if (data.contains("manifestations")) {
            for (const auto &manifestation : data["manifestations"]) {
                trait.manifestations.insert(manifestation.get<std::string>());
            }
        }

        if (data.contains("abilities")) {
            for (const auto &abilityData : data["abilities"]) {
                trait.abilities.push_back(
                    Ability::deserializeFromJson(abilityData));
            }
        }

        if (data.contains("environmentalAffinities")) {
            trait.environmentalAffinities =
                data["environmentalAffinities"]
                    .get<std::unordered_map<std::string, float>>();
        }

        if (data.contains("incompatibleWith")) {
            for (const auto &incompatible : data["incompatibleWith"]) {
                trait.incompatibleWith.insert(incompatible.get<std::string>());
            }
        }

        if (data.contains("mutations")) {
            for (const auto &mutation : data["mutations"]) {
                trait.mutations.insert(mutation.get<std::string>());
            }
        }

        if (data.contains("themeResonance")) {
            trait.themeResonance =
                data["themeResonance"]
                    .get<std::unordered_map<std::string, float>>();
        }

    } catch (const nlohmann::json::exception &e) {
        throw SerializationException("Failed to deserialize TraitDefinition: " +
                                     std::string(e.what()));
    }

    return trait;
}

// Behavior Implementation
nlohmann::json
Behavior::serializeToJson(const SerializationOptions &options) const {
    nlohmann::json data;

    data["intelligence"] = Serializer::enumToString(intelligence);
    data["aggression"] = Serializer::enumToString(aggression);
    data["socialStructure"] = Serializer::enumToString(socialStructure);

    if (!specialBehaviors.empty()) {
        data["specialBehaviors"] = specialBehaviors;
    }

    if (!environmentalBehaviors.empty()) {
        data["environmentalBehaviors"] = environmentalBehaviors;
    }

    if (!themeInfluences.empty()) {
        data["themeInfluences"] = themeInfluences;
    }

    return data;
}

Behavior Behavior::deserializeFromJson(const nlohmann::json &data) {
    Behavior behavior;

    try {
        if (auto intelligence =
                Serializer::stringToEnum<Intelligence>(data["intelligence"])) {
            behavior.intelligence = *intelligence;
        } else {
            throw SerializationException("Invalid intelligence value");
        }

        if (auto aggression =
                Serializer::stringToEnum<Aggression>(data["aggression"])) {
            behavior.aggression = *aggression;
        } else {
            throw SerializationException("Invalid aggression value");
        }

        if (auto social = Serializer::stringToEnum<SocialStructure>(
                data["socialStructure"])) {
            behavior.socialStructure = *social;
        } else {
            throw SerializationException("Invalid social structure value");
        }

        if (data.contains("specialBehaviors")) {
            for (const auto &behavior : data["specialBehaviors"]) {
                behavior.specialBehaviors.insert(behavior.get<std::string>());
            }
        }

        if (data.contains("environmentalBehaviors")) {
            behavior.environmentalBehaviors =
                data["environmentalBehaviors"]
                    .get<std::unordered_map<std::string, float>>();
        }

        if (data.contains("themeInfluences")) {
            behavior.themeInfluences =
                data["themeInfluences"]
                    .get<std::unordered_map<std::string, float>>();
        }

    } catch (const nlohmann::json::exception &e) {
        throw SerializationException("Failed to deserialize Behavior: " +
                                     std::string(e.what()));
    }

    return behavior;
}

// CreatureState Implementation
nlohmann::json
CreatureState::serializeToJson(const SerializationOptions &options) const {
    nlohmann::json data;

    // Core attributes
    data["name"] = name;
    data["suggestedName"] = suggestedName;
    data["uniqueIdentifier"] = uniqueIdentifier;
    data["powerLevel"] = powerLevel;
    data["isMutated"] = isMutated;

    // Complex structures
    data["form"] = form.serializeToJson(options);

    data["activeTraits"] = nlohmann::json::array();
    for (const auto &trait : activeTraits) {
        data["activeTraits"].push_back(trait.serializeToJson(options));
    }

    data["abilities"] = nlohmann::json::array();
    for (const auto &ability : abilities) {
        data["abilities"].push_back(ability.serializeToJson(options));
    }

    data["behavior"] = behavior.serializeToJson(options);

    return data;
}

CreatureState CreatureState::deserializeFromJson(const nlohmann::json &data) {
    CreatureState state;

    try {
        // Core attributes
        state.name = data["name"].get<std::string>();
        state.suggestedName = data["suggestedName"].get<std::string>();
        state.uniqueIdentifier = data["uniqueIdentifier"].get<std::string>();
        state.powerLevel = data["powerLevel"].get<int>();
        state.isMutated = data["isMutated"].get<bool>();

        // Complex structures
        state.form = PhysicalForm::deserializeFromJson(data["form"]);

        for (const auto &traitData : data["activeTraits"]) {
            state.activeTraits.push_back(
                TraitDefinition::deserializeFromJson(traitData));
        }

        for (const auto &abilityData : data["abilities"]) {
            state.abilities.push_back(
                Ability::deserializeFromJson(abilityData));
        }

        state.behavior = Behavior::deserializeFromJson(data["behavior"]);

    } catch (const nlohmann::json::exception &e) {
        throw SerializationException("Failed to deserialize CreatureState: " +
                                     std::string(e.what()));
    }

    return state;
}

// NameComponents Implementation
std::string
NameComponents::generateName(const PhysicalForm &form,
                             const std::vector<TraitDefinition> &traits,
                             const std::string &environment) {

    using namespace detail;

    std::string name;

    // Add size prefix with probability
    if (RandomGenerator::rollProbability(PREFIX_CHANCE)) {
        const auto &possiblePrefixes = sizePrefixes.at(form.size);
        name = RandomGenerator::selectRandom(possiblePrefixes) + " ";
    }

    // Add trait-based descriptor
    for (const auto &trait : traits) {
        if (traitDescriptors.count(trait.name)) {
            const auto &descriptors = traitDescriptors.at(trait.name);
            name += RandomGenerator::selectRandom(descriptors) + " ";
        }
    }

    // Add environment-based name component
    if (environmentalNames.count(environment)) {
        const auto &envNames = environmentalNames.at(environment);
        for (const auto &[category, names] : envNames) {
            if (RandomGenerator::rollProbability(0.5f)) {
                name += RandomGenerator::selectRandom(names) + " ";
            }
        }
    }

    // Remove trailing space and return
    if (!name.empty() && name.back() == ' ') {
        name.pop_back();
    }

    return name;
}

// ValidationResult Implementation
nlohmann::json
ValidationResult::serializeToJson(const SerializationOptions &options) const {
    nlohmann::json data;

    data["isValid"] = isValid;

    if (!warnings.empty()) {
        data["warnings"] = warnings;
    }

    if (!errors.empty()) {
        data["errors"] = errors;
    }

    if (!stabilityMetrics.empty()) {
        data["stabilityMetrics"] = stabilityMetrics;
    }

    return data;
}

// Serializer template specializations
template <> std::string Serializer::enumToString(Size value) {
    static const std::unordered_map<Size, std::string> mapping = {
        {Size::Tiny, "Tiny"},     {Size::Small, "Small"},
        {Size::Medium, "Medium"}, {Size::Large, "Large"},
        {Size::Huge, "Huge"},     {Size::Colossal, "Colossal"}};
    return mapping.at(value);
}

// Add similar specializations for other enums...

// Factory methods
PhysicalForm PhysicalForm::createBasic(Size size, BodyShape shape) {
    PhysicalForm form;
    form.size = size;
    form.shape = shape;
    form.primaryMovement = determineDefaultMovement(shape);
    return form;
}

Ability Ability::createInnate(const std::string &name,
                              const std::string &description) {
    Ability ability;
    ability.name = name;
    ability.description = description;
    ability.type = AbilityType::Innate;
    ability.powerLevel = 1;
    ability.isActive = true;
    return ability;
}

// Validation methods
bool PhysicalForm::isValid() const {
    // Check secondary movements don't duplicate primary
    if (std::find(secondaryMovements.begin(), secondaryMovements.end(),
                  primaryMovement) != secondaryMovements.end()) {
        return false;
    }

    // Check adaptability scores are in valid range
    for (const auto &[_, score] : adaptabilityScores) {
        if (score < 0.0f || score > 1.0f)
            return false;
    }

    return true;
}

// Add similar validation methods for other structures...

} // namespace crescent