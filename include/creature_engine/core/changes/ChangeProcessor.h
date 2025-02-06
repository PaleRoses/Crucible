#ifndef CREATURE_ENGINE_CORE_CHANGES_CHANGE_PROCESSOR_H
#define CREATURE_ENGINE_CORE_CHANGES_CHANGE_PROCESSOR_H

#include "creature_engine/core/base/CreatureExceptions.h"
#include "creature_engine/core/changes/ChangeTypes.h"
#include "creature_engine/core/state/CreatureState.h"

#include <deque>
#include <memory>
#include <mutex>
#include <vector>

namespace crescent {

/**
 * @brief Manages and processes changes to creature state
 *
 * Handles change validation, batching, history, and application
 */
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
    std::vector<FormChange> getRecentChanges(size_t count = 10) const;

    // Change analysis
    bool hasConflictingChanges(const FormChange &change) const;
    std::vector<FormChange> getPendingChanges() const;

  private:
    // Thread safety
    mutable std::mutex mutex_;

    // History tracking
    std::deque<FormChange> history_;
    static constexpr size_t MAX_HISTORY_SIZE = 100;

    // Batch processing
    bool batchMode_{false};
    std::vector<FormChange> pendingChanges_;

    // Validation
    ValidationStatus minValidationLevel_{ValidationStatus::Warning};

    // Processing helpers
    ChangeResult validateChange(const CreatureState &state,
                                const FormChange &change) const;
    void applyChange(CreatureState &state, const FormChange &change);
    void recordChange(const FormChange &change);
    void pruneHistory();

    // Conflict management
    bool checkConflicts(const FormChange &change) const;
    std::vector<FormChange>
    resolveConflicts(const std::vector<FormChange> &changes) const;
    bool isHigherPriority(const FormChange &a, const FormChange &b) const;
};

} // namespace crescent

#endif // CREATURE_ENGINE_CORE_CHANGES_CHANGE_PROCESSOR_H