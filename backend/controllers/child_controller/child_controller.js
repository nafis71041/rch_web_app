const { eligible_couple } = require("../../models/ec_models/eligible_couple");
const { pregnant_women } = require("../../models/pw_models/pregnant_women");
const { infant } = require("../../models/pw_models/infant");
const ApiError = require("../../utils/apiError");

/**
 * @route   GET /api/child/by-id/:infantId
 * @desc    Fetch a single infant (child) by Infant ID
 * @access  Protected (Token required)
 */
const getChildByChildId = async (req, res, next) => {
  const { infantId } = req.params;

  try {
    if (!infantId) {
      throw new ApiError(400, "Infant ID is required.");
    }

    // 1. Fetch infant record
    const infantRecord = await infant.findOne({
      where: { infant_id: infantId },
      attributes: [
        "infant_id",
        "pregnant_woman_id",
        "sex",
        "weight_at_birth",
        "head_circumference",
        "cried_after_birth",
        "yellow_milk_given",
        "yellow_milk_not_given_reason",
        "opv_0",
        "bcg_0",
        "hepb_0",
        "created_at",
      ],
    });

    if (!infantRecord) {
      throw new ApiError(404, "Infant not found.");
    }

    // 2. Get the pregnant woman linked to this infant
    const pwRecord = await pregnant_women.findOne({
      where: { pregnant_woman_id: infantRecord.pregnant_woman_id },
      attributes: ["pregnant_woman_id", "mother_id"],
    });

    if (!pwRecord) {
      throw new ApiError(404, "Linked pregnant woman not found.");
    }

    // 3. Get mother details from eligible couple
    const mother = await eligible_couple.findOne({
      where: { mother_id: pwRecord.mother_id },
      attributes: ["mother_id", "mother_name", "father_name"],
    });

    if (!mother) {
      throw new ApiError(404, "Linked mother not found in Eligible Couple list.");
    }

    // 4. Return final structured response
    return res.status(200).json({
      infant_id: infantRecord.infant_id,
      pregnant_woman_id: infantRecord.pregnant_woman_id,
      mother_id: mother.mother_id,
      mother_name: mother.mother_name,
      father_name: mother.father_name,
      sex: infantRecord.sex,
      weight_at_birth: infantRecord.weight_at_birth,
      head_circumference: infantRecord.head_circumference,
      cried_after_birth: !!infantRecord.cried_after_birth,
      yellow_milk_given: !!infantRecord.yellow_milk_given,
      yellow_milk_not_given_reason: infantRecord.yellow_milk_not_given_reason,
      opv_0: infantRecord.opv_0,
      bcg_0: infantRecord.bcg_0,
      hepb_0: infantRecord.hepb_0,
      created_at: infantRecord.created_at,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/child/by-mother/:motherId
 * @desc    Fetch all infants (children) linked to a given mother
 * @access  Protected (Token required)
 */
const getChildrenByMotherId = async (req, res, next) => {
  const { motherId } = req.params;

  try {
    if (!motherId) {
      throw new ApiError(400, "Mother ID is required.");
    }

    // 1. Validate mother existence
    const mother = await eligible_couple.findOne({
      where: { mother_id: motherId },
      attributes: ["mother_id", "mother_name", "father_name"],
    });

    if (!mother) {
      throw new ApiError(404, "Mother not found in Eligible Couple list.");
    }

    // 2. Get all pregnancies for this mother
    const pregnancies = await pregnant_women.findAll({
      where: { mother_id: motherId },
      attributes: ["pregnant_woman_id"],
    });

    if (!pregnancies || pregnancies.length === 0) {
      return res.status(200).json({
        mother_id: motherId,
        mother_name: mother.mother_name,
        infants: [],
      });
    }

    const pregnantWomanIds = pregnancies.map((p) => p.pregnant_woman_id);

    // 3. Get all infants belonging to these pregnancies
    const infantsList = await infant.findAll({
      where: { pregnant_woman_id: pregnantWomanIds },
      attributes: [
        "infant_id",
        "pregnant_woman_id",
        "sex",
        "weight_at_birth",
        "head_circumference",
        "cried_after_birth",
        "yellow_milk_given",
        "yellow_milk_not_given_reason",
        "opv_0",
        "bcg_0",
        "hepb_0",
        "created_at",
      ],
      order: [["created_at", "DESC"]],
    });

    // 4. Return empty if no infants
    if (!infantsList || infantsList.length === 0) {
      return res.status(200).json({
        mother_id: motherId,
        mother_name: mother.mother_name,
        infants: [],
      });
    }

    // 5. Return all infant records
    return res.status(200).json({
      mother_id: motherId,
      mother_name: mother.mother_name,
      father_name: mother.father_name,
      infants: infantsList,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getChildByChildId,
  getChildrenByMotherId,
};
