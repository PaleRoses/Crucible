// internal/utilities/ValidationUtils.h
#ifndef CREATURE_ENGINE_INTERNAL_VALIDATION_UTILS_H
#define CREATURE_ENGINE_INTERNAL_VALIDATION_UTILS_H

#include "creature_engine/core/CreatureCore.h"
#include <string>
#include <vector>

namespace crescent {
namespace detail {

/**
 * @brief Internal validation utilities
 */
class ValidationUtils {
  public:
    static bool checkTraitCompatibility(const std::string &trait1,
                                        const std::string &trait2);
    static bool checkThemeStackValidity(const std::vector<std::string> &themes);
    static bool checkEnvironmentalCompatibility(const std::string &environment,
                                                const CreatureState &state);
};

} // namespace detail
} // namespace crescent

#endif // CREATURE_ENGINE_INTERNAL_VALIDATION_UTILS_H