#ifndef CRESCENT_PRIVATE_SERIALIZER_H
#define CRESCENT_PRIVATE_SERIALIZER_H

#include "crescent/CreatureEnums.h"
#include <nlohmann/json.hpp>
#include <optional>
#include <string>
#include <unordered_set>
#include <vector>

namespace crescent {

class Serializer {
  public:
    template <typename T> static std::string enumToString(T value);

    template <typename T>
    static std::optional<T> stringToEnum(const std::string &str);

  private:
    Serializer() = default;
};

namespace detail {
// Container serialization helpers
template <typename T> nlohmann::json serializeVector(const std::vector<T> &vec);

template <typename T>
std::vector<T> deserializeVector(const nlohmann::json &json);

template <typename T>
nlohmann::json serializeSet(const std::unordered_set<T> &set);

template <typename T>
std::unordered_set<T> deserializeSet(const nlohmann::json &json);

// Validation
template <typename T> bool validateContainer(const T &container);

// Custom type serialization
nlohmann::json
serializeAbilitySet(const std::unordered_set<Ability> &abilities);
std::unordered_set<Ability> deserializeAbilitySet(const nlohmann::json &json);
} // namespace detail

} // namespace crescent

#endif // CRESCENT_PRIVATE_SERIALIZER_H