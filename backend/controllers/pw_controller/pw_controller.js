const { pregnant_women } = require('../../models/pw_models/pregnant_women');
const { delivery } = require('../../models/pw_models/delivery');
const { infant } = require('../../models/pw_models/infant');
const { immunization } = require('../../models/child_models/immunization');
const { eligible_couple } = require('../../models/ec_models/eligible_couple');
const ApiError = require('../../utils/apiError');

/**
 * @route   GET /api/pw/pregnancies/:motherId
 * @desc    Fetch all pregnancies (active + closed) for a given mother
 * @access  Protected (Token required)
 */
const getPregnanciesByMotherId = async (req, res, next) => {
  const { motherId } = req.params;

  try {
    if (!motherId) {
      throw new ApiError(400, 'Mother ID is required.');
    }

    // 1. Check if mother exists
    const mother = await eligible_couple.findOne({
      where: { mother_id: motherId },
      attributes: ['mother_id', 'mother_name'],
    });

    if (!mother) {
      throw new ApiError(404, 'Mother not found in Eligible Couple list.');
    }

    // 2. Fetch all pregnancies for this mother
    const pregnancies = await pregnant_women.findAll({
      where: { mother_id: motherId },
      attributes: [
        'pregnant_woman_id',
        'mother_id',
        'lmp_date',
        'edd_date',
        'created_at',
      ],
      order: [['created_at', 'DESC']],
    });

    if (!pregnancies || pregnancies.length === 0) {
      return res.status(200).json({
        mother_id: motherId,
        pregnancies: [],
      });
    }

    // 3. Check infant table (not delivery) to determine active/closed
    const results = await Promise.all(
      pregnancies.map(async (p) => {
        const infantRecord = await infant.findOne({
          where: { pregnant_woman_id: p.pregnant_woman_id },
          attributes: ['infant_id'],
        });

        return {
          pregnancy_id: p.pregnant_woman_id,
          is_active: !infantRecord, // now depends on infant existence
          lmp_date: p.lmp_date,
          edd_date: p.edd_date,
          created_at: p.created_at,
        };
      })
    );

    // 4. Send response
    return res.status(200).json({
      mother_id: motherId,
      pregnancies: results,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/pw/pregnancy/:pregnancyId
 * @desc    Fetch detailed pregnancy record by pregnancy ID
 * @access  Protected (Token required)
 */
const getPregnancyById = async (req, res, next) => {
  const { pregnancyId } = req.params;

  try {
    if (!pregnancyId) {
      throw new ApiError(400, "Pregnancy ID is required.");
    }

    // 1️⃣ Check if pregnancy exists
    const pwRecord = await pregnant_women.findOne({
      where: { pregnant_woman_id: pregnancyId },
      attributes: [
        "pregnant_woman_id",
        "mother_id",
        "lmp_date",
        "edd_date",
        "weight",
        "height",
        "blood_group",
        "expected_delivery_place",
        "past_illnesses",
        "total_no_of_pregnancies",
        "expected_delivery_place",
        "created_at",
      ],
    });

    if (!pwRecord) {
      throw new ApiError(404, "Pregnancy record not found.");
    }

    // 2️⃣ Check delivery table for completion
    const deliveryRecord = await delivery.findOne({
      where: { pregnant_woman_id: pregnancyId },
      attributes: [
        "delivery_id",
        "place_of_delivery",
        "location_of_delivery",
        "delivery_complication",
        "delivery_complication_details",
        "number_of_children_born",
        "live_birth_count",
        "still_birth_count",
        "created_at",
        "updated_at"

      ],
    });

    // 3️⃣ (Optional) Check infant table if exists
    let infantRecords = [];
    if (deliveryRecord) {
      const { infant } = require("../../models/pw_models/infant");
      infantRecords = await infant.findAll({
        where: { pregnant_woman_id: pregnancyId },
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
          "updated_at"

        ],
      });
    }

    // 4️⃣ Compute section completion states
    const registrationCompleted = !!pwRecord;
    const deliveryCompleted = !!deliveryRecord;
    const infantCompleted = infantRecords && infantRecords.length > 0;

    // 5️⃣ Determine if pregnancy is active (based on infant existence)
    const isActive = infantRecords.length === 0;

    // 6️⃣ Send response
    return res.status(200).json({
      pregnancy_id: pwRecord.pregnant_woman_id,
      mother_id: pwRecord.mother_id,
      is_active: isActive,
      registration_completed: registrationCompleted,
      delivery_completed: deliveryCompleted,
      infant_completed: infantCompleted,
      lmp_date: pwRecord.lmp_date,
      edd_date: pwRecord.edd_date,
      registration_data: pwRecord,
      delivery_data: deliveryRecord || null,
      infant_data: infantRecords || [],
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   POST /api/pw/registration
 * @desc    Register a new pregnancy for an eligible couple
 * @access  Protected (Token required)
 */
const registerPregnancy = async (req, res, next) => {
  const {
    mother_id,
    weight,
    height,
    lmp_date,
    edd_date,
    blood_group,
    total_no_of_pregnancies,
    expected_delivery_place,
  } = req.body;

  try {
    // 1️⃣ Validate mandatory fields
    if (
      !mother_id ||
      !weight ||
      !height ||
      !lmp_date ||
      !edd_date ||
      !blood_group ||
      !total_no_of_pregnancies ||
      !expected_delivery_place
    ) {
      throw new ApiError(400, "All required fields must be provided.");
    }

    // 2️⃣ Verify mother exists in eligible_couple table
    const motherExists = await eligible_couple.findOne({
      where: { mother_id },
      attributes: ["mother_id"],
    });

    if (!motherExists) {
      throw new ApiError(404, "Mother not found in eligible_couple table.");
    }

    // 3️⃣ Check if there is already an active pregnancy (no infant yet)
    const existingPregnancies = await pregnant_women.findAll({
      where: { mother_id },
      attributes: ["pregnant_woman_id"],
    });

    const { infant } = require("../../models/pw_models/infant");
    for (const p of existingPregnancies) {
      const infantRecord = await infant.findOne({
        where: { pregnant_woman_id: p.pregnant_woman_id },
      });
      if (!infantRecord) {
        throw new ApiError(400, "Active pregnancy already exists for this mother.");
      }
    }

    // 4️⃣ Create new pregnancy record
    const newPregnancy = await pregnant_women.create({
      mother_id,
      weight,
      height,
      lmp_date,
      edd_date,
      blood_group,
      total_no_of_pregnancies,
      expected_delivery_place,
    });

    // 5️⃣ Return newly created pregnancy details
    return res.status(201).json({
      message: "Pregnancy registration successful.",
      pregnant_woman_id: newPregnancy.pregnant_woman_id,
      registration_data: newPregnancy,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   POST /api/pw/delivery
 * @desc    Add delivery details for a pregnancy (only once)
 * @access  Protected (Token required)
 */
const addDeliveryDetails = async (req, res, next) => {
  const {
    pregnancy_id,
    place_of_delivery,
    location_of_delivery,
    delivery_complication,
    delivery_complication_details,
    number_of_children_born,
    live_birth_count,
    still_birth_count,
  } = req.body;

  try {
    // 1️⃣ Validate required fields
    if (
      !pregnancy_id ||
      !place_of_delivery ||
      !location_of_delivery ||
      typeof delivery_complication === "undefined" ||
      !number_of_children_born ||
      !live_birth_count ||
      !still_birth_count
    ) {
      throw new ApiError(400, "All required fields must be provided.");
    }

    // 2️⃣ Verify pregnancy exists
    const pregnancy = await pregnant_women.findOne({
      where: { pregnant_woman_id: pregnancy_id },
      attributes: ["pregnant_woman_id", "mother_id"],
    });

    if (!pregnancy) {
      throw new ApiError(404, "Pregnancy record not found.");
    }

    // 3️⃣ Check if a delivery record already exists for this pregnancy
    const existingDelivery = await delivery.findOne({
      where: { pregnant_woman_id: pregnancy_id },
    });

    if (existingDelivery) {
      throw new ApiError(400, "Delivery details already exist for this pregnancy.");
    }

    // 4️⃣ Create new delivery record
    const newDelivery = await delivery.create({
      pregnant_woman_id: pregnancy_id,
      place_of_delivery,
      location_of_delivery,
      delivery_complication: delivery_complication === "yes" ? 1 : 0,
      delivery_complication_details:
        delivery_complication === "yes"
          ? delivery_complication_details || null
          : null,
      number_of_children_born,
      live_birth_count,
      still_birth_count,
    });

    // 5️⃣ Return success response
    return res.status(201).json({
      message: "Delivery details saved successfully.",
      delivery_id: newDelivery.delivery_id,
      delivery_data: newDelivery,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   POST /api/pw/infant
 * @desc    Add infant details (only once per pregnancy)
 * @access  Protected (Token required)
 */
const addInfantDetails = async (req, res, next) => {
  const {
    pregnant_woman_id,
    sex,
    weight_at_birth,
    head_circumference,
    cried_after_birth,
    yellow_milk_given,
    yellow_milk_not_given_reason,
    opv_0,
    bcg_0,
    hepb_0,
  } = req.body;

  try {
    // 1️⃣ Validate mandatory fields
    if (
      !pregnant_woman_id ||
      !sex ||
      !weight_at_birth ||
      !head_circumference ||
      typeof cried_after_birth === "undefined" ||
      typeof yellow_milk_given === "undefined" ||
      !opv_0 ||
      !bcg_0 ||
      !hepb_0
    ) {
      throw new ApiError(400, "All required fields must be provided.");
    }

    // 2️⃣ Check pregnancy exists
    const pregnancy = await pregnant_women.findOne({
      where: { pregnant_woman_id },
      attributes: ["pregnant_woman_id", "mother_id"],
    });

    if (!pregnancy) {
      throw new ApiError(404, "Pregnancy record not found.");
    }

    // 3️⃣ Ensure delivery record exists (infant cannot exist before delivery)
    const deliveryRecord = await delivery.findOne({
      where: { pregnant_woman_id },
    });

    if (!deliveryRecord) {
      throw new ApiError(400, "Cannot add infant details before delivery record.");
    }

    // 4️⃣ Ensure infant record does not already exist
    const existingInfant = await infant.findOne({
      where: { pregnant_woman_id },
    });

    if (existingInfant) {
      throw new ApiError(400, "Infant details already exist for this pregnancy.");
    }

    // 5️⃣ Insert new infant record
    const newInfant = await infant.create({
      pregnant_woman_id,
      sex,
      weight_at_birth,
      head_circumference,
      cried_after_birth: cried_after_birth ? 1 : 0,
      yellow_milk_given: yellow_milk_given ? 1 : 0,
      yellow_milk_not_given_reason:
        yellow_milk_given ? null : yellow_milk_not_given_reason || null,
      opv_0,
      bcg_0,
      hepb_0,
    });

    // 6️⃣ Create initial immunization records for OPV_0, BCG, HepB_0
    const vaccineData = [
      { vaccine_name: "OPV_0", date_given: opv_0 },
      { vaccine_name: "BCG", date_given: bcg_0 },
      { vaccine_name: "HepB_0", date_given: hepb_0 },
    ];

    for (const v of vaccineData) {
      if (v.date_given) {
        await immunization.create({
          infant_id: newInfant.infant_id,
          vaccine_name: v.vaccine_name,
          scheduled_date: v.date_given,
          actual_date_given: v.date_given,
          remarks: "Given at birth",
        });
      }
    }

    // 6️⃣ Success response
    return res.status(201).json({
      message: "Infant details saved successfully.",
      infant_id: newInfant.infant_id,
      infant_data: newInfant,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getPregnanciesByMotherId, getPregnancyById, registerPregnancy, addDeliveryDetails, addInfantDetails };