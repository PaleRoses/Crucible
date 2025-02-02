// interfaces/IEnvironmentProcessor.h
#ifndef CREATURE_ENGINE_ENVIRONMENT_INTERFACES_I_ENVIRONMENT_PROCESSOR_H
#define CREATURE_ENGINE_ENVIRONMENT_INTERFACES_I_ENVIRONMENT_PROCESSOR_H

#include "creature_engine/core/CreatureExceptions.h"
#include "creature_engine/systems/environment/types/data/EnvironmentalData.h"
#include <memory>
#include <string>
#include <unordered_map>

namespace crescent::environment {

/**
 * @brief Interface defining core functionality for all environment processors
 *
 * This interface establishes the contract that all environment processors must
 * fulfill. It provides methods for processing environmental data, validating
 * processor capabilities, and managing resource requirements.
 */
class IEnvironmentProcessor {
  public:
    virtual ~IEnvironmentProcessor() = default;

    /**
     * @brief Process environmental data
     * @param data Environmental data to process
     * @throws ProcessorException if processing fails
     */
    virtual void process(EnvironmentalData &data) = 0;

    /**
     * @brief Check if processor can handle given data
     * @param data Environmental data to check
     * @return true if processor can handle data, false otherwise
     */
    virtual bool canProcess(const EnvironmentalData &data) const = 0;

    /**
     * @brief Get processor's resource requirements
     * @return Map of resource names to required amounts
     */
    virtual std::unordered_map<std::string, float>
    getResourceRequirements() const = 0;

    /**
     * @brief Get processor's name/identifier
     * @return Unique identifier for this processor
     */
    virtual std::string getProcessorName() const = 0;

    /**
     * @brief Configure processor with custom parameters
     * @param config Configuration parameters
     * @return true if configuration successful, false otherwise
     */
    virtual bool
    configure(const std::unordered_map<std::string, std::string> &config) = 0;

    /**
     * @brief Check if processor is in valid state
     * @return true if processor is valid, false otherwise
     */
    virtual bool isValid() const = 0;

  protected:
    /**
     * @brief Log processor activity (to be implemented by concrete classes)
     * @param message Message to log
     * @param level Log level
     */
    virtual void
    logProcessorActivity(const std::string &message,
                         const std::string &level = "INFO") const = 0;
};

} // namespace crescent::environment

#endif // CREATURE_ENGINE_ENVIRONMENT_INTERFACES_I_ENVIRONMENT_PROCESSOR_H
