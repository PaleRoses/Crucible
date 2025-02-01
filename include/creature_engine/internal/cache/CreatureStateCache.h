// internal/cache/CreatureStateCache.h
#ifndef CREATURE_ENGINE_INTERNAL_CACHE_CREATURE_STATE_CACHE_H
#define CREATURE_ENGINE_INTERNAL_CACHE_CREATURE_STATE_CACHE_H

#include "creature_engine/core/CreatureCore.h"
#include <string>
#include <unordered_map>

namespace crescent {
namespace impl {

/**
 * @brief Cache for creature state calculations
 */
struct CreatureStateCache {
    std::unordered_map<std::string, float> traitStrengthCache;
    std::unordered_map<std::string, bool> environmentalCompatibilityCache;
    std::unordered_map<std::string, float> themeResonanceCache;

    void invalidate();
    void updateTraitStrengths(const CreatureState &state);
    void updateEnvironmentalCompatibility(const CreatureState &state);
};

} // namespace impl
} // namespace crescent

#endif