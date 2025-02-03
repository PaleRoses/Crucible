#ifndef CREATURE_ENGINE_CORE_BASE_CREATURE_EXCEPTIONS_H
#define CREATURE_ENGINE_CORE_BASE_CREATURE_EXCEPTIONS_H

#include <stdexcept>
#include <string>
#include <vector>

namespace crescent {

// Base exception for all creature-related errors
class CreatureException : public std::runtime_error {
  public:
    explicit CreatureException(const std::string &message)
        : std::runtime_error(message) {}
};

// Form change errors (invalid changes, conflicts, etc)
class FormChangeException : public CreatureException {
  public:
    explicit FormChangeException(const std::string &message)
        : CreatureException("Form Change Error: " + message) {}
};

// State validation failures (invalid state transitions, etc)
class StateValidationException : public CreatureException {
  public:
    explicit StateValidationException(
        const std::string &message,
        const std::vector<std::string> &violations = {})
        : CreatureException("State Validation Error: " + message),
          violations_(violations) {}

    const std::vector<std::string> &getViolations() const {
        return violations_;
    }

  private:
    std::vector<std::string> violations_;
};

// Serialization errors (JSON parsing, missing fields, etc)
class SerializationException : public CreatureException {
  public:
    explicit SerializationException(const std::string &message)
        : CreatureException("Serialization Error: " + message) {}
};

} // namespace crescent

#endif // CREATURE_ENGINE_CORE_BASE_CREATURE_EXCEPTIONS_H