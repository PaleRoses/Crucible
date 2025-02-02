// systems/environment/base/EnvironmentConstants.h
#ifndef CREATURE_ENGINE_ENVIRONMENT_BASE_ENVIRONMENT_CONSTANTS_H
#define CREATURE_ENGINE_ENVIRONMENT_BASE_ENVIRONMENT_CONSTANTS_H

namespace crescent {
namespace environment {

struct Constants {
    static constexpr float MIN_ADAPTATION_LEVEL = 0.0f;
    static constexpr float MAX_ADAPTATION_LEVEL = 1.0f;
    static constexpr float SYNTHESIS_THRESHOLD = 0.8f;
    static constexpr int MIN_EXPOSURE_TIME = 100;
    static constexpr float LETHAL_STRESS_THRESHOLD = 0.9f;
};

} // namespace environment
} // namespace crescent

#endif