// internal/processors/StressorProcessor.h
#ifndef CREATURE_ENGINE_INTERNAL_PROCESSORS_STRESSOR_PROCESSOR_H
#define CREATURE_ENGINE_INTERNAL_PROCESSORS_STRESSOR_PROCESSOR_H

#include <string>
#include <vector>

namespace crescent {
// Forward declarations
struct EnvironmentalStressor;

namespace impl {

/**
 * @brief Processes environmental stressors and their effects
 */
class StressorProcessor {
  public:
    static std::vector<EnvironmentalStressor>
    getEnvironmentStressors(const std::string &environment);

    static float getEnvironmentalModifier(const std::string &environment,
                                          const std::string &source);
};

} // namespace impl
} // namespace crescent

#endif