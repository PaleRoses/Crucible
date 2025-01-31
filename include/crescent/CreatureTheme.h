#ifndef CREATURE_THEME_H
#define CREATURE_THEME_H

#include "CreatureEnums.h"
#include "CreatureStructures.h"
#include <memory>
#include <nlohmann/json.hpp>
#include <optional>
#include <string>
#include <unordered_map>
#include <unordered_set>

namespace crescent {

/**
 * @brief Defines interaction between two themes
 */
struct ThemeInteraction {
    std::string primaryTheme;
    std::string secondaryTheme;
    float interactionStrength;
    std::unordered_set<std::string> emergentEffects;
    std::unordered_map<std::string, float> traitModifiers;

    nlohmann::json
    serializeToJson(const SerializationOptions &options = {}) const;
    static ThemeInteraction deserializeFromJson(const nlohmann::json &data);
};

/**
 * @brief Complete definition of a theme's capabilities and interactions
 */
struct ThemeDefinition {
    std::unordered_set<std::string> manifestations;
    std::unordered_set<std::string> abilities;
    std::unordered_map<std::string, float> traitAffinities;
    std::unordered_map<std::string, float> environmentAffinities;
    std::unordered_set<std::string> compatibleThemes;
    std::unordered_set<std::string> incompatibleThemes;
    std::unordered_map<std::string, std::vector<std::string>> traitInteractions;
    std::unordered_map<std::string, ThemeInteraction> themeInteractions;

    /**
     * @brief Checks if this theme is compatible with another
     * @param other Theme to check compatibility with
     * @return True if themes are compatible
     */
    bool isCompatibleWith(const ThemeDefinition &other) const;

    nlohmann::json
    serializeToJson(const SerializationOptions &options = {}) const;
    static ThemeDefinition deserializeFromJson(const nlohmann::json &data);
};

/**
 * @brief Active effects from current theme configuration
 */
struct ThemeEffect {
    std::unordered_set<std::string> manifestations;
    std::unordered_set<std::string> abilities;
    std::unordered_map<std::string, float> modifiers;
    std::vector<ThemeInteraction> activeInteractions;

    nlohmann::json
    serializeToJson(const SerializationOptions &options = {}) const;
};

/**
 * @brief Manages a creature's active themes and their interactions
 */
class ThemeStack {
  public:
    /**
     * @brief Attempts to add a new theme
     * @param theme Theme to add
     * @param initialStrength Starting strength of theme
     * @return True if theme was successfully added
     */
    bool addTheme(const std::string &theme, float initialStrength = 1.0f);

    /**
     * @brief Removes a theme from the stack
     * @param theme Theme to remove
     * @return True if theme was successfully removed
     */
    bool removeTheme(const std::string &theme);

    /**
     * @brief Calculates combined effect of all active themes
     * @param trait Trait to calculate effects for
     * @param environment Environment to consider
     * @return Combined theme effects
     */
    ThemeEffect calculateCombinedEffect(const std::string &trait,
                                        const std::string &environment) const;

    /**
     * @brief Gets list of currently active themes
     * @return Set of active theme names
     */
    const std::unordered_set<std::string> &getActiveThemes() const;

    /**
     * @brief Gets current strength of a theme
     * @param theme Theme to check
     * @return Optional containing theme strength if active
     */
    std::optional<float> getThemeStrength(const std::string &theme) const;

    /**
     * @brief Gets current active theme interactions
     * @return Vector of active interactions
     */
    const std::vector<ThemeInteraction> &getActiveInteractions() const;

    /**
     * @brief Checks for conflicts between active themes
     * @return True if conflicts exist
     */
    bool hasConflicts() const;

    /**
     * @brief Gets descriptions of current theme conflicts
     * @return Vector of conflict descriptions
     */
    std::vector<std::string> getConflicts() const;

    nlohmann::json
    serializeToJson(const SerializationOptions &options = {}) const;
    static ThemeStack deserializeFromJson(const nlohmann::json &data);

  private:
    std::unordered_set<std::string> activeThemes;
    std::unordered_map<std::string, float> themeStrengths;
    std::vector<ThemeInteraction> currentInteractions;

    /**
     * @brief Updates interaction state after theme changes
     */
    void updateInteractions();

    /**
     * @brief Validates theme compatibility
     * @param theme Theme to validate
     * @return True if theme is compatible with current stack
     */
    bool validateThemeCompatibility(const std::string &theme) const;

    /**
     * @brief Calculates resonance between two themes
     * @param theme1 First theme
     * @param theme2 Second theme
     * @return Resonance value between 0 and 1
     */
    float calculateThemeResonance(const std::string &theme1,
                                  const std::string &theme2) const;
};

/**
 * @brief Theme system static configuration
 */
namespace ThemeConstants {
constexpr float MIN_THEME_STRENGTH = 0.0f;
constexpr float MAX_THEME_STRENGTH = 3.0f;
constexpr float RESONANCE_THRESHOLD = 0.3f;
constexpr float CONFLICT_THRESHOLD = 0.7f;
constexpr size_t MAX_ACTIVE_THEMES = 3;
} // namespace ThemeConstants

} // namespace crescent

#endif // CREATURE_THEME_H