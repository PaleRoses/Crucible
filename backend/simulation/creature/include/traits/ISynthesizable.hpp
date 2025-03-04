#ifndef CREATURE_ENGINE_TRAITS_INTERFACES_ISYNTHESIZABLE_H
#define CREATURE_ENGINE_TRAITS_INTERFACES_ISYNTHESIZABLE_H

#include "creature_engine/io/SerializationStructures.h"
#include "creature_engine/traits/base/TraitEnums.h"
#include "creature_engine/traits/synthesis/SynthesisRules.h"
#include "creature_engine/traits/synthesis/SynthesisState.h"

#include <chrono>
#include <optional>
#include <string>
#include <vector>

namespace crescent::traits {

/**
 * @brief Result of a synthesis operation
 */
struct SynthesisResult {
    bool success;
    std::string message;
    std::optional<std::string> resultForm;
    float stabilityFactor;
    std::vector<std::string> warnings;
};

/**
 * @brief Interface for objects that can undergo synthesis transformations
 *
 * Defines the contract for types that can participate in the synthesis system.
 * Implementors must manage their own synthesis state and handle catalyst
 * interactions.
 */
class ISynthesizable {
  public:
    virtual ~ISynthesizable() = default;

    // Prevent copying and moving
    ISynthesizable(const ISynthesizable &) = delete;
    ISynthesizable &operator=(const ISynthesizable &) = delete;
    ISynthesizable(ISynthesizable &&) = delete;
    ISynthesizable &operator=(ISynthesizable &&) = delete;

    /**
     * @brief Check if synthesis is currently possible
     * @return Synthesis capability and any blocking factors
     */
    virtual std::pair<bool, std::vector<std::string>>
    checkSynthesisCapability() const = 0;

    /**
     * @brief Get current synthesis state if one exists
     */
    virtual std::optional<SynthesisState> getCurrentSynthesis() const = 0;

    /**
     * @brief Get synthesis potential information
     */
    struct SynthesisPotential {
        int maxLevel;
        float currentThreshold;
        std::vector<std::string> availableForms;
        std::unordered_map<std::string, float> catalystThresholds;
    };
    virtual SynthesisPotential getSynthesisPotential() const = 0;

    /**
     * @brief Attempt to begin a synthesis transformation
     * @return Result of the synthesi