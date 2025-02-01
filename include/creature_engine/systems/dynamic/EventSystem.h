// EventSystem.h
#ifndef CRESCENT_EVENT_SYSTEM_H
#define CRESCENT_EVENT_SYSTEM_H

#include "creature_engine/core/CreatureEnums.h"
#include <functional>
#include <memory>
#include <nlohmann/json.hpp>
#include <queue>
#include <unordered_map>
#include <vector>

namespace crescent {

/**
 * @brief Event priority levels
 */
enum class EventPriority { Low, Normal, High, Critical };

enum class EventType {
    Creature, // Maps to our existing CreatureEvent enum
    Environment,
    Evolution,
    World,
    Ineraction,
    External, // For external system integration
    Custom    // For user-defined events
};

/**
 * @brief Event data wrapper
 */
struct EventData {
    CreatureEvent type;
    nlohmann::json payload;
    EventPriority priority;
    std::string source;

    EventData(CreatureEvent t, const nlohmann::json &p,
              EventPriority pr = EventPriority::Normal,
              const std::string &src = "")
        : type(t), payload(p), priority(pr), source(src) {}
};

using EventCallback = std::function<void(const EventData &)>;

/**
 * @brief Base event interface
 */
class EventDispatcher {
  public:
    virtual ~EventDispatcher() = default;
    virtual void dispatch(const EventData &event) = 0;
};

/**
 * @brief Core event system
 */
class EventSystem {
  public:
    virtual ~EventSystem() = default;

    void addEventListener(CreatureEvent event, EventCallback callback,
                          EventPriority priority = EventPriority::Normal);
    void removeEventListener(CreatureEvent event);
    void removeAllListeners();

    void setDispatcher(std::shared_ptr<EventDispatcher> dispatcher);
    bool hasListeners(CreatureEvent event) const;

    // Event queue management
    void queueEvent(const EventData &event);
    void processEventQueue();
    void clearEventQueue();

  protected:
    void emitEvent(const EventData &event);

  private:
    struct ListenerInfo {
        EventCallback callback;
        EventPriority priority;
    };

    std::unordered_map<CreatureEvent, std::vector<ListenerInfo>> eventListeners;
    std::shared_ptr<EventDispatcher> dispatcher;
    std::priority_queue<EventData> eventQueue;

    void sortListenersByPriority(CreatureEvent event);
};

class EventRegistry {
  public:
    // Event Type Registration
    static void registerEventType(const std::string &name, EventType type);
    static void registerEventHandler(EventType type, EventCallback handler);
    static void unregisterEventType(const std::string &name);

    // Custom Event Definition
    static EventType defineCustomEvent(const std::string &name);
    static bool isCustomEvent(EventType type);

    // Event Validation
    static bool isValidEventType(const std::string &name);
    static bool hasHandler(EventType type);

    // Event Metadata
    struct EventMetadata {
        std::string description;
        std::vector<std::string> requiredFields;
        bool isPersistent;
        EventPriority defaultPriority;
    };

    static void setEventMetadata(EventType type, const EventMetadata &metadata);
    static EventMetadata getEventMetadata(EventType type);

  private:
    static std::unordered_map<std::string, EventType> eventTypes;
    static std::unordered_map<EventType, std::vector<EventCallback>> handlers;
    static std::unordered_map<EventType, EventMetadata> metadata;

    // Custom event range management
    static EventType nextCustomEventType;
    static const EventType customEventRangeStart = EventType::Custom;

    static bool isInCustomRange(EventType type);
};

/**
 * @brief Event validation and processing utilities
 */
namespace EventProcessor {
bool validateEventData(const EventData &data);
bool shouldQueueEvent(const EventData &data);
void logEvent(const EventData &data);
nlohmann::json createEventPayload(const std::string &type,
                                  const nlohmann::json &data);
} // namespace EventProcessor

} // namespace crescent

#endif // CRESCENT_EVENT_SYSTEM_H