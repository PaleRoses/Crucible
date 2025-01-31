#include "crescent/CreatureExceptions.h"
#include <sstream>

namespace crescent {

// Static utility functions for error message formatting
namespace {
std::string formatTraitError(const std::string &trait,
                             const std::string &reason) {
    std::stringstream ss;
    ss << "Trait '" << trait << "': " << reason;
    return ss.str();
}

std::string formatEnvironmentalError(const std::string &environment,
                                     float stress, const std::string &reason) {

    std::stringstream ss;
    ss << "Environmental error in '" << environment
       << "' (stress level: " << stress << "): " << reason;
    return ss.str();
}

std::string formatEvolutionError(int stage, const std::string &reason) {
    std::stringstream ss;
    ss << "Evolution failed at stage " << stage << ": " << reason;
    return ss.str();
}
} // namespace

// ValidationException implementation
std::string ValidationException::getDetailedMessage() const {
    std::stringstream ss;
    ss << what();

    if (!errors.empty()) {
        ss << "\nErrors:\n";
        for (const auto &error : errors) {
            ss << "- " << error << "\n";
        }
    }

    return ss.str();
}

// ErrorCodeMapper implementation
std::string
ErrorCodeMapper::getDetailedDescription(CreatureErrorCode code,
                                        const std::string &context) {

    std::stringstream ss;
    ss << getDescription(code);

    if (!context.empty()) {
        ss << ": " << context;
    }

    switch (code) {
    case CreatureErrorCode::InvalidArgument:
        ss << "\nPlease check your input parameters.";
        break;

    case CreatureErrorCode::GenerationFailed:
        ss << "\nTry different generation parameters.";
        break;

    case CreatureErrorCode::ThemeConflict:
        ss << "\nCheck theme compatibility before combining.";
        break;

    case CreatureErrorCode::EnvironmentalHazard:
        ss << "\nConsider adapting or finding safer environment.";
        break;

    case CreatureErrorCode::EvolutionFailed:
        ss << "\nEnsure evolution requirements are met.";
        break;

    case CreatureErrorCode::MutationFailed:
        ss << "\nVerify mutation compatibility and conditions.";
        break;

    case CreatureErrorCode::ValidationFailed:
        ss << "\nReview creature state for inconsistencies.";
        break;

    case CreatureErrorCode::SerializationFailed:
        ss << "\nCheck data format and completeness.";
        break;

    default:
        break;
    }

    return ss.str();
}

// Factory methods for ThemeCompatibilityException
ThemeCompatibilityException
ThemeCompatibilityException::conflictingThemes(const std::string &theme1,
                                               const std::string &theme2) {

    std::stringstream ss;
    ss << "Themes '" << theme1 << "' and '" << theme2
       << "' have conflicting properties";
    return ThemeCompatibilityException(ss.str());
}

ThemeCompatibilityException ThemeCompatibilityException::invalidResonance(
    const std::string &theme1, const std::string &theme2, float resonance) {

    std::stringstream ss;
    ss << "Insufficient resonance (" << resonance << ") between themes '"
       << theme1 << "' and '" << theme2 << "'";
    return ThemeCompatibilityException(ss.str());
}

// Factory methods for EnvironmentalStressException
EnvironmentalStressException
EnvironmentalStressException::criticalStress(const std::string &environment,
                                             float stress) {

    return EnvironmentalStressException(formatEnvironmentalError(
        environment, stress, "Critical stress level exceeded"));
}

EnvironmentalStressException
EnvironmentalStressException::adaptationFailed(const std::string &environment,
                                               const std::string &reason) {

    std::stringstream ss;
    ss << "Failed to adapt to '" << environment << "': " << reason;
    return EnvironmentalStressException(ss.str());
}

// Factory methods for MutationException
MutationException
MutationException::incompatibleMutation(const std::string &mutation,
                                        const std::string &trait) {

    std::stringstream ss;
    ss << "Mutation '" << mutation << "' is incompatible with trait '" << trait
       << "'";
    return MutationException(ss.str());
}

MutationException MutationException::mutationLimitReached() {
    return MutationException("Maximum mutations reached for current stage");
}

// Helper function to format validation errors
std::string formatValidationErrors(const std::vector<std::string> &errors,
                                   const std::string &context) {

    std::stringstream ss;
    ss << "Validation failed";

    if (!context.empty()) {
        ss << " for " << context;
    }

    if (!errors.empty()) {
        ss << ":\n";
        for (const auto &error : errors) {
            ss << "- " << error << "\n";
        }
    }

    return ss.str();
}

} // namespace crescent