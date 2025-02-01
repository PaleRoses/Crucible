// internal/config/Constants.h
#ifndef CREATURE_ENGINE_INTERNAL_CONFIG_CONSTANTS_H
#define CREATURE_ENGINE_INTERNAL_CONFIG_CONSTANTS_H

#include <cstddef>

namespace crescent {
namespace impl {

/**
 * @brief System-wide constants and configuration
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