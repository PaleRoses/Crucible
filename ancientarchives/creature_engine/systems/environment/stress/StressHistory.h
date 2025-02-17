// systems/environment/stress/StressHistory.h
#ifndef CREATURE_ENGINE_STRESS_STRESS_HISTORY_H
#define CREATURE_ENGINE_STRESS_STRESS_HISTORY_H

#include "creature_engine/io/SerializationStructures.h"
#include <deque>
#include <nlohmann/json.hpp>
#include <string>
#include <unordered_map>
#include <vector>

namespace crescent::environment {

class StressHistory {
  public:
    struct StressRecord {
        float stressLevel;
        std::string primaryStressor;
        std::vector<std::string> activeStressors;
        std::vector<std::string> activeResistances;
        std::vector<std::string> triggeredResponses;
        int timestamp;
    };

    struct HistoryAnalysis {
        float averageStress;
        float peakStress;
        int timeAtPeak;
        std::vector<std::string> commonStressors;
        std::vector<std::string> successfulResponses;
        bool hasStabilized;
    };

    static StressHistory &getInstance() {
        static StressHistory instance;
        return instance;
    }

    // History recording
    void recordStressState(const std::string &creatureId,
                           const StressRecord &record);
    void pruneHistory(const std::string &creatureId, int keepLastNRecords);

    // History analysis
    HistoryAnalysis analyzeHistory(const std::string &creatureId) const;
    bool hasImprovedOverTime(const std::string &creatureId) const;
    std::vector<std::string>
    getMostEffectiveResponses(const std::string &creatureId) const;

    // Pattern recognition
    bool hasStressPattern(const std::string &creatureId) const;
    std::vector<std::string>
    predictFutureStressors(const std::string &creatureId) const;
    float predictNextStressLevel(const std::string &creatureId) const;

    // Configuration
    void loadFromConfig(const std::string &configPath,
                        const SerializationOptions &options = {});
    void loadFromJson(const nlohmann::json &config,
                      const SerializationOptions &options = {});
    nlohmann::json toJson(const SerializationOptions &options = {}) const;

  private:
    StressHistory() = default;

    std::unordered_map<std::string, std::deque<StressRecord>>
        creatureHistories_;

    // Analysis helpers
    float calculateStressTrend(const std::vector<StressRecord> &history) const;
    std::vector<std::string>
    findCommonPatterns(const std::vector<StressRecord> &history) const;
    bool detectStabilization(const std::vector<StressRecord> &history) const;
};

} // namespace crescent::environment

#endif