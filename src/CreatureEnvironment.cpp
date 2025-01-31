#include "crescent/CreatureEnvironment.h"
#include "crescent/CreatureExceptions.h"
#include "crescent/private/ImplementationSpecific.h"
#include "crescent/private/InternalDetails.h"
#include <algorithm>
#include <cmath>

namespace crescent {

// EnvironmentalStressor Implementation
nlohmann::json EnvironmentalStressor::serializeToJson(
    const SerializationOptions &options) const {
    nlohmann::json data;
    data["source"] = source;
    data["intensity"] = intensity;
    data["effects"] = effects;
    data["isLethal"] = isLethal;
    return data;
}

// EnvironmentalData Implementation
std::optional<EnvironmentalData>
EnvironmentalInteraction::processTimeInEnvironment(
    const std::string &environment, int time) {

    // Validate input
    if (time < EnvironmentConstants::MIN_EXPOSURE_TIME) {
        return std::nullopt;
    }

    // Get or create environmental data
    auto &envData = activeEnvironments[environment];
    envData.environment = environment;
    envData.exposureTime += time;

    // Calculate base adaptation potential
    float adaptationPotential = calculateBaseAdaptationPotential(environment);

    // Process adaptation cycles
    while (envData.exposureTime >= EnvironmentConstants::MIN_EXPOSURE_TIME &&
           envData.adaptationLevel < adaptationPotential) {
        processAdaptationCycle(envData);
        envData.exposureTime -= EnvironmentConstants::MIN_EXPOSURE_TIME;
    }

    // Update stressors
    updateStressors();

    return envData;
}

float EnvironmentalInteraction::calculateBaseAdaptationPotential(
    const std::string &environment) const {

    float potential = 0.0f;

    // Check existing adaptations
    if (adaptationLevels.contains(environment)) {
        potential += adaptationLevels.at(environment);
    }

    // Factor in active stressors
    for (const auto &stressor : currentStressors) {
        if (stressor.source == environment) {
            potential -= stressor.intensity * 0.5f;
        }
    }

    return std::clamp(potential, 0.0f, 1.0f);
}

void EnvironmentalInteraction::processAdaptationCycle(
    EnvironmentalData &envData) {
    const float ADAPTATION_RATE = 0.1f;

    // Increase adaptation level
    envData.adaptationLevel =
        std::min(envData.adaptationLevel + ADAPTATION_RATE,
                 EnvironmentConstants::MAX_ADAPTATION_LEVEL);

    // Check for ability development
    if (envData.adaptationLevel >= EnvironmentConstants::ABILITY_THRESHOLD) {
        processAbilityDevelopment(envData);
    }

    // Update resource usage
    updateResourceUsage(envData);

    // Check synthesis potential
    calculateSynthesisPotential();
}

void EnvironmentalInteraction::processAbilityDevelopment(
    EnvironmentalData &envData) {
    using namespace detail;

    // Get potential abilities for environment
    auto potentialAbilities =
        impl::AbilityProcessor::getEnvironmentalAbilities(envData.environment);

    // Filter out already developed abilities
    potentialAbilities.erase(
        std::remove_if(potentialAbilities.begin(), potentialAbilities.end(),
                       [&](const std::string &ability) {
                           return envData.developedAbilities.contains(ability);
                       }),
        potentialAbilities.end());

    // Chance to develop new ability
    if (!potentialAbilities.empty() &&
        RandomGenerator::rollProbability(envData.adaptationLevel)) {

        auto newAbility = RandomGenerator::selectRandom(potentialAbilities);
        envData.developedAbilities.insert(newAbility);
    }
}

void EnvironmentalInteraction::updateStressors() {
    for (auto &[env, data] : activeEnvironments) {
        data.activeStressors.clear();

        // Generate base environmental stressors
        auto baseStressors = generateEnvironmentalStressors(env);

        // Apply adaptation effects
        for (auto &stressor : baseStressors) {
            stressor.intensity *= (1.0f - data.adaptationLevel);

            // Only keep significant stressors
            if (stressor.intensity > EnvironmentConstants::STRESS_THRESHOLD) {
                data.activeStressors.push_back(stressor);
            }
        }

        // Check for lethal conditions
        checkLethalConditions(data);
    }
}

void EnvironmentalInteraction::checkLethalConditions(
    const EnvironmentalData &envData) {
    for (const auto &stressor : envData.activeStressors) {
        if (stressor.intensity >=
            EnvironmentConstants::LETHAL_STRESS_THRESHOLD) {
            throw EnvironmentalStressException::lethalCondition(
                envData.environment, stressor.intensity);
        }
    }
}

std::vector<EnvironmentalStressor>
EnvironmentalInteraction::generateEnvironmentalStressors(
    const std::string &environment) {

    std::vector<EnvironmentalStressor> stressors;

    // Get environment-specific stressors
    auto envStressors =
        impl::StressorProcessor::getEnvironmentStressors(environment);

    // Process each stressor
    for (auto &stressor : envStressors) {
        // Calculate base intensity
        float baseIntensity = stressor.intensity;

        // Apply modifiers based on current conditions
        baseIntensity = applyStressorModifiers(stressor, environment);

        // Update stressor intensity
        stressor.intensity = baseIntensity;

        stressors.push_back(stressor);
    }

    return stressors;
}

float EnvironmentalInteraction::applyStressorModifiers(
    const EnvironmentalStressor &stressor, const std::string &environment) {

    float modifiedIntensity = stressor.intensity;

    // Apply adaptation level modifier
    if (adaptationLevels.contains(environment)) {
        modifiedIntensity *= (1.0f - adaptationLevels.at(environment));
    }

    // Apply environmental condition modifiers
    modifiedIntensity *= impl::StressorProcessor::getEnvironmentalModifier(
        environment, stressor.source);

    return std::clamp(modifiedIntensity, 0.0f, 1.0f);
}

void EnvironmentalInteraction::updateResourceUsage(EnvironmentalData &envData) {
    for (auto &[resource, usage] : envData.resourceUsage) {
        // Calculate base consumption
        float consumption = getBaseResourceConsumption(resource);

        // Apply environmental modifiers
        consumption *=
            getEnvironmentalResourceModifier(envData.environment, resource);

        // Update usage
        usage += consumption;
    }
}

void EnvironmentalInteraction::calculateSynthesisPotential() {
    for (auto &[env, data] : activeEnvironments) {
        // Check base synthesis requirements
        bool canSynthesize =
            data.adaptationLevel >= EnvironmentConstants::SYNTHESIS_THRESHOLD;

        // Check additional requirements
        if (canSynthesize) {
            canSynthesize = impl::SynthesisProcessor::checkRequirements(
                env, data.developedAbilities);
        }

        data.canSynthesizeWith = canSynthesize;
    }
}

} // namespace crescent