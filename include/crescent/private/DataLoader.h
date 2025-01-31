#ifndef CRESCENT_PRIVATE_DATALOADER_H
#define CRESCENT_PRIVATE_DATALOADER_H

#include "crescent/CreatureEnvironment.h"
#include "crescent/CreatureStructures.h"
#include "crescent/CreatureTheme.h"
#include <nlohmann/json.hpp>
#include <string>
#include <unordered_map>
#include <vector>

namespace crescent {

// Forward declarations
struct ThemeDefinition;
struct EnvironmentData;
struct TraitDefinition;
struct Ability;

namespace detail {

class DataLoader {
  public:
    static DataLoader &instance();
    void initialize(const std::string &dataPath);

    // Data access
    const ThemeDefinition &getThemeDefinition(const std::string &name) const;
    const EnvironmentData &getEnvironmentData(const std::string &name) const;
    const TraitDefinition &getTraitDefinition(const std::string &name) const;

    // Validation
    bool validateData() const;

    // Accessors
    std::vector<std::string> getValidThemes() const;
    std::vector<std::string> getValidEnvironments() const;
    std::vector<std::string> getValidTraits() const;
    std::vector<std::string> getBaseAbilities() const;

  private:
    DataLoader() = default;

    void loadThemes(const std::string &filepath);
    void loadEnvironments(const std::string &filepath);
    void loadTraits(const std::string &filepath);
    void loadAbilities(const std::string &filepath);

    void validateTraitCompatibility();
    void validateInitialization() const;

    bool isInitialized = false;
    std::unordered_map<std::string, ThemeDefinition> themes;
    std::unordered_map<std::string, EnvironmentData> environments;
    std::unordered_map<std::string, TraitDefinition> traits;
    std::unordered_map<std::string, Ability> baseAbilities;
};

bool validateDataFile(const std::string &filepath);

} // namespace detail
} // namespace crescent

#endif // CRESCENT_PRIVATE_DATALOADER_H