#include "crescent/CreatureEvolution.h"
#include "crescent/CreatureExceptions.h"
#include "crescent/private/ImplementationSpecific.h"
#include "crescent/private/InternalDetails.h"
#include <algorithm>
#include <cmath>

namespace crescent {

// EvolutionaryPressure Implementation
nlohmann::json EvolutionaryPressure::serializeToJson(
    const SerializationOptions &options) const {
    nlohmann::json data;
    data["source"] = source;
    data["intensity"] = intensity;
    data["possibleOutcomes"] = possibleOutcomes;
    data["outcomeProbabilities"] = outcomeProbabilities;
    return data;
}

// Evolution System Implementation
bool EvolutionSystem::canEvolve(const CreatureState &state) {
    // Check evolution stage limit
    if (state.evolution.currentStage >=
        EvolutionConstants::MAX_EVOLUTION_STAGE) {
        return false;
    }

    // Calculate total evolutionary pressure
    float totalPressure = EvolutionCalculator::calculateTotalPressure(state);
    return totalPressure >= 1.0f;
}

std::optional<EvolutionData> EvolutionSystem::evolve(CreatureState &state) {
    if (!canEvolve(state)) {
        throw EvolutionException::invalidEvolution(
            state.evolution.currentStage, "Evolution requirements not met");
    }

    // Calculate available paths and their weights
    auto pathWeights = calculatePathWeights(state);
    if (pathWeights.empty()) {
        throw EvolutionException::invalidEvolution(
            state.evolution.currentStage, "No valid evolution paths available");
    }

    // Select evolution path
    std::string selectedPath =
        detail::RandomGenerator::selectWeighted(pathWeights);

    // Apply evolution effects
    applyEvolutionEffects(state, selectedPath);

    return state.evolution;
}

void EvolutionSystem::applyEvolutionEffects(CreatureState &state,
                                            const std::string &evolutionPath) {

    // Update stage
    state.evolution.currentStage++;
    state.evolution.evolutionHistory.push_back(evolutionPath);

    // Update physical form
    updatePhysicalFormForEvolution(state.form, evolutionPath);

    // Grant new abilities
    auto newAbilities = generateEvolutionaryAbilities(evolutionPath, state);
    for (const auto &ability : newAbilities) {
        state.abilities.push_back(ability);
    }

    // Unlock new paths
    unlockEvolutionaryPaths(state, evolutionPath);
}

std::unordered_map<std::string, float>
EvolutionSystem::getAvailableEvolutionPaths(const CreatureState &state) {

    std::unordered_map<std::string, float> availablePaths;

    // Check trait-based paths
    for (const auto &trait : state.activeTraits) {
        for (const auto &ability : trait.abilities) {
            if (ability.type == AbilityType::Evolved &&
                !hasAbility(state, ability.name)) {

                std::string path = trait.name + "_" + ability.name;
                float weight = calculateTraitPathWeight(state, trait);
                availablePaths[path] = weight;
            }
        }
    }

    // Check theme-based paths
    for (const auto &theme : state.themes.getActiveThemes()) {
        const auto &themeDef = getThemeDefinition(theme);
        float themeStrength =
            state.themes.getThemeStrength(theme).value_or(0.0f);

        for (const auto &ability : themeDef.abilities) {
            std::string path = theme + "_" + ability;
            float weight = calculateThemePathWeight(state, theme);
            availablePaths[path] = weight;
        }
    }

    // Check environmental paths
    for (const auto &[env, data] : state.environment.getActiveEnvironments()) {
        if (data.adaptationLevel >
            EvolutionConstants::ENVIRONMENTAL_EVOLUTION_THRESHOLD) {
            std::string path = env + "_adaptation";
            float weight = calculateEnvironmentalPathWeight(state, env);
            availablePaths[path] = weight;
        }
    }

    return availablePaths;
}

// Mutation System Implementation
bool AdaptiveMutationSystem::processEnvironmentalMutation(
    CreatureState &state, const std::string &environment) {

    // Check if mutation is possible
    if (state.isMutated) {
        return false;
    }

    // Get environment data
    auto envData = state.environment.getActiveEnvironments().at(environment);
    if (envData.adaptationLevel < EnvironmentConstants::MUTATION_THRESHOLD) {
        return false;
    }

    // Generate mutation options
    auto mutations = generateEnvironmentalMutations(environment, envData);
    if (mutations.empty()) {
        return false;
    }

    // Select and apply mutation
    auto selectedMutation = detail::RandomGenerator::selectRandom(mutations);
    applyMutation(state, selectedMutation);

    state.isMutated = true;
    return true;
}

bool AdaptiveMutationSystem::processTraitMutation(CreatureState &state,
                                                  const std::string &trait,
                                                  const std::string &mutation) {

    // Validate mutation
    if (!isValidTraitMutation(trait, mutation)) {
        return false;
    }

    // Apply mutation
    applyMutation(state, mutation);
    state.isMutated = true;
    return true;
}

void AdaptiveMutationSystem::applyMutation(CreatureState &state,
                                           const std::string &mutation) {

    // Parse mutation type
    auto [type, effect] = parseMutation(mutation);

    // Apply appropriate changes
    switch (type) {
    case MutationType::Physical:
        applyPhysicalMutation(state.form, effect);
        break;
    case MutationType::Ability:
        applyAbilityMutation(state, effect);
        break;
    case MutationType::Trait:
        applyTraitMutation(state, effect);
        break;
    case MutationType::Environmental:
        applyEnvironmentalMutation(state, effect);
        break;
    }

    // Update appearance
    updateMutatedAppearance(state);
}

// Evolution Calculator Implementation
float EvolutionCalculator::calculateTotalPressure(const CreatureState &state) {
    float pressure = 0.0f;

    // Environmental pressure
    for (const auto &[env, data] : state.environment.getActiveEnvironments()) {
        pressure += data.adaptationLevel *
                    EvolutionConstants::ENVIRONMENTAL_PRESSURE_WEIGHT;
    }

    // Theme pressure
    for (const auto &theme : state.themes.getActiveThemes()) {
        pressure += state.themes.getThemeStrength(theme).value_or(0.0f) *
                    EvolutionConstants::THEME_PRESSURE_WEIGHT;
    }

    // Mutation pressure
    if (state.isMutated) {
        pressure += EvolutionConstants::MUTATION_PRESSURE_WEIGHT;
    }

    return pressure;
}

namespace crescent {

float EvolutionCalculator::calculateTraitPathWeight(
    const CreatureState &state, const TraitDefinition &trait) {

    float weight = 1.0f;

    // Factor in trait dominance
    weight *= getTraitDominance(state, trait.name);

    // Factor in current environmental compatibility
    for (const auto &[env, affinity] : trait.environmentalAffinities) {
        if (state.environment.getActiveEnvironments().contains(env)) {
            weight *= (1.0f + affinity);
        }
    }

    return weight;
}

void EvolutionSystem::unlockEvolutionaryPaths(
    CreatureState &state, const std::string &completedPath) {

    auto &evolution = state.evolution;

    // Parse path components
    auto [source, effect] = parsePath(completedPath);

    // Add new potential paths based on completed evolution
    auto newPaths = getNewPathsFromEvolution(source, effect);
    evolution.unlockedPaths.insert(newPaths.begin(), newPaths.end());

    // Update trait strengths if applicable
    if (isTraitPath(completedPath)) {
        evolution.traitStrengths[source]++;
    }
}

std::pair<MutationType, std::string>
AdaptiveMutationSystem::parseMutation(const std::string &mutation) {

    // Parse mutation string format: "type:effect"
    size_t separator = mutation.find(':');
    if (separator == std::string::npos) {
        throw MutationException::invalidMutation(mutation,
                                                 "Invalid mutation format");
    }

    std::string typeStr = mutation.substr(0, separator);
    std::string effect = mutation.substr(separator + 1);

    // Convert type string to enum
    MutationType type;
    if (typeStr == "physical")
        type = MutationType::Physical;
    else if (typeStr == "ability")
        type = MutationType::Ability;
    else if (typeStr == "trait")
        type = MutationType::Trait;
    else if (typeStr == "environmental")
        type = MutationType::Environmental;
    else
        throw MutationException::invalidMutation(mutation,
                                                 "Unknown mutation type");

    return {type, effect};
}

void AdaptiveMutationSystem::applyPhysicalMutation(PhysicalForm &form,
                                                   const std::string &effect) {

    // Parse effect components
    auto [attribute, modification] = parsePhysicalEffect(effect);

    // Apply appropriate changes
    if (attribute == "size") {
        modifySize(form, modification);
    } else if (attribute == "locomotion") {
        modifyLocomotion(form, modification);
    } else if (attribute == "features") {
        addFeature(form, modification);
    }
}

void AdaptiveMutationSystem::applyAbilityMutation(CreatureState &state,
                                                  const std::string &effect) {

    // Create new ability from effect
    Ability ability;
    ability.name = effect;
    ability.type = AbilityType::Evolved;
    ability.powerLevel = state.evolution.currentStage + 1;

    // Add to state
    state.abilities.push_back(ability);
}

void AdaptiveMutationSystem::applyTraitMutation(CreatureState &state,
                                                const std::string &effect) {

    // Get trait definition
    const auto &trait = getTraitDefinition(effect);

    // Apply trait
    state.activeTraits.push_back(trait);

    // Update related systems
    state.evolution.traitStrengths[effect] = 1;
}

void AdaptiveMutationSystem::applyEnvironmentalMutation(
    CreatureState &state, const std::string &effect) {

    // Parse environmental effect
    auto [environment, adaptation] = parseEnvironmentalEffect(effect);

    // Apply adaptation
    auto &envData = state.environment.getActiveEnvironments()[environment];
    envData.adaptationLevel += 0.2f;
    envData.developedAbilities.insert(adaptation);
}

} // namespace crescent