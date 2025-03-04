#ifndef CREATURE_ENGINE_CORE_BASE_CREATURE_CORE_H
#define CREATURE_ENGINE_CORE_BASE_CREATURE_CORE_H

#include "creature_engine/core/base/CreatureEnums.h"
#include "creature_engine/core/changes/ChangeProcessor.h"
#include "creature_engine/core/changes/FormChange.h"
#include "creature_engine/core/state/CreatureState.h"
#include "creature_engine/io/SerializationStructures.h"
#include "creature_engine/systems/environment/stress/StressState.h"

#include <chrono>
#include <memory>
#include <nlohmann/json.hpp>
#include <optional>
#include <string>
#include <unordered_map>
#include <unordered_set>
#include <vector>

namespace crescent {

// Forward declarations
class EnvironmentSystem;
class StressManager;

/**
 * @brief Core creature entity that manages state, adaptations, and lineage
 */
class CreatureCore {
  public:
    // Identity and Lineage
    struct CreatureIdentity {
        std::string id;                      // Unique identifier
        std::string speciesId;               // Current species grouping
        std::optional<std::string> parentId; // Original creature ID if derived
        std::string originEnvironment;       // Where first generated
        std::chrono::system_clock::time_point creationTime;
        int generationNumber; // How many adaptations deep
    };

    // Construction/Destruction
    explicit CreatureCore(std::string id);
    ~CreatureCore() = default;

    // Prevent copying, allow moving
    CreatureCore(const CreatureCore &) = delete;
    CreatureCore &operator=(const CreatureCore &) = delete;
    CreatureCore(CreatureCore &&) = default;
    CreatureCore &operator=(CreatureCore &&) = default;

    // Core identity access
    const CreatureIdentity &getIdentity() const { return identity_; }

    // Adaptation and Environment
    bool canAdaptTo(const std::string &environment) const;
    float calculateAdaptationPotential(const std::string &environment) const;

    /**
     * @brief Creates new creature instance adapted for new environment
     * @param environment Target environment
     * @return New CreatureCore instance with lineage tracking
     */
    std::unique_ptr<CreatureCore>
    createAdaptedOffspring(const std::string &environment) const;

    // State Management
    CreatureState &getState() { return state_; }
    const CreatureState &getState() const { return state_; }
    const StressState &getStressState() const { return stressState_; }

    // Change Processing
    void applyChange(const FormChange &change);
    void applyChanges(const std::vector<FormChange> &changes);
    bool undoLastChange();
    const std::vector<FormChange> &getRecentChanges(size_t count = 10) const;

    // Stress and Adaptation
    void processEnvironmentalStress(float deltaTime);
    bool hasReachedSpeciationThreshold() const;
    float calculateDivergenceFromParent() const;

    // Validation
    bool isValid() const;
    void revertToLastValidState();
    std::vector<std::string> validate() const;

    // Serialization
    nlohmann::json
    serializeToJson(const SerializationOptions &options = {}) const;
    static CreatureCore deserializeFromJson(const nlohmann::json &data);

  private:
    // Core state
    CreatureIdentity identity_;
    CreatureState state_;
    StressState stressState_;

    // Processing systems
    std::unique_ptr<ChangeProcessor> changeProcessor_;
    std::shared_ptr<StressManager> stressManager_;
    std::weak_ptr<EnvironmentSystem> currentEnvironment_;

    // Adaptation tracking
    struct AdaptationMetrics {
        float totalStressExposure;
        float averageStressLevel;
        int timeInEnvironment;
        float divergenceFromParent;
        std::unordered_map<std::string, float> traitDivergence;
    } adaptationMetrics_;

    // History
    std::vector<FormChange> changeHistory_;
    static constexpr size_t DEFAULT_HISTORY_SIZE = 100;
    size_t maxHistorySize_ = DEFAULT_HISTORY_SIZE;

    // Internal helpers
    void updateAdaptationMetrics(float deltaTime);
    void pruneHistory();
    bool validateChange(const FormChange &change) const;
    void notifyChangeApplied(const FormChange &change);

    // Speciation thresholds
    static constexpr float SPECIATION_STRESS_THRESHOLD = 0.75f;
    static constexpr float SPECIATION_TIME_THRESHOLD = 100.0f;
    static constexpr float SPECIATION_DIVERGENCE_THRESHOLD = 0.5f;
};

} // namespace crescent

#endif // CREATURE_ENGINE_CORE_BASE_CREATURE_CORE_H