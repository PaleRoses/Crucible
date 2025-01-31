#ifndef CRESCENT_INTERNAL_DETAILS_H
#define CRESCENT_INTERNAL_DETAILS_H

#include "crescent/CreatureStructures.h"
#include <random>
#include <unordered_map>

namespace crescent {
namespace detail {

/**
 * @brief Internal random number generation utilities
 */
class RandomGenerator {
  public:
    static float getUniformFloat(float min = 0.0f, float max = 1.0f);
    static int getUniformInt(int min, int max);
    static bool rollProbability(float chance);

    template <typename T> static T &selectRandom(std::vector<T> &items);

  private:
    static std::mt19937 &getEngine();
};

/**
 * @brief Internal name generation utilities
 */
class NameGenerator {
  public:
    static std::string generateCreatureName(const PhysicalForm &form);
    static std::string generateDescriptiveName(const CreatureState &state);

  private:
    static const std::unordered_map<Size, std::vector<std::string>> prefixes;
    static const std::vector<std::string> suffixes;
};

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

#endif