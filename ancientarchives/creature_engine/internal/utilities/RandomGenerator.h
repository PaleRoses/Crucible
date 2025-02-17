// internal/utilities/NameGenerator.h
#ifndef CREATURE_ENGINE_INTERNAL_NAME_GENERATOR_H
#define CREATURE_ENGINE_INTERNAL_NAME_GENERATOR_H

#include "creature_engine/core/CreatureCore.h"
#include <string>
#include <unordered_map>
#include <vector>

namespace crescent {
namespace detail {

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

} // namespace detail
} // namespace crescent

#endif // CREATURE_ENGINE_INTERNAL_NAME_GENERATOR_H