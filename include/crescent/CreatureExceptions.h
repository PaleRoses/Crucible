#ifndef CREATURE_EXCEPTIONS_H
#define CREATURE_EXCEPTIONS_H

#include <stdexcept>
#include <string>
#include <unordered_map>
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
 * @brief Exception thrown during creature generation
 */
class CreatureGenerationException : public CreatureException {
  public:
    explicit CreatureGenerationException(const std::string &message)
        : CreatureException("Generation Error: " + message) {}
};

/**
 * @brief Exception thrown for theme compatibility issues
 */
class ThemeCompatibilityException : public CreatureException {
  public:
    explicit ThemeCompatibilityException(const std::string &message)
        : CreatureException("Theme Compatibility Error: " + message) {}

    /**
     * @brief Creates exception for incompatible themes
     * @param theme1 First theme
     * @param theme2 Second theme
     * @return Formatted exception
     */
    static ThemeCompatibilityException
    incompatibleThemes(const std::string &theme1, const std::string &theme2) {
        return ThemeCompatibilityException("Themes '" + theme1 + "' and '" +
                                           theme2 + "' are incompatible");
    }
};

/**
 * @brief Exception thrown for environmental stress issues
 */
class EnvironmentalStressException : public CreatureException {
  public:
    explicit EnvironmentalStressException(const std::string &message)
        : CreatureException("Environmental Stress Error: " + message) {}

    /**
     * @brief Creates exception for lethal conditions
     * @param environment Environment name
     * @param stress Stress level
     * @return Formatted exception
     */
    static EnvironmentalStressException
    lethalCondition(const std::string &environment, float stress) {
        return EnvironmentalStressException(
            "Lethal conditions in " + environment +
            " (stress level: " + std::to_string(stress) + ")");
    }
};

/**
 * @brief Exception thrown for evolution-related issues
 */
class EvolutionException : public CreatureException {
  public:
    explicit EvolutionException(const std::string &message)
        : CreatureException("Evolution Error: " + message) {}

    /**
     * @brief Creates exception for invalid evolution attempt
     * @param stage Current evolution stage
     * @param reason Failure reason
     * @return Formatted exception
     */
    static EvolutionException invalidEvolution(int stage,
                                               const std::string &reason) {
        return EvolutionException("Cannot evolve at stage " +
                                  std::to_string(stage) + ": " + reason);
    }
};

/**
 * @brief Exception thrown for mutation-related issues
 */
class MutationException : public CreatureException {
  public:
    explicit MutationException(const std::string &message)
        : CreatureException("Mutation Error: " + message) {}

    /**
     * @brief Creates exception for invalid mutation
     * @param mutation Attempted mutation
     * @param reason Failure reason
     * @return Formatted exception
     */
    static MutationException invalidMutation(const std::string &mutation,
                                             const std::string &reason) {
        return MutationException("Cannot mutate into '" + mutation +
                                 "': " + reason);
    }
};

/**
 * @brief Exception thrown for validation failures
 */
class ValidationException : public CreatureException {
  public:
    explicit ValidationException(const std::string &message,
                                 const std::vector<std::string> &errors = {})
        : CreatureException("Validation Error: " + message), errors(errors) {}

    /**
     * @brief Gets validation errors
     * @return Vector of error messages
     */
    const std::vector<std::string> &getErrors() const { return errors; }

  private:
    std::vector<std::string> errors;
};

/**
 * @brief Exception thrown for serialization issues
 */
class SerializationException : public CreatureException {
  public:
    explicit SerializationException(const std::string &message)
        : CreatureException("Serialization Error: " + message) {}

    /**
     * @brief Creates exception for missing required field
     * @param field Field name
     * @return Formatted exception
     */
    static SerializationException missingField(const std::string &field) {
        return SerializationException("Missing required field: " + field);
    }
};

/**
 * @brief Error code enumeration for error handling
 */
enum class CreatureErrorCode {
    Success = 0,
    InvalidArgument,
    GenerationFailed,
    ThemeConflict,
    EnvironmentalHazard,
    EvolutionFailed,
    MutationFailed,
    ValidationFailed,
    SerializationFailed
};

/**
 * @brief Maps error codes to descriptive messages
 */
class ErrorCodeMapper {
  public:
    /**
     * @brief Gets description for error code
     * @param code Error code to describe
     * @return Error description
     */
    static std::string getDescription(CreatureErrorCode code) {
        static const std::unordered_map<CreatureErrorCode, std::string>
            descriptions = {
                {CreatureErrorCode::Success,
                 "Operation completed successfully"},
                {CreatureErrorCode::InvalidArgument,
                 "Invalid argument provided"},
                {CreatureErrorCode::GenerationFailed,
                 "Creature generation failed"},
                {CreatureErrorCode::ThemeConflict,
                 "Theme compatibility conflict"},
                {CreatureErrorCode::EnvironmentalHazard,
                 "Environmental hazard encountered"},
                {CreatureErrorCode::EvolutionFailed,
                 "Evolution process failed"},
                {CreatureErrorCode::MutationFailed, "Mutation process failed"},
                {CreatureErrorCode::ValidationFailed,
                 "Validation checks failed"},
                {CreatureErrorCode::SerializationFailed,
                 "Serialization process failed"}};

        auto it = descriptions.find(code);
        return it != descriptions.end() ? it->second : "Unknown error";
    }
};

} // namespace crescent

#endif // CREATURE_EXCEPTIONS_H