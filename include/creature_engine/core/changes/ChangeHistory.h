#ifndef CREATURE_ENGINE_CORE_CHANGES_CHANGE_HISTORY_H
#define CREATURE_ENGINE_CORE_CHANGES_CHANGE_HISTORY_H

#include "creature_engine/core/changes/ChangeTypes.h"
#include "creature_engine/io/SerializationStructures.h"
#include <chrono>
#include <deque>
#include <memory>
#include <nlohmann/json.hpp>
#include <optional>
#include <string>
#include <unordered_map>

namespace crescent {

/**
 * @brief Tracks and manages historical changes to creature state
 *
 * Maintains chronological history of changes while supporting potential
 * future extension points through a flexible change type system
 */
class ChangeHistory {
  public:
    struct HistoryEntry {
        FormChange change;
        std::chrono::system_clock::time_point timestamp;
        std::string sourceSystem; // "trait", "theme", etc.
        bool isReverted{false};
    };

    struct HistoryMetrics {
        size_t totalChanges{0};
        std::unordered_map<std::string, size_t> changesBySource;
        std::unordered_map<std::string, float> averageIntensityBySource;
        std::chrono::system_clock::time_point firstChange;
        std::chrono::system_clock::time_point lastChange;
    };

    // Construction
    ChangeHistory();
    explicit ChangeHistory(size_t maxSize);

    // History management
    void recordChange(const FormChange &change);
    bool revertChange(size_t index);
    void clear();

    // Query interface
    std::vector<HistoryEntry> getRecentChanges(size_t count) const;
    std::optional<HistoryEntry>
    getLastChangeBySource(const std::string &sourceSystem) const;
    HistoryMetrics getMetrics() const;

    // Analysis
    float calculateChangeFrequency(const std::string &sourceSystem) const;
    std::vector<std::string> getMostActiveChangeSources() const;
    bool hasReachedStabilityThreshold() const;

    // Extension point registration
    void registerChangeSource(const std::string &sourceSystem);
    bool isValidChangeSource(const std::string &sourceSystem) const;

    // Serialization
    nlohmann::json
    serializeToJson(const SerializationOptions &options = {}) const;
    static ChangeHistory deserializeFromJson(const nlohmann::json &data);

  private:
    std::deque < His