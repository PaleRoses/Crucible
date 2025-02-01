#ifndef CREATURE_CORE_SERIALIZATION_STRUCTURES_H
#define CREATURE_CORE_SERIALIZATION_STRUCTURES_H

#include <string>
#include <unordered_map>
#include <unordered_set>
#include <vector>

namespace crescent {

/**
 * @brief Configuration options for serialization processes
 */
struct SerializationOptions {
    // Core serialization flags
    bool includeHistory = true;        // Include historical data
    bool includeTemporary = false;     // Include temporary/volatile data
    bool includeProbabilities = false; // Include probability calculations

    // Field control
    std::unordered_set<std::string> excludedFields; // Fields to skip
    std::unordered_set<std::string>
        requiredFields; // Fields that must be present

    // Versioning info
    int schemaVersion = 1;           // Data schema version
    bool enforceVersionCheck = true; // Whether to enforce version matching
};

/**
 * @brief Result of a validation operation during serialization
 */
struct ValidationResult {
    bool isValid = false;
    std::vector<std::string> warnings;
    std::vector<std::string> errors;
    std::unordered_map<std::string, float> stabilityMetrics;

    // Validation state
    struct ValidationState {
        bool schemaValid = false;    // Schema validation status
        bool dataValid = false;      // Data content validation status
        bool referenceValid = false; // Reference integrity status
    } state;
};

/**
 * @brief Components used in name generation and serialization
 */
struct NameComponents {
    // Base name elements
    std::string prefix;
    std::string root;
    std::string suffix;

    // Metadata
    struct NameMetadata {
        std::string source;        // Source of the name
        bool isGenerated = false;  // Whether name was auto-generated
        int generationAttempt = 0; // Which generation attempt
    } metadata;

    // Validation
    bool isValid() const {
        return !root.empty(); // Name must at least have a root
    }
};

/**
 * @brief Configuration for how references should be handled during
 * serialization
 */
struct ReferenceHandling {
    enum class Mode {
        Strict,  // Fail if references invalid
        Lenient, // Skip invalid references
        Rebuild  // Attempt to rebuild invalid references
    } mode = Mode::Strict;

    bool validateReferences = true; // Whether to validate references
    bool includeExternal = false;   // Whether to include external references
};

} // namespace crescent

#endif // CRESCENT_SERIALIZATION_STRUCTURES_H