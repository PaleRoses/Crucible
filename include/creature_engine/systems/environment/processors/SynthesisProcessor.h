// internal/processors/SynthesisProcessor.h
#ifndef CREATURE_ENGINE_INTERNAL_PROCESSORS_SYNTHESIS_PROCESSOR_H
#define CREATURE_ENGINE_INTERNAL_PROCESSORS_SYNTHESIS_PROCESSOR_H

#include <string>
#include <unordered_set>

namespace crescent {
namespace impl {

/**
 * @brief Processes synthesis requirements and capabilities
 */
class SynthesisProcessor {
  public:
    static bool
    checkRequirements(const std::string &environment,
                      const std::unordered_set<std::string> &abilities);
};

} // namespace impl
} // namespace crescent

#endif