// internal/processors/FormProcessor.h
#ifndef CREATURE_ENGINE_INTERNAL_PROCESSORS_FORM_PROCESSOR_H
#define CREATURE_ENGINE_INTERNAL_PROCESSORS_FORM_PROCESSOR_H

#include "creature_engine/core/CreatureCore.h"

namespace crescent {
namespace impl {

/**
 * @brief Processes physical form modifications
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

} // namespace impl
} // namespace crescent

#endif