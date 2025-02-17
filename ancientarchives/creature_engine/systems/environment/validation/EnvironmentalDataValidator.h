// validation/EnvironmentalDataValidator.h
#ifndef CREATURE_ENGINE_ENVIRONMENT_VALIDATION_ENVIRONMENTAL_DATA_VALIDATOR_H
#define CREATURE_ENGINE_ENVIRONMENT_VALIDATION_ENVIRONMENTAL_DATA_VALIDATOR_H

#include "creature_engine/systems/environment/base/EnvironmentConstants.h"
#include "creature_engine/systems/environment/interfaces/IDataValidator.h"
#include "creature_engine/systems/environment/types/data/EnvironmentalData.h"
#include <optional>
#include <string>
#include <unordered_map>
#include <vector>

namespace crescent::environment {

class EnvironmentalDataValidator : public IDataValidator<EnvironmentalData> {
  public:
    EnvironmentalDataValidator();

    bool validate(const EnvironmentalData &data) override;
    std::vector<std::string> getErrors() const override;
    bool validateField(const std::string &field,
                       const EnvironmentalData &data) override;
    std::unordered_map<std::string, std::string>
    getValidationRules() const override;
    bool addValidationRule(const std::string &field,
                           const std::string &rule) override;
    std::optional<std::string>
    getFieldError(const std::string &field) const override;

  protected:
    bool fieldExists(const std::string &field,
                     const EnvironmentalData &data) const override;

  private:
    // Validation helper methods
    bool validateEnvironmentName(const std::string &name);
    bool validateAdaptationLevel(float level);
    bool validateExposureTime(int time);
    bool
    validateResourceUsage(const std::unordered_map<std::string, float> &usage);
    bool validateStressors(const std::vector<EnvironmentalStressor> &stressors);

    // State
    std::vector<std::string> errors_;
    std::unordered_map<std::string, std::string> validationRules_;
    std::unordered_map<std::string, std::string> fieldErrors_;
};

} // namespace crescent::environment

#endif