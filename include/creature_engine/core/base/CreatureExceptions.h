#ifndef CREATURE_ENGINE_CORE_BASE_CREATURE_EXCEPTIONS_H
#define CREATURE_ENGINE_CORE_BASE_CREATURE_EXCEPTIONS_H

#include <stdexcept>
#include <string>
#include <vector>

namespace crescent {

/**
 * @brief Base exception class for all creature-related errors
 */
class CreatureException : public std::runtime_error {
  public:
    explicit CreatureException(const std::string &message)
        : std::runtime_error(message) {}
};

/**
 * @brief Validation-related exceptions
 */
class ValidationException : public CreatureException {
  public:
    ValidationException(const std::string &message,
                        const std::vector<std::string> &violations)
        : CreatureException("Validation Error: " + message),
          violations_(violations) {}

    const std::vector<std::string> &getViolations() const {
        return violations_;
    }

  private:
    std::vector<std::string> violations_;
};

/**
 * @brief State management exceptions
 */
class StateException : public CreatureException {
  public:
    explicit StateException(const std::string &message)
        : CreatureException("State Error: " + message) {}
};

/**
 * @brief Trait-related exceptions
 */
class TraitException : public CreatureException {
  public:
    explicit TraitException(const std::string &message)
        : CreatureException("Trait Error: " + message) {}
};

/**
 * @brief Synthesis-related exceptions
 */
class SynthesisException : public CreatureException {
  public:
    explicit SynthesisException(const std::string &message,
                                const std::string &traitId = "")
        : CreatureException("Synthesis Error: " + message), traitId_(traitId) {}

    const std::string &getTraitId() const { return traitId_; }

  private:
    std::string traitId_;
};

/**
 * @brief Environment interaction exceptions
 */
class EnvironmentException : public CreatureException {
  public:
    explicit EnvironmentException(const std::string &message)
        : CreatureException("Environment Error: " + message) {}
};

/**
 * @brief Adaptation process exceptions
 */
class AdaptationException : public CreatureException {
  public:
    AdaptationException(const std::string &message, float currentStress,
                        float threshold)
        : CreatureException("Adaptation Error: " + message),
          currentStress_(currentStress), threshold_(threshold) {}

    float getCurrentStress() const { return currentStress_; }
    float getThreshold() const { return threshold_; }

  private:
    float currentStress_;
    float threshold_;
};

/**
 * @brief System limit exceptions
 */
class LimitException : public CreatureException {
  public:
    LimitException(const std::string &message, const std::string &limitType,
                   size_t currentValue, size_t maxValue)
        : CreatureException("Limit Error: " + message), limitType_(limitType),
          currentValue_(currentValue), maxValue_(maxValue) {}

    const std::string &getLimitType() const { return limitType_; }
    size_t getCurrentValue() const { return currentValue_; }
    size_t getMaxValue() const { return maxValue_; }

  private:
    std::string limitType_;
    size_t currentValue_;
    size_t maxValue_;
};

/**
 * @brief Serialization exceptions
 */
class SerializationException : public CreatureException {
  public:
    explicit SerializationException(const std::string &message)
        : CreatureException("Serialization Error: " + message) {}
};

} // namespace crescent

#endif // CREATURE_ENGINE_CORE_BASE_CREATURE_EXCEPTIONS_H