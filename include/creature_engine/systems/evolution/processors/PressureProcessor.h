// processors/PressureProcessor.h - Update include path to EvolutionSystem
#ifndef CREATURE_ENGINE_EVOLUTION_PROCESSORS_PRESSURE_PROCESSOR_H
#define CREATURE_ENGINE_EVOLUTION_PROCESSORS_PRESSURE_PROCESSOR_H

#include "creature_engine/core/CreatureCore.h"
#include "creature_engine/systems/evolution/base/EvolutionSystem.h"
#include "creature_engine/systems/evolution/types/data/EvolutionaryPressure.h"
#include <vector>

namespace crescent {
namespace evolution {

class PressureProcessor {
  public:
    static float calculateEnvironmentalPressure(const CreatureState &state);
    static float calculateThemePressure(const CreatureState &state);
    static float calculateMutationPressure(const CreatureState &state);
    static bool
    isPressureCritical(const std::vector<EvolutionaryPressure> &pressures);
    static std::vector<std::string>
    getPressureOutcomes(const std::vector<EvolutionaryPressure> &pressures);

  private:
    static float calculateBasePressure(const CreatureState &state);
    static float applyPressureModifiers(float basePressure,
                                        const CreatureState &state);
};

} // namespace evolution
} // namespace crescent

#endif