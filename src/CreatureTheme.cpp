#include "crescent/CreatureTheme.h"
#include "crescent/CreatureExceptions.h"
#include "crescent/private/InternalDetails.h"
#include <algorithm>
#include <cmath>

namespace crescent {

// ThemeInteraction Implementation
nlohmann::json
ThemeInteraction::serializeToJson(const SerializationOptions &options) const {
    nlohmann::json data;
    data["primaryTheme"] = primaryTheme;
    data["secondaryTheme"] = secondaryTheme;
    data["interactionStrength"] = interactionStrength;
    data["emergentEffects"] = emergentEffects;
    data["traitModifiers"] = traitModifiers;
    return data;
}

ThemeInteraction
ThemeInteraction::deserializeFromJson(const nlohmann::json &data) {
    ThemeInteraction interaction;
    try {
        interaction.primaryTheme = data["primaryTheme"].get<std::string>();
        interaction.secondaryTheme = data["secondaryTheme"].get<std::string>();
        interaction.interactionStrength =
            data["interactionStrength"].get<float>();
        interaction.emergentEffects =
            data["emergentEffects"].get<std::unordered_set<std::string>>();
        interaction.traitModifiers =
            data["traitModifiers"]
                .get<std::unordered_map<std::string, float>>();
    } catch (const nlohmann::json::exception &e) {
        throw SerializationException(
            "Failed to deserialize ThemeInteraction: " + std::string(e.what()));
    }
    return interaction;
}

// ThemeDefinition Implementation
bool ThemeDefinition::isCompatibleWith(const ThemeDefinition &other) const {
    // Check direct compatibility
    if (compatibleThemes.contains(other.name))
        return true;
    if (incompatibleThemes.contains(other.name))
        return false;

    // Check resonance
    float resonance = calculateResonance(other);
    return resonance >= ThemeConstants::RESONANCE_THRESHOLD;
}

float ThemeDefinition::calculateResonance(const ThemeDefinition &other) const {
    float resonance = 0.0f;

    // Compare trait affinities
    for (const auto &[trait, affinity] : traitAffinities) {
        if (other.traitAffinities.contains(trait)) {
            float difference =
                std::abs(affinity - other.traitAffinities.at(trait));
            resonance += 1.0f - (difference / 2.0f);
        }
    }

    // Compare environmental affinities
    for (const auto &[env, affinity] : environmentAffinities) {
        if (other.environmentAffinities.contains(env)) {
            float difference =
                std::abs(affinity - other.environmentAffinities.at(env));
            resonance += 1.0f - (difference / 2.0f);
        }
    }

    // Normalize resonance
    size_t totalComparisons =
        traitAffinities.size() + environmentAffinities.size();
    return totalComparisons > 0
               ? resonance / static_cast<float>(totalComparisons)
               : 0.0f;
}

nlohmann::json
ThemeDefinition::serializeToJson(const SerializationOptions &options) const {
    nlohmann::json data;
    data["manifestations"] = manifestations;
    data["abilities"] = abilities;
    data["traitAffinities"] = traitAffinities;
    data["environmentAffinities"] = environmentAffinities;
    data["compatibleThemes"] = compatibleThemes;
    data["incompatibleThemes"] = incompatibleThemes;
    data["traitInteractions"] = traitInteractions;

    // Serialize theme interactions
    data["themeInteractions"] = nlohmann::json::object();
    for (const auto &[theme, interaction] : themeInteractions) {
        data["themeInteractions"][theme] = interaction.serializeToJson(options);
    }

    return data;
}

// ThemeStack Implementation
bool ThemeStack::addTheme(const std::string &theme, float initialStrength) {
    // Validate input
    if (initialStrength < ThemeConstants::MIN_THEME_STRENGTH ||
        initialStrength > ThemeConstants::MAX_THEME_STRENGTH) {
        return false;
    }

    // Check maximum themes
    if (activeThemes.size() >= ThemeConstants::MAX_ACTIVE_THEMES) {
        return false;
    }

    // Validate compatibility
    if (!validateThemeCompatibility(theme)) {
        return false;
    }

    // Add theme
    activeThemes.insert(theme);
    themeStrengths[theme] = initialStrength;
    updateInteractions();
    return true;
}

bool ThemeStack::removeTheme(const std::string &theme) {
    if (!activeThemes.contains(theme))
        return false;

    activeThemes.erase(theme);
    themeStrengths.erase(theme);
    updateInteractions();
    return true;
}

ThemeEffect
ThemeStack::calculateCombinedEffect(const std::string &trait,
                                    const std::string &environment) const {

    ThemeEffect effect;

    // Gather manifestations and abilities from active themes
    for (const auto &theme : activeThemes) {
        const auto &themeDef = getThemeDefinition(theme);
        float strength = themeStrengths.at(theme);

        // Add manifestations scaled by theme strength
        for (const auto &manifestation : themeDef.manifestations) {
            if (strength >= ThemeConstants::MANIFESTATION_THRESHOLD) {
                effect.manifestations.insert(manifestation);
            }
        }

        // Add abilities scaled by theme strength
        for (const auto &ability : themeDef.abilities) {
            if (strength >= ThemeConstants::ABILITY_THRESHOLD) {
                effect.abilities.insert(ability);
            }
        }

        // Apply modifiers
        if (themeDef.traitAffinities.contains(trait)) {
            effect.modifiers[trait] =
                themeDef.traitAffinities.at(trait) * strength;
        }
        if (themeDef.environmentAffinities.contains(environment)) {
            effect.modifiers[environment] =
                themeDef.environmentAffinities.at(environment) * strength;
        }
    }

    // Process interactions
    for (const auto &interaction : currentInteractions) {
        // Add emergent effects if interaction is strong enough
        if (interaction.interactionStrength >=
            ThemeConstants::INTERACTION_THRESHOLD) {
            effect.manifestations.insert(interaction.emergentEffects.begin(),
                                         interaction.emergentEffects.end());
        }

        // Apply interaction modifiers
        for (const auto &[trait, modifier] : interaction.traitModifiers) {
            effect.modifiers[trait] +=
                modifier * interaction.interactionStrength;
        }
    }

    effect.activeInteractions = currentInteractions;
    return effect;
}

void ThemeStack::updateInteractions() {
    currentInteractions.clear();

    // Generate all possible theme pairs
    for (auto it1 = activeThemes.begin(); it1 != activeThemes.end(); ++it1) {
        for (auto it2 = std::next(it1); it2 != activeThemes.end(); ++it2) {
            const auto &theme1 = getThemeDefinition(*it1);
            const auto &theme2 = getThemeDefinition(*it2);

            // Check if themes have defined interaction
            if (theme1.themeInteractions.contains(*it2)) {
                auto interaction = theme1.themeInteractions.at(*it2);
                interaction.interactionStrength *=
                    std::min(themeStrengths.at(*it1), themeStrengths.at(*it2));
                currentInteractions.push_back(std::move(interaction));
            }
        }
    }
}

bool ThemeStack::validateThemeCompatibility(const std::string &theme) const {
    const auto &newTheme = getThemeDefinition(theme);

    // Check compatibility with all active themes
    for (const auto &activeTheme : activeThemes) {
        const auto &existingTheme = getThemeDefinition(activeTheme);
        if (!newTheme.isCompatibleWith(existingTheme)) {
            return false;
        }
    }

    return true;
}

bool ThemeStack::hasConflicts() const {
    for (const auto &interaction : currentInteractions) {
        if (interaction.interactionStrength < 0) {
            return true;
        }
    }
    return false;
}

std::vector<std::string> ThemeStack::getConflicts() const {
    std::vector<std::string> conflicts;
    for (const auto &interaction : currentInteractions) {
        if (interaction.interactionStrength < 0) {
            conflicts.push_back("Conflict between " + interaction.primaryTheme +
                                " and " + interaction.secondaryTheme);
        }
    }
    return conflicts;
}

} // namespace crescent