#ifndef CREATURE_ENGINE_TRAITS_BASE_TRAIT_ENUMS_H
#define CREATURE_ENGINE_TRAITS_BASE_TRAIT_ENUMS_H

namespace crescent::traits {

/**
 * @brief Core trait manifestation types
 */
enum class ManifestationType {
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
 * @brief Trait synthesis states
 */
enum class SynthesisState {
    None,      // No synthesis
    Forming,   // Beginning synthesis
    Stable,    // Stable synthesis
    Degrading, // Losing synthesis
    Critical   // About to break down
};

/**
 * @brief Synthesis source/catalyst types
 */
enum class CatalystType {
    Environmental, // Environment-driven
    Thematic,      // Theme-driven
    Stress,        // Stress-response
    Resonance,     // Trait interaction
    External       // External source
};

/**
 * @brief Trait compatibility levels
 */
enum class CompatibilityLevel {
    Incompatible, // Cannot coexist
    Neutral,      // No interaction
    Synergistic,  // Beneficial interaction
    Required      // Must exist together
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

/**
 * @brief Trait manifestation stability
 */
enum class TraitStability {
    Unstable,    // May change/fail
    Fluctuating, // Changes strength
    Stable,      // Maintains state
    Reinforced,  // Extra stable
    Permanent    // Cannot change
};

} // namespace crescent::traits

#endif // CREATURE_ENGINE_TRAITS_BASE_TRAIT_ENUMS_H