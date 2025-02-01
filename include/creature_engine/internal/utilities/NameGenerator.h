// internal/utilities/RandomGenerator.h
#ifndef CREATURE_ENGINE_INTERNAL_RANDOM_GENERATOR_H
#define CREATURE_ENGINE_INTERNAL_RANDOM_GENERATOR_H

#include <random>
#include <vector>

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

} // namespace detail
} // namespace crescent

#endif // CREATURE_ENGINE_INTERNAL_RANDOM_GENERATOR_H