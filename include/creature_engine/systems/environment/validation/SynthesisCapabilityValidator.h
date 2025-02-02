// validation/SynthesisCapabilityValidator.h
#ifndef CREATURE_ENGINE_ENVIRONMENT_VALIDATION_SYNTHESIS_CAPABILITY_VALIDATOR_H
#define CREATURE_ENGINE_ENVIRONMENT_VALIDATION_SYNTHESIS_CAPABILITY_VALIDATOR_H

#include "creature_engine/systems/environment/base/EnvironmentConstants.h"
#include "creature_engine/systems/environment/interfaces/IDataValidator.h"
#include "creature_engine/systems/environment/types/data/SynthesisCapability.h"
#include <optional>
#include <string>
#include <unordered_map>
#include <vector>

namespace crescent::environment {

class SynthesisCapabilityValidator
    : public IDataValidator<SynthesisCapability> {
  public:
    SynthesisCapabilityValidator();

    bool validate(const SynthesisCapability &data) override;
    std::vector<std::string> getErrors() const override;
    bool validateField(const std::string &field,
                       const SynthesisCapability &data) override;
    std::unordered_map<std::string, std::string>
    getValidationRules() const override;
    bool addValidationRule(const std::string &field,
                           const std::string &rule) override;
    std::optional<std::string>
    getFieldError(const std::string &field) const override;

  protected:
    bool fieldExists(const std::string &field,
                     const SynthesisCapability &data) const override;

  private:
    std::vector<std::string> errors_;
    std::unordered_map<std::string, std::string> validationRules_;
    std::unordered_map<std::string, std::string> fieldErrors_;
};

} // namespace crescent::environment

#endif