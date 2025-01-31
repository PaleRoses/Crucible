#ifndef CRESCENT_IMPLEMENTATION_SPECIFIC_H
#define CRESCENT_IMPLEMENTATION_SPECIFIC_H

#include "crescent/CreatureStructures.h"
#include <memory>
#include <string>
#include <vector>

namespace crescent {
namespace impl {

/**
 * @brief Implementation-specific creature state cache
 */
struct CreatureStateCache {
    std::unordered_map<std::string, float> traitStrengthCache;
    std::unordered_map<std::string, bool> environmentalCompatibilityCache;
    std::unordered_map<std::string, float> themeResonanceCache;

    void invalidate();
    void updateTraitStrengths(const CreatureState &state);
    void updateEnvironmentalCompatibility(const CreatureState &state);
};

/**
 * @brief Helper for managing ability calculations
 */
class AbilityProcessor {
  public:
    static std::vector<Ability>
    generateEvolutionaryAbilities(const std::string &evolutionPath,
                                  const CreatureState &state);

    static void processEnvironmentalAbilities(CreatureState &state,
                                              const std::string &environment);

    static void processMutationAbilities(CreatureState &state,
                                         const std::string &mutation);
};

class StressorProcessor {
  public:
    static std::vector<EnvironmentalStressor>
    getEnvironmentStressors(const std::string &environment);
    static float getEnvironmentalModifier(const std::string &environment,
                                          const std::string &source);
};

class SynthesisProcessor {
  public:
    static bool
    checkRequirements(const std::string &environment,
                      const std::unordered_set<std::string> &abilities);
};

/**
 * @brief Helper for processing physical form changes
 */
class FormProcessor {
  public:
    static void updateForEvolution(PhysicalForm &form,
                                   const std::string &evolutionPath);

    static void updateForEnvironment(PhysicalForm &form,
                                     const std::string &environment);

    static void updateForMutation(PhysicalForm &form,
                                  const std::string &mutation);
};

/**
 * @brief Constants and configuration
 */
struct Constants {
    static constexpr float MIN_TRAIT_STRENGTH = 0.1f;
    static constexpr float MAX_THEME_RESONANCE = 1.0f;
    static constexpr int MAX_EVOLUTION_STAGE = 3;
    static constexpr size_t MAX_ACTIVE_ABILITIES = 10;
};

} // namespace impl
} // namespace crescent

#endif