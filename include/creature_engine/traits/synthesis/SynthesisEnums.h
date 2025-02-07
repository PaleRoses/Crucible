// SynthesisEnums.h
#ifndef CREATURE_ENGINE_TRAITS_SYNTHESIS_SYNTHESIS_ENUMS_H
#define CREATURE_ENGINE_TRAITS_SYNTHESIS_SYNTHESIS_ENUMS_H

namespace crescent::traits {

/**
 * @brief Current state of synthesis process
 */
enum class SynthesisStage {
    None,        // No synthesis in progress
    Initiating,  // Beginning synthesis
    Forming,     // Actively synthesizing
    Stabilizing, // Reaching stability
    Complete,    // Fully synthesized
    Degrading,   // Losing stability
    Critical     // About to break down
};

/**
 * @brief Types of synthesis catalysts
 */
enum class CatalystType {
    Environmental, // Environment-driven
    Stress,        // Stress response
    Resonance,     // Trait interaction
    Forced,        // Intentional adaptation
    External       // Outside influence
};

/**
 * @brief Synthesis stability classifications
 */
enum class StabilityClass {
    Unstable,    // May degrade
    Fluctuating, // Variable stability
    Stable,      // Maintains form
    Reinforced,  // Extra stable
    Permanent    // Cannot degrade
};

/**
 * @brief Synthesis failure modes
 */
enum class SynthesisFailureType {
    Requirements,   // Missing requirements
    Stability,      // Insufficient stability
    Incompatible,   // Incompatible form
    Environmental,  // Wrong environment
    CatalystWeak,   // Weak catalyst
    SystemicFailure // Internal failure
};

} // namespace crescent::traits

#endif