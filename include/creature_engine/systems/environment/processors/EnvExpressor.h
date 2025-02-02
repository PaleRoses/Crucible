// systems/environment/processors/EnvExpressor.h
#ifndef CREATURE_ENGINE_ENVIRONMENT_PROCESSORS_ENV_EXPRESSOR_H
#define CREATURE_ENGINE_ENVIRONMENT_PROCESSORS_ENV_EXPRESSOR_H

#include "creature_engine/core/CreatureCore.h"
#include "creature_engine/systems/environment/types/data/EnvironmentTraitInteraction.h"
#include "creature_engine/systems/environment/types/data/EnvironmentalData.h"
#include <optional>
#include <string>
#include <vector>

namespace crescent {
namespace environment {

/**
 * @brief Processes how traits, forms, and abilities express themselves in
 * response to environmental exposure
 *
 * This processor handles only environment-specific expressions, distinct from:
 * - Evolution expressions (handled by evolution system)
 * - Theme expressions (handled by theme system)
 * - Mutation expressions (handled by mutation system)
 *
 * Note: Traits, forms, and abilities are processed together as they are
 * interconnected aspects of environmental expression:
 * - Traits manifest in ways that affect form
 * - Form changes can enable/disable abilities
 * - Abilities can be granted by either traits or form changes
 */
class EnvExpressor {
  public:
    // Trait expressions
    static std::vector<std::string>
    processTraitExpression(const TraitDefinition &trait,
                           const std::string &environment,
                           const EnvironmentalData &envData);

    static void updateTraitExpressions(std::vector<TraitDefinition> &traits,
                                       const std::string &environment,
                                       float adaptationLevel);

    // Form expressions
    static void expressFormChanges(PhysicalForm &form,
                                   const std::string &environment,
                                   const EnvironmentalData &envData);

    static void revertFormChanges(PhysicalForm &form,
                                  const std::string &environment);

    // Ability expressions
    static std::vector<Ability>
    generateAbilities(const CreatureState &state,
                      const std::string &environment,
                      const EnvironmentalData &envData);

    static void updateAbilities(std::vector<Ability> &abilities,
                                const std::string &environment,
                                float adaptationLevel);

    // Expression validation
    static bool canExpressInEnvironment(const std::string &trait,
                                        const std::string &environment);

    static float calculateExpressionPotential(const TraitDefinition &trait,
                                              const std::string &environment);

  private:
    // Trait processing
    static std::optional<EnvironmentTraitInteraction>
    getInteraction(const std::string &trait, const std::string &environment);

    static void applyEffects(TraitDefinition &trait,
                             const EnvironmentTraitInteraction &interaction,
                             float adaptationLevel);

    // Form processing
    static void adaptForm(PhysicalForm &form, const std::string &environment,
                          float adaptationLevel);

    static void updateLocomotion(PhysicalForm &form,
                                 const std::string &environment);

    // Ability processing
    static std::vector<Ability>
    determineViableAbilities(const CreatureState &state,
                             const std::string &environment);

    static void enhanceAbilities(std::vector<Ability> &abilities,
                                 const std::string &environment,
                                 float adaptationLevel);

    // Validation helpers
    static bool validateRequirements(const TraitDefinition &trait,
                                     const std::string &environment);

    static float calculateBasePotential(const TraitDefinition &trait);
};

} // namespace environment
} // namespace crescent

#endif