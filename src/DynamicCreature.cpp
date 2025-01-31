#include "crescent/DynamicCreature.h"
#include "crescent/private/ImplementationSpecific.h"
#include "crescent/private/InternalDetails.h"
#include <chrono>
#include <sstream>

namespace crescent {

DynamicCreature::DynamicCreature(const std::string &primaryTrait,
                                 const std::string &baseName) {
    // Validate primary trait
    if (baseTraits.find(primaryTrait) == baseTraits.end()) {
        throw CreatureGenerationException("Invalid primary trait: " +
                                          primaryTrait);
    }

    // Initialize random generator with time-based seed
    auto seed =
        std::chrono::high_resolution_clock::now().time_since_epoch().count();
    gen.seed(static_cast<unsigned int>(seed));

    // Initialize core state
    state.uniqueIdentifier = detail::generateUniqueId();
    state.name = baseName.empty() ? generateName() : baseName;
    state.powerLevel = 1;
    state.isMutated = false;

    // Generate base form
    state.form = generateBaseForm();

    // Initialize primary trait
    auto primaryTraitDef = baseTraits.at(primaryTrait);
    state.activeTraits.push_back(primaryTraitDef);

    // Initialize basic abilities from trait
    for (const auto &ability : primaryTraitDef.abilities) {
        if (ability.type == AbilityType::Innate) {
            state.abilities.push_back(ability);
        }
    }

    // Initialize behavior
    state.behavior = generateBaseBehavior();

    // Generate descriptive name
    state.suggestedName = generateDescriptiveName();

    // Validate initial state
    auto validation = validateState();
    if (!validation.isValid) {
        throw CreatureGenerationException("Invalid initial state: " +
                                          validation.errors[0]);
    }
}

DynamicCreature
DynamicCreature::generateRandomCreature(const std::string &preferredEnvironment,
                                        int evolutionLevel, bool fullyEvolved) {

    // Select random primary trait
    std::string primaryTrait = randomTrait();

    // Create base creature
    DynamicCreature creature(primaryTrait);

    // Apply environmental preference if specified
    if (!preferredEnvironment.empty()) {
        creature.adapt(preferredEnvironment);
    }

    // Apply evolution if requested
    if (evolutionLevel > 0 || fullyEvolved) {
        evolveCreature(creature, evolutionLevel, fullyEvolved);
    }

    return creature;
}

DynamicCreature
DynamicCreature::generateForEnvironment(const std::string &environment) {
    // Get traits compatible with environment
    auto compatibleTraits = getEnvironmentCompatibleTraits(environment);
    if (compatibleTraits.empty()) {
        throw CreatureGenerationException(
            "No compatible traits for environment: " + environment);
    }

    // Select random compatible trait
    auto trait = detail::RandomGenerator::selectRandom(compatibleTraits);

    // Create and adapt creature
    DynamicCreature creature(trait);
    creature.adapt(environment);

    return creature;
}

void DynamicCreature::processTimeInEnvironment(const std::string &environment,
                                               int time) {
    json eventData;
    eventData["environment"] = environment;
    eventData["time"] = time;

    try {
        // Process environmental exposure
        auto result =
            state.environment.processTimeInEnvironment(environment, time);
        if (!result) {
            throw EnvironmentalStressException(
                "Failed to process environmental time");
        }

        // Update event data
        eventData["adaptationLevel"] = result->adaptationLevel;
        eventData["developedAbilities"] = result->developedAbilities;

        // Emit event
        emitEvent(CreatureEvent::EnvironmentalAdaptation, eventData);

    } catch (const EnvironmentalStressException &e) {
        eventData["error"] = e.what();
        emitEvent(CreatureEvent::ValidationFailure, eventData);
        throw;
    }
}

void DynamicCreature::evolve() {
    if (!canEvolve()) {
        throw EvolutionException("Evolution requirements not met");
    }

    json eventData;
    eventData["previousStage"] = state.evolution.currentStage;

    try {
        // Process evolution
        auto result = EvolutionSystem::evolve(state);
        if (!result) {
            throw EvolutionException("Evolution failed");
        }

        // Update event data
        eventData["newStage"] = result->currentStage;
        eventData["unlockedPaths"] = result->unlockedPaths;

        // Emit event
        emitEvent(CreatureEvent::Evolution, eventData);

    } catch (const EvolutionException &e) {
        eventData["error"] = e.what();
        emitEvent(CreatureEvent::ValidationFailure, eventData);
        throw;
    }
}

void DynamicCreature::mutate(const std::string &catalyst) {
    if (state.isMutated) {
        throw MutationException("Already mutated in this stage");
    }

    json eventData;
    eventData["catalyst"] = catalyst;

    try {
        // Calculate mutation probabilities
        auto mutationProbabilities = calculateMutationProbabilities(catalyst);

        // Select and apply mutation
        auto selectedMutation = selectMutation(mutationProbabilities);
        applyMutation(selectedMutation);

        // Update event data
        eventData["selectedMutation"] = selectedMutation;
        eventData["success"] = true;

        // Emit event
        emitEvent(CreatureEvent::Mutation, eventData);

    } catch (const MutationException &e) {
        eventData["error"] = e.what();
        emitEvent(CreatureEvent::ValidationFailure, eventData);
        throw;
    }
}

bool DynamicCreature::addTheme(const std::string &theme,
                               float initialStrength) {
    json eventData;
    eventData["theme"] = theme;
    eventData["initialStrength"] = initialStrength;

    try {
        if (!state.themes.addTheme(theme, initialStrength)) {
            throw ThemeCompatibilityException("Failed to add theme: " + theme);
        }

        eventData["success"] = true;
        emitEvent(CreatureEvent::ThemeAcquisition, eventData);
        return true;

    } catch (const ThemeCompatibilityException &e) {
        eventData["error"] = e.what();
        emitEvent(CreatureEvent::ValidationFailure, eventData);
        return false;
    }
}

ValidationResult DynamicCreature::validateState() const {
    ValidationResult result;
    result.isValid = true;

    // Validate physical form
    if (!validatePhysicalForm(state.form)) {
        result.isValid = false;
        result.errors.push_back("Invalid physical form");
    }

    // Validate theme stack
    auto themeResult = state.themes.validateState();
    if (!themeResult.isValid) {
        result.isValid = false;
        result.errors.insert(result.errors.end(), themeResult.errors.begin(),
                             themeResult.errors.end());
    }

    // Validate abilities
    if (!validateAbilities()) {
        result.isValid = false;
        result.errors.push_back("Invalid ability configuration");
    }

    // Validate trait compatibility
    if (!validateTraitCompatibility()) {
        result.isValid = false;
        result.errors.push_back("Incompatible trait combination");
    }

    return result;
}

void DynamicCreature::addEventListener(CreatureEvent event,
                                       EventCallback callback) {
    eventListeners[event].push_back(callback);
}

void DynamicCreature::removeEventListener(CreatureEvent event) {
    eventListeners.erase(event);
}

void DynamicCreature::emitEvent(CreatureEvent event, const json &data) {
    if (eventListeners.contains(event)) {
        for (const auto &callback : eventListeners[event]) {
            callback(event, data);
        }
    }
}

// Generation helpers
std::string DynamicCreature::randomTrait() {
    std::vector<std::string> validTraits(baseTraits.begin(), baseTraits.end());
    return detail::RandomGenerator::selectRandom(validTraits);
}

std::string DynamicCreature::randomEnvironment() {
    return detail::RandomGenerator::selectRandom(getValidEnvironments());
}

PhysicalForm DynamicCreature::generateBaseForm() {
    PhysicalForm form;

    // Generate random base attributes
    form.size = detail::RandomGenerator::selectRandom<Size>();
    form.shape = detail::RandomGenerator::selectRandom<BodyShape>();
    form.primaryMovement = determineDefaultMovement(form.shape);

    // Maybe add secondary movement
    if (detail::RandomGenerator::rollProbability(0.3f)) {
        form.secondaryMovements.push_back(
            generateCompatibleSecondaryMovement(form.shape));
    }

    return form;
}

Behavior DynamicCreature::generateBaseBehavior() {
    Behavior behavior;

    // Set baseline behavior based on form and traits
    behavior.intelligence = determineBaseIntelligence();
    behavior.aggression = determineBaseAggression();
    behavior.socialStructure = determineBaseSocialStructure();

    return behavior;
}

std::vector<std::string>
DynamicCreature::generateRandomHistory(int complexity) {
    std::vector<std::string> history;
    for (int i = 0; i < complexity; ++i) {
        history.push_back(generateHistoryEvent());
    }
    return history;
}

// Name generation
std::string DynamicCreature::generateName() const {
    return NameComponents::generateName(
        state.form, state.activeTraits,
        state.environment.getPrimaryEnvironment());
}

std::string DynamicCreature::generateDescriptiveName() const {
    std::stringstream name;

    // Add size descriptor
    name << Serializer::enumToString(state.form.size) << " ";

    // Add trait-based descriptors
    for (const auto &trait : state.activeTraits) {
        if (!trait.manifestations.empty()) {
            name << *trait.manifestations.begin() << " ";
        }
    }

    // Add form descriptor
    name << Serializer::enumToString(state.form.shape);

    return name.str();
}

// Validation helpers
bool DynamicCreature::validatePhysicalForm(const PhysicalForm &form) const {
    // Check movement compatibility
    if (!isMovementCompatibleWithShape(form.primaryMovement, form.shape)) {
        return false;
    }

    // Check secondary movements
    for (const auto &movement : form.secondaryMovements) {
        if (!isMovementCompatibleWithShape(movement, form.shape)) {
            return false;
        }
    }

    return true;
}

bool DynamicCreature::validateAbilities() const {
    std::unordered_set<std::string> abilityNames;

    // Check for duplicate abilities
    for (const auto &ability : state.abilities) {
        if (abilityNames.contains(ability.name)) {
            return false;
        }
        abilityNames.insert(ability.name);
    }

    // Validate ability requirements
    for (const auto &ability : state.abilities) {
        if (!meetAbilityRequirements(ability)) {
            return false;
        }
    }

    return true;
}

bool DynamicCreature::validateTraitCompatibility() const {
    // Check each trait pair for compatibility
    for (size_t i = 0; i < state.activeTraits.size(); ++i) {
        for (size_t j = i + 1; j < state.activeTraits.size(); ++j) {
            if (!checkTraitCompatibility(state.activeTraits[i].name,
                                         state.activeTraits[j].name)) {
                return false;
            }
        }
    }
    return true;
}

// Helper for movement compatibility
bool DynamicCreature::isMovementCompatibleWithShape(Locomotion movement,
                                                    BodyShape shape) const {

    switch (shape) {
    case BodyShape::Avian:
        return movement == Locomotion::Flyer || movement == Locomotion::Walker;
    case BodyShape::Serpentine:
        return movement == Locomotion::Slitherer ||
               movement == Locomotion::Swimmer;
    case BodyShape::Amorphous:
        return true; // Can use any movement type
    // Add cases for other shapes...
    default:
        return movement == Locomotion::Walker;
    }
}

// Ability requirement checking
bool DynamicCreature::meetAbilityRequirements(const Ability &ability) const {
    for (const auto &req : ability.requirements) {
        // Check trait requirements
        if (req.starts_with("trait:")) {
            std::string traitName = req.substr(6);
            if (!hasTrait(traitName))
                return false;
        }
        // Check theme requirements
        else if (req.starts_with("theme:")) {
            std::string themeName = req.substr(6);
            if (!state.themes.hasTheme(themeName))
                return false;
        }
        // Check environmental requirements
        else if (req.starts_with("env:")) {
            std::string envName = req.substr(4);
            if (!state.environment.isAdaptedTo(envName))
                return false;
        }
    }
    return true;
}

// Evolution and mutation helpers
void DynamicCreature::evolveCreature(DynamicCreature &creature, int targetLevel,
                                     bool fullyEvolved) {

    while (
        creature.canEvolve() &&
        (fullyEvolved || creature.state.evolution.currentStage < targetLevel)) {
        creature.evolve();
    }
}

std::unordered_map<std::string, float>
DynamicCreature::calculateMutationProbabilities(
    const std::string &catalyst) const {

    std::unordered_map<std::string, float> probabilities;

    // Base mutations from traits
    for (const auto &trait : state.activeTraits) {
        for (const auto &mutation : trait.mutations) {
            probabilities[mutation] = calculateTraitDominance(trait.name);
        }
    }

    // Apply theme influences
    for (const auto &theme : state.themes.getActiveThemes()) {
        float themeStrength =
            state.themes.getThemeStrength(theme).value_or(0.0f);
        applyThemeInfluence(probabilities, theme, themeStrength);
    }

    // Apply environmental influence
    for (const auto &[env, data] : state.environment.getActiveEnvironments()) {
        if (data.adaptationLevel > 0.5f) {
            std::string envMutation = "Adapted to " + env;
            probabilities[envMutation] = data.adaptationLevel;
        }
    }

    // Apply catalyst effects if present
    if (!catalyst.empty()) {
        applyCatalystEffects(probabilities, catalyst);
    }

    return probabilities;
}

// Trait Management
float DynamicCreature::getTraitDominance(const std::string &trait) const {
    float dominance = 1.0f;

    // Factor in evolution strength
    if (state.evolution.traitStrengths.contains(trait)) {
        dominance *= (1.0f + state.evolution.traitStrengths.at(trait) * 0.2f);
    }

    // Factor in theme resonance
    for (const auto &theme : state.themes.getActiveThemes()) {
        if (const auto &def = getThemeDefinition(theme)) {
            if (def.traitAffinities.contains(trait)) {
                dominance *=
                    (1.0f +
                     def.traitAffinities.at(trait) *
                         state.themes.getThemeStrength(theme).value_or(0.0f));
            }
        }
    }

    return dominance;
}

std::unordered_set<std::string>
DynamicCreature::getPossibleSecondaryTraits() const {
    std::unordered_set<std::string> possible;

    // Check each base trait for compatibility
    for (const auto &[traitName, traitDef] : baseTraits) {
        bool compatible = true;

        // Check compatibility with existing traits
        for (const auto &activeTrait : state.activeTraits) {
            if (!checkTraitCompatibility(traitName, activeTrait.name)) {
                compatible = false;
                break;
            }
        }

        if (compatible) {
            possible.insert(traitName);
        }
    }

    return possible;
}

// Serialization
nlohmann::json
DynamicCreature::serializeToJson(const SerializationOptions &options) const {
    nlohmann::json data;

    // Core state
    data["state"] = state.serializeToJson(options);

    // Evolution data
    if (options.includeHistory) {
        data["evolution"] = state.evolution.serializeToJson(options);
    }

    // Environment data
    data["environment"] = state.environment.serializeToJson(options);

    // Theme data
    data["themes"] = state.themes.serializeToJson(options);

    return data;
}

// Static Helper Methods
std::vector<std::string> DynamicCreature::getValidEnvironments() {
    return impl::EnvironmentRegistry::getValidEnvironments();
}

std::vector<std::string> DynamicCreature::getValidTraits() {
    return std::vector<std::string>(baseTraits.begin(), baseTraits.end());
}

std::vector<std::string> DynamicCreature::getValidThemes() {
    return impl::ThemeRegistry::getValidThemes();
}

std::vector<std::string> DynamicCreature::getPossibleAbilities() {
    return impl::AbilityRegistry::getPossibleAbilities();
}

nlohmann::json
DynamicCreature::getEnvironmentData(const std::string &environment) {
    return impl::EnvironmentRegistry::getEnvironmentData(environment);
}

// Private helper methods follow...