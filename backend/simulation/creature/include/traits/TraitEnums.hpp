#ifndef CREATURE_ENGINE_TRAITS_BASE_TRAIT_ENUMS_H
#define CREATURE_ENGINE_TRAITS_BASE_TRAIT_ENUMS_H

namespace crescent::traits {

/**
 * @brief Core trait categorization
 */
enum class TraitCategory {
    Physical,   // Visible physical changes
    Behavioral, // Behavior modifications
    Metabolic,  // Internal processes
    Sensory,    // Sensing capabilities
    Defensive,  // Protection mechanisms
    Offensive,  // Attack capabilities
    Adaptive,   // Environmental adaptation
    Ethereal    // Non-physical manifestations
};

/**
 * @brief Trait origin/source types
 */
enum class TraitOrigin {
    Innate,     // Born with trait
    Evolved,    // Developed through evolution
    Synthesized // Gained through synthesis
};

/**
 * @brief Manifestation type classification
 */
enum class ManifestationType {
    Physical,   // Physical appearance
    Behavioral, // Behavior patterns
    Metabolic,  // Internal processes
    Sensory,    // Sensing abilities
    Defensive,  // Protection features
    Offensive,  // Attack features
    Adaptive,   // Environmental features
    Ethereal    // Non-physical features
};

/**
 * @brief Trait compatibility classification
 */
enum class CompatibilityLevel {
    Incompatible, // Cannot coexist
    Neutral,      // No interaction
    Synergistic,  // Beneficial interaction
    Required      // Must exist together
};

/**
 * @brief Trait stability states
 */
enum class TraitStability {
    Unstable,    // May change/fail
    Fluctuating, // Changes strength
    Stable,      // Maintains state
    Reinforced,  // Extra stable
    Permanent    // Cannot change
};

/**
 * @brief Trait adaptation stages
 */
enum class AdaptationStage {
    Resistant,   // Resisting change
    Receptive,   // Open to change
    Adapting,    // Currently changing
    Transformed, // Successfully changed
    Reverted     // Change failed
};

/**
 * @brief Trait stress responses
 */
enum class StressResponse {
    Suppress,  // Trait weakens
    Enhance,   // Trait strengthens
    Transform, // Trait changes form
    Breakdown, // Trait fails
    Catalyze   // Triggers synthesis
};

} // namespace crescent::traits

#endif // CREATURE_ENGINE_TRAITS_BASE_TRAIT_ENUMS_H