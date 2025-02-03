#ifndef CREATURE_ENGINE_CORE_STATE_TRAIT_STATE_H
#define CREATURE_ENGINE_CORE_STATE_TRAIT_STATE_H

#include "creature_engine/core/base/CreatureEnums.h"
#include "creature_engine/core/changes/ChangeTypes.h"
#include <nlohmann/json.hpp>
#include <optional>
#include <string>
#include <unordered_map>
#include <unordered_set>
#include <vector>

namespace crescent {

class TraitState {
  public:
    // Construction
    TraitState() = default;
    ~TraitState() = default;

    // Core trait management
    bool addTrait(const TraitDefinition &trait);
    bool removeTrait(const std::string &traitName);
    bool hasTrait(const std::string &traitName) const;
    std::optional<TraitDefinition> getTrait(const std::string &traitName) const;
    const std::vector<TraitDefinition> &getAllTraits() const { return traits_; }

    // Base manifestation management
    bool addBaseManifestation(const std::string &traitName,
                              const std::string &manifestation);
    bool removeBaseManifestation(const std::string &traitName,
                                 const std::string &manifestation);
    const std::unordered_set<std::string> &
    getBaseManifestations(const std::string &traitName) const;

    // Compatibility management
    bool isCompatible(const std::string &trait1,
                      const std::string &trait2) const;
    void setIncompatible(const std::string &trait1, const std::string &trait2);
    void removeIncompatibility(const std::string &trait1,
                               const std::string &trait2);
    const std::unordered_set<std::string> &
    getIncompatibilities(const std::string &traitName) const;

    // Base trait properties
    float getBaseStrength(const std::string &traitName) const;
    void setBaseStrength(const std::string &traitName, float strength);
    void modifyBaseStrength(const std::string &traitName, float delta);

    // Theme interactions
    float getThemeResonance(const std::string &traitName,
                            const std::string &theme) const;
    void setThemeResonance(const std::string &traitName,
                           const std::string &theme, float resonance);

    // Mutation paths
    void addMutationPath(const std::string &traitName,
                         const std::string &mutation);
    void removeMutationPath(const std::string &traitName,
                            const std::string &mutation);
    const std::unordered_set<std::string> &
    getMutationPaths(const std::string &traitName) const;

    // Change application
    bool canApplyChange(const TraitChange &change) const;
    bool applyChange(const TraitChange &change);
    std::optional<TraitChange> generateUndo(const TraitChange &change) const;

    // Validation
    bool isValid() const;
    std::vector<std::string> validate() const;

    // Serialization
    nlohmann::json serializeToJson() const;
    static TraitState deserializeFromJson(const nlohmann::json &json);

  private:
    // Core storage
    std::vector<TraitDefinition> traits_;
    std::unordered_map<std::string, size_t> traitIndices_;

    // Trait relationships and properties
    std::unordered_map<std::string, std::unordered_set<std::string>>
        incompatibilities_;
    std::unordered_map<std::string, float> baseStrengths_;
    std::unordered_map<std::string, std::unordered_set<std::string>>
        mutationPaths_;
    std::unordered_map<std::string, std::unordered_map<std::string, float>>
        themeResonance_;

    // Basic validation
    bool validateBasics() const;
    bool validateTraits() const;
    bool validateCompatibility() const;
    bool validateStrengths() const;

    // Helper methods
    void updateTraitIndex(const std::string &traitName, size_t index);
    void removeTraitIndex(const std::string &traitName);
    bool isTraitIndexValid(const std::string &traitName) const;
};

} // namespace crescent

#endif // CREATURE_ENGINE_CORE_STATE_TRAIT_STATE_H