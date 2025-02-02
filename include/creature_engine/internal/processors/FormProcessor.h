// internal/processors/FormProcessor.h
#ifndef CREATURE_ENGINE_INTERNAL_PROCESSORS_FORM_PROCESSOR_H
#define CREATURE_ENGINE_INTERNAL_PROCESSORS_FORM_PROCESSOR_H

#include "creature_engine/core/CreatureCore.h"

namespace crescent {
namespace impl {

/**
 * @brief Reference class documenting form modifications across the system
 *
 * This class serves as a reference point for understanding how a creature's
 * physical form can be modified. For actual implementations, see:
 *
 * - MutationProcessor::updateMutatedForm
 * - EvolutionProcessor::updateEvolvedForm
 * - EnvironmentalManifestationProcessor::updateEnvironmentalForm
 *
 * @note This is a documentation class - actual form processing is handled
 *       by the respective system processors
 */
class FormProcessor {
  public:
    // Documentation methods showing possible form modifications
    static void updateForEvolution(PhysicalForm &form,
                                   const std::string &evolutionPath) = delete;
    static void updateForEnvironment(PhysicalForm &form,
                                     const std::string &environment) = delete;
    static void updateForMutation(PhysicalForm &form,
                                  const std::string &mutation) = delete;
};

} // namespace impl
} // namespace crescent

#endif