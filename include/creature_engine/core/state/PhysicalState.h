#ifndef CREATURE_ENGINE_CORE_STATE_PHYSICAL_STATE_H
#define CREATURE_ENGINE_CORE_STATE_PHYSICAL_STATE_H

#include "creature_engine/core/base/CreatureEnums.h"
#include "creature_engine/core/changes/ChangeTypes.h"
#include <nlohmann/json.hpp>
#include <string>
#include <unordered_map>
#include <unordered_set>
#include <vector>

namespace crescent {

class PhysicalState {
  public:
    // Construction
    PhysicalState() = default;
    ~PhysicalState() = default;

    // Core physical properties
    Size getSize() const { return size_; }
    void setSize(Size size) { size_ = size; }

    BodyShape getShape() const { return shape_; }
    void setShape(BodyShape shape) { shape_ = shape; }

    // Locomotion management
    Locomotion getPrimaryLocomotion() const { return primaryLocomotion_; }
    void setPrimaryLocomotion(Locomotion locomotion) {
        primaryLocomotion_ = locomotion;
    }

    const std::vector<Locomotion> &getSecondaryLocomotion() const {
        return secondaryLocomotion_;
    }
    bool addSecondaryLocomotion(Locomotion locomotion);
    bool removeSecondaryLocomotion(Locomotion locomotion);

    // Base feature management
    const std::unordered_set<std::string> &getBaseFeatures() const {
        return baseFeatures_;
    }
    bool addBaseFeature(const std::string &feature);
    bool removeBaseFeature(const std::string &feature);
    bool hasBaseFeature(const std::string &feature) const;

    // Change application
    bool canApplyChange(const PhysicalChange &change) const;
    bool applyChange(const PhysicalChange &change);
    std::optional<PhysicalChange>
    generateUndo(const PhysicalChange &change) const;

    // Validation
    bool isValid() const;
    std::vector<std::string> validate() const;

    // Serialization
    nlohmann::json serializeToJson() const;
    static PhysicalState deserializeFromJson(const nlohmann::json &json);

  private:
    // Core attributes
    Size size_ = Size::Medium;
    BodyShape shape_ = BodyShape::Humanoid;
    Locomotion primaryLocomotion_ = Locomotion::Walker;
    std::vector<Locomotion> secondaryLocomotion_;

    // Base features (before environmental/other modifications)
    std::unordered_set<std::string> baseFeatures_;

    // Basic validation
    bool validateBasics() const;
    bool validateLocomotion() const;
    bool validateFeatures() const;
};

} // namespace crescent

#endif // CREATURE_ENGINE_CORE_STATE_PHYSICAL_STATE_H