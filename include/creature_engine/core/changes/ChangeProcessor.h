#ifndef CREATURE_ENGINE_CORE_CHANGES_CHANGE_PROCESSOR_H
#define CREATURE_ENGINE_CORE_CHANGES_CHANGE_PROCESSOR_H

#include "creature_engine/core/base/CreatureExceptions.h"
#include "creature_engine/core/changes/ChangeTypes.h"
#include <deque>
#include <memory>
#include <mutex>
#include <unordered_map>
#include <vector>

namespace crescent {

class ChangeProcessor {
  public:
    // Construction/Destruction
    ChangeProcessor();
    ~ChangeProcessor() = default;

    // Prevent copying, allow moving
    ChangeProcessor(const ChangeProcessor &) = delete;
    ChangeProcessor &operator=(const ChangeProcessor &) = delete;
    ChangeProcessor(ChangeProcessor &&) = default;
    ChangeProcessor &operator=(ChangeProcessor &&) = default;

    // Core processing
    ChangeResult processChange(CreatureState &state, const FormChange &change);
    std::vector<ChangeResult>
    processChanges(CreatureState &state,
                   const std::vector<FormChange> &changes);

    // Batch operations
    void startBatch();
    bool commitBatch();
    void rollbackBatch();

    // History management
    bool canUndo() const;
    bool undo(CreatureState &state);
    void clearHistory();

    // Query operations
    std::vector<FormChange> getRecentChanges(size_t count = 10) const;
    bool hasConflictingChanges(const FormChange &change) const;
    std::vector<FormChange> getPendingChanges() const;

    // Configuration
    void setMaxHistorySize(size_t size);
    void setValidationLevel(ValidationStatus minLevel);

  private:
    // Thread safety
    mutable std::mutex mutex_;

    // History tracking
    std::deque<FormChange> history_;
    size_t maxHistorySize_;

    // Batch processing
    bool batchMode_;
    std::vector<FormChange> pendingChanges_;

    // Configuration
    ValidationStatus minValidationLevel_;

    // Internal processing
    ChangeResult validateChange(const CreatureState &state,
                                const FormChange &change) const;
    void applyChange(CreatureState &state, const FormChange &change);
    void recordChange(const FormChange &change);
    void pruneHistory();

    // Conflict resolution
    bool checkConflicts(const FormChange &change) const;
    std::vector<FormChange>
    resolveConflicts(const std::vector<FormChange> &changes) const;

    // Priority handling
    void sortChangesByPriority(std::vector<FormChange> &changes) const;
    bool isHigherPriority(const FormChange &a, const FormChange &b) const;
};

} // namespace crescent

#endif // CREATURE_ENGINE_CORE_CHANGES_CHANGE_PROCESSOR_H