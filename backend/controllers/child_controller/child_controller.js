const { eligible_couple } = require("../../models/ec_models/eligible_couple");
const { pregnant_women } = require("../../models/pw_models/pregnant_women");
const { infant } = require("../../models/pw_models/infant");
const { immunization } = require("../../models/child_models/immunization");
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

// =========================
// GET all immunizations for a child
// =========================
const getImmunizationsByChildId = async (req, res, next) => {
  const { childId } = req.params;

  try {
    if (!childId) throw new ApiError(400, "Child ID is required.");

    const child = await infant.findByPk(childId);
    if (!child) throw new ApiError(404, "Child not found in infant table.");

    const records = await immunization.findAll({
      where: { infant_id: childId },
      order: [["scheduled_date", "ASC"]],
      attributes: [
        "immunization_id",
        "infant_id",
        "vaccine_name",
        "scheduled_date",
        "actual_date_given",
        "remarks",
        "created_at",
        "updated_at",
      ],
    });

    return res.status(200).json({
      immunizations: records || [],
    });
  } catch (err) {
    next(err);
  }
};

// =========================
// UPDATE or UPSERT immunizations for a child
// =========================
const updateImmunizationsByChildId = async (req, res, next) => {
  const { childId } = req.params;
  const { immunizations } = req.body;

  try {
    if (!childId) throw new ApiError(400, "Child ID is required.");
    if (!immunizations || !Array.isArray(immunizations))
      throw new ApiError(400, "Invalid immunization data format.");

    // Define simple vaccine dependency rules
    // For example, DPT_2 depends on DPT_1, etc.
    const vaccineDependencies = {
      DPT_2: "DPT_1",
      DPT_3: "DPT_2",
      DPT_Booster: "DPT_3",
      HepB_1: "HepB_0",
      HepB_2: "HepB_1",
      HepB_3: "HepB_2",
      Measles_2: "Measles_1",
      OPV_1: "OPV_0",
      OPV_2: "OPV_1",
      OPV_3: "OPV_2",
      OPV_Booster: "OPV_3",
      Vitamin_A_2: "Vitamin_A_1",
      Vitamin_A_3: "Vitamin_A_2",
      Vitamin_A_4: "Vitamin_A_3",
      Vitamin_A_5: "Vitamin_A_4",
      Vitamin_A_6: "Vitamin_A_5",
      Vitamin_A_7: "Vitamin_A_6",
      Vitamin_A_8: "Vitamin_A_7",
      Vitamin_A_9: "Vitamin_A_8",
    };

    // Sort immunizations by defined vaccine order
    const vaccineOrder = [
      "BCG",
      "DPT_1", "DPT_2", "DPT_3", "DPT_Booster",
      "HepB_0", "HepB_1", "HepB_2", "HepB_3",
      "Measles_1", "Measles_2",
      "OPV_0", "OPV_1", "OPV_2", "OPV_3", "OPV_Booster",
      "Vitamin_A_1", "Vitamin_A_2", "Vitamin_A_3",
      "Vitamin_A_4", "Vitamin_A_5", "Vitamin_A_6",
      "Vitamin_A_7", "Vitamin_A_8", "Vitamin_A_9",
    ];

    immunizations.sort((a, b) => {
      return vaccineOrder.indexOf(a.vaccine_name) - vaccineOrder.indexOf(b.vaccine_name);
    });

    const failed = [];
    const updated = [];

    for (const record of immunizations) {
      const { vaccine_name, scheduled_date, actual_date_given, remarks } = record;

      // Skip if essential info missing
      if (!vaccine_name || !vaccineOrder.includes(vaccine_name) || !scheduled_date) {
        failed.push({ vaccine_name, reason: "Missing or wrong vaccine_name or scheduled_date" });
        continue;
      }
      
      // Check dependency rule
      const dependency = vaccineDependencies[vaccine_name];
      if (dependency) {
        const depRecord = await immunization.findOne({
          where: { infant_id: childId, vaccine_name: dependency },
        });

        // Dependency not found or not scheduled/completed
        if (!depRecord || !depRecord.actual_date_given) {
          failed.push({
            vaccine_name,
            reason: `Dependent vaccine '${dependency}' not yet completed.`,
          });
          continue;
        }
      }

      try {
        const existing = await immunization.findOne({
          where: { infant_id: childId, vaccine_name },
        });

        const updateData = {
          scheduled_date,
          actual_date_given: actual_date_given || null,
          remarks: remarks || null,
        };

        if (existing) {
          // If both scheduled_date and actual_date_given already exist, skip update
          if (existing.scheduled_date && existing.actual_date_given) {
            failed.push({
              vaccine_name,
              reason: "Vaccine already completed. Updates not allowed.",
            });
            continue;
          }

          if (existing.scheduled_date ===  updateData.scheduled_date) {
            failed.push({
              vaccine_name,
              reason: "No update at all",
            });
            continue;
          }

          // Allow update if only scheduled_date is present (no actual date yet)
          await existing.update(updateData);
        } else {
          // Create new record if it doesn't exist
          await immunization.create({
            infant_id: childId,
            vaccine_name,
            ...updateData,
          });
        }

        updated.push(vaccine_name);
      } catch (err) {
        failed.push({ vaccine_name, reason: err.message });
      }
    }

    return res.status(200).json({
      message: "Immunization update process completed.",
      summary: {
        updatedCount: updated.length,
        failedCount: failed.length,
      },
      updated,
      failed,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getChildByChildId,
  getChildrenByMotherId,
  getImmunizationsByChildId,
  updateImmunizationsByChildId,
};
