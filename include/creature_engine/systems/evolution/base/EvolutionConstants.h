// systems/evolution/base/EvolutionConstants.h
#ifndef CREATURE_ENGINE_EVOLUTION_BASE_EVOLUTION_CONSTANTS_H
#define CREATURE_ENGINE_EVOLUTION_BASE_EVOLUTION_CONSTANTS_H

namespace crescent {
namespace evolution {

struct Constants {
    static constexpr int MAX_EVOLUTION_STAGE = 3;
    static constexpr float BASE_MUTATION_CHANCE = 0.1f;
    static constexpr float MAX_MUTATION_CHANCE = 0.5f;
    static constexpr float ENVIRONMENTAL_PRESSURE_WEIGHT = 0.3f;
    static constexpr float THEME_PRESSURE_WEIGHT = 0.2f;
    static constexpr float MUTATION_PRESSURE_WEIGHT = 0.3f;
    static constexpr float CRITICAL_PRESSURE_THRESHOLD = 0.8f;
};

} // namespace evolution
} // namespace crescent

#endif