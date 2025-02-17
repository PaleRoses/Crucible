// interfaces/IDataValidator.h
#ifndef CREATURE_ENGINE_ENVIRONMENT_INTERFACES_I_DATA_VALIDATOR_H
#define CREATURE_ENGINE_ENVIRONMENT_INTERFACES_I_DATA_VALIDATOR_H

#include <optional>
#include <string>
#include <unordered_map>
#include <vector>

namespace crescent::environment {

/**
 * @brief Interface for data validation
 *
 * Generic interface for validating various types of data structures
 * in the environment system. Provides comprehensive validation capabilities
 * including field-specific validation and error reporting.
 *
 * @tparam T Type of data to validate
 */
template <typename T> class IDataValidator {
  public:
    virtual ~IDataValidator() = default;

    /**
     * @brief Validate entire data structure
     * @param data Data to validate
     * @return true if valid, false otherwise
     */
    virtual bool validate(const T &data) = 0;

    /**
     * @brief Get validation errors
     * @return Vector of error messages
     */
    virtual std::vector<std::string> getErrors() const = 0;

    /**
     * @brief Validate specific field in data
     * @param field Field name to validate
     * @param data Data containing the field
     * @return true if field is valid, false otherwise
     */
    virtual bool validateField(const std::string &field, const T &data) = 0;

    /**
     * @brief Get validation rules for all fields
     * @return Map of field names to their validation rules
     */
    virtual std::unordered_map<std::string, std::string>
    getValidationRules() const = 0;

    /**
     * @brief Add custom validation rule
     * @param field Field to validate
     * @param rule Validation rule to apply
     * @return true if rule added successfully, false otherwise
     */
    virtual bool addValidationRule(const std::string &field,
                                   const std::string &rule) = 0;

    /**
     * @brief Get field-specific validation errors
     * @param field Field name
     * @return Optional containing error message if field is invalid
     */
    virtual std::optional<std::string>
    getFieldError(const std::string &field) const = 0;

  protected:
    /**
     * @brief Check if field exists in data
     * @param field Field name to check
     * @param data Data to check
     * @return true if field exists, false otherwise
     */
    virtual bool fieldExists(const std::string &field, const T &data) const = 0;
};

} // namespace crescent::environment

#endif // CREATURE_ENGINE_ENVIRONMENT_INTERFACES_I_DATA_VALIDATOR_H