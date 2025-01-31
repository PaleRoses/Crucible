#include "crescent/private/DataLoader.h"
#include "crescent/CreatureExceptions.h"
#include <filesystem>
#include <fstream>

namespace crescent {
namespace detail {

class DataLoader {
  public:
    // Singleton access
    static DataLoader &instance() {
        static DataLoader loader;
        return loader;
    }

    // Initialize data from JSON files
    void initialize(const std::string &dataPath) {
        try {
            loadThemes(dataPath + "/themes.json");
            loadEnvironments(dataPath + "/environments.json");
            loadTraits(dataPath + "/traits.json");
            loadAbilities(dataPath + "/abilities.json");
            isInitialized = true;
        } catch (const std::exception &e) {
            throw CreatureGenerationException("Failed to initialize data: " +
                                              std::string(e.what()));
        }
    }

    // Access methods for loaded data
    const ThemeDefinition &getThemeDefinition(const std::string &name) const {
        validateInitialization();
        auto it = themes.find(name);
        if (it == themes.end()) {
            throw CreatureGenerationException("Unknown theme: " + name);
        }
        return it->second;
    }

    const EnvironmentData &getEnvironmentData(const std::string &name) const {
        validateInitialization();
        auto it = environments.find(name);
        if (it == environments.end()) {
            throw CreatureGenerationException("Unknown environment: " + name);
        }
        return it->second;
    }

    const TraitDefinition &getTraitDefinition(const std::string &name) const {
        validateInitialization();
        auto it = traits.find(name);
        if (it == traits.end()) {
            throw CreatureGenerationException("Unknown trait: " + name);
        }
        return it->second;
    }

    std::vector<std::string> getValidThemes() const {
        validateInitialization();
        std::vector<std::string> result;
        for (const auto &[name, _] : themes) {
            result.push_back(name);
        }
        return result;
    }

    std::vector<std::string> getValidEnvironments() const {
        validateInitialization();
        std::vector<std::string> result;
        for (const auto &[name, _] : environments) {
            result.push_back(name);
        }
        return result;
    }

  private:
    DataLoader() = default;

    void loadThemes(const std::string &filepath) {
        std::ifstream file(filepath);
        if (!file.is_open()) {
            throw CreatureGenerationException("Could not open themes file: " +
                                              filepath);
        }

        nlohmann::json data = nlohmann::json::parse(file);
        for (const auto &[name, themeData] : data.items()) {
            themes[name] = ThemeDefinition::deserializeFromJson(themeData);
        }
    }

    void loadEnvironments(const std::string &filepath) {
        std::ifstream file(filepath);
        if (!file.is_open()) {
            throw CreatureGenerationException(
                "Could not open environments file: " + filepath);
        }

        nlohmann::json data = nlohmann::json::parse(file);
        for (const auto &[name, envData] : data.items()) {
            environments[name] = EnvironmentData::deserializeFromJson(envData);
        }
    }

    void loadTraits(const std::string &filepath) {
        std::ifstream file(filepath);
        if (!file.is_open()) {
            throw CreatureGenerationException("Could not open traits file: " +
                                              filepath);
        }

        nlohmann::json data = nlohmann::json::parse(file);
        for (const auto &[name, traitData] : data.items()) {
            traits[name] = TraitDefinition::deserializeFromJson(traitData);
        }

        validateTraitCompatibility();
    }

    void loadAbilities(const std::string &filepath) {
        std::ifstream file(filepath);
        if (!file.is_open()) {
            throw CreatureGenerationException(
                "Could not open abilities file: " + filepath);
        }

        nlohmann::json data = nlohmann::json::parse(file);
        for (const auto &[name, abilityData] : data.items()) {
            baseAbilities[name] = Ability::deserializeFromJson(abilityData);
        }
    }

    void validateTraitCompatibility() {
        for (const auto &[name1, trait1] : traits) {
            for (const auto &[name2, trait2] : traits) {
                if (name1 != name2) {
                    if (trait1.incompatibleWith.contains(name2) !=
                        trait2.incompatibleWith.contains(name1)) {
                        throw CreatureGenerationException(
                            "Inconsistent trait compatibility between " +
                            name1 + " and " + name2);
                    }
                }
            }
        }
    }

    void validateInitialization() const {
        if (!isInitialized) {
            throw CreatureGenerationException("DataLoader not initialized");
        }
    }

    bool isInitialized = false;
    std::unordered_map<std::string, ThemeDefinition> themes;
    std::unordered_map<std::string, EnvironmentData> environments;
    std::unordered_map<std::string, TraitDefinition> traits;
    std::unordered_map<std::string, Ability> baseAbilities;
};

// Example file validation helper
bool validateDataFile(const std::string &filepath,
                      const std::string &schemaPath) {
    if (!std::filesystem::exists(filepath)) {
        throw CreatureGenerationException("Data file not found: " + filepath);
    }

    try {
        std::ifstream file(filepath);
        nlohmann::json data = nlohmann::json::parse(file);

        // Load and validate against schema
        std::ifstream schemaFile(schemaPath);
        nlohmann::json schema = nlohmann::json::parse(schemaFile);

        nlohmann::json_schema::json_validator validator;
        validator.set_root_schema(schema);
        validator.validate(data);

        return true;
    } catch (const std::exception &e) {
        throw CreatureGenerationException("Invalid data file " + filepath +
                                          ": " + e.what());
    }
}

} // namespace detail
} // namespace crescent