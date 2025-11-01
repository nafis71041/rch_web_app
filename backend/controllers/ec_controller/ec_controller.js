const { getAccessibleAshaIds } = require('../../utils/getAccessibleAshaIds');
const { asha, village } = require('../../models/user_models');
const { eligible_couple } = require('../../models/ec_models/eligible_couple');
const { ec_visit } = require('../../models/ec_models/ec_visit');
const ApiError = require('../../utils/apiError');

async function registerEC(req, res, next) {
    try {
        const { role, username: email } = req.user; // from auth middleware
        if (!role || !email) {
            throw new ApiError(401, 'Unauthorized');
        }

        // Extract form data
        const {
            mother_name,
            father_name,
            phone_no,
            aadhaar_id,
            account_number,
            bank_name,
            branch_name,
            ifsc_code,
            occupation_mother,
            occupation_father,
            dob_mother,
            dob_father,
            date_of_registration,
            village,
            asha_id,
        } = req.body;

        // Basic validation
        if (!mother_name || !father_name || !phone_no || !dob_mother || !dob_father || !village || !asha_id) {
            throw new ApiError(400, 'Missing required fields');
        }

        // Optional: verify user has access to this ASHA
        const accessibleAshaIds = await getAccessibleAshaIds(role, email);
        if (!accessibleAshaIds.includes(parseInt(asha_id))) {
            throw new ApiError(403, 'You are not authorized to register for this ASHA');
        }

        // Create EC entry
        const newEC = await eligible_couple.create({
            mother_name,
            father_name,
            phone_no,
            aadhaar_id,
            account_number,
            bank_name,
            branch_name,
            ifsc_code,
            occupation_mother,
            occupation_father,
            dob_mother,
            dob_father,
            date_of_registration,
            asha_id,
        });

        // Return mother_id or any unique ID to frontend
        res.status(201).json({
            message: 'EC registered successfully',
            mother_id: newEC.mother_id,
        });
    } catch (err) {
        next(err);
    }
}

async function getECVillages(req, res, next) {
    try {
        const { role, username: email } = req.user; // from auth middleware

        if (!role || !email) {
            throw new ApiError(401, 'Unauthorized');
        }

        // 1️⃣ Get accessible ASHA IDs for the user
        const ashaIds = await getAccessibleAshaIds(role, email);
        if (!ashaIds.length) {
            return res.json([]);
        }

        // 2️⃣ Get the corresponding village IDs
        const ashaRecords = await asha.findAll({
            where: { asha_id: ashaIds },
            attributes: ['village_id'],
        });

        const villageIds = [...new Set(ashaRecords.map(a => a.village_id))];
        if (!villageIds.length) {
            return res.json([]);
        }

        // 3️⃣ Fetch villages
        const villages = await village.findAll({
            where: { village_id: villageIds },
            attributes: ['village_id', 'village_name'],
            order: [['village_name', 'ASC']],
        });

        // 4️⃣ Send response
        res.json(villages);
    } catch (err) {
        next(err);
    }
}

async function getAshaByVillage(req, res, next) {
    try {
        const { village_id } = req.params;

        if (!village_id) {
            throw new ApiError(400, 'Village name is required');
        }

        // 1️⃣ Find the village by name
        const foundVillage = await village.findOne({
            where: { village_id: village_id },
            attributes: ['village_id'],
        });

        if (!foundVillage) {
            throw new ApiError(404, `Village "${village_id}" not found`);
        }

        // 2️⃣ Get all ASHAs belonging to that village
        const ashas = await asha.findAll({
            where: { village_id: foundVillage.village_id },
            attributes: ['asha_id', 'name'],
            order: [['name', 'ASC']],
        });

        // 3️⃣ Return the ASHAs
        res.json(ashas);
    } catch (err) {
        next(err);
    }
}

async function getLastVisit(req, res, next) {
    try {
        const { mother_id } = req.params;

        if (!mother_id) {
            throw new ApiError(400, 'Mother ID is required');
        }

        // Find the most recent visit for the mother
        const lastVisit = await ec_visit.findOne({
            where: { mother_id },
            order: [['visit_date', 'DESC']],
            attributes: [
                'visit_date',
                'family_planning_method',
                'method_used',
                'period_missed',
                'pregnancy'
            ]
        });

        if (!lastVisit) {
            return res.status(200).json(null); // no visits yet
        }

        res.status(200).json(lastVisit);
    } catch (err) {
        next(err);
    }
}

async function registerECVisit(req, res, next) {
  try {
    const { mother_id } = req.params;
    const {
      visit_date,
      family_planning_method,
      method_used,
      period_missed,
      pregnancy,
    } = req.body;

    // Validate required fields
    if (
      !visit_date ||
      typeof family_planning_method === 'undefined' ||
      typeof period_missed === 'undefined' ||
      typeof pregnancy === 'undefined'
    ) {
      throw new ApiError(400, 'Missing required visit fields.');
    }

    // Validate mother_id exists
    const mother = await eligible_couple.findByPk(mother_id);
    if (!mother) {
      throw new ApiError(404, 'Mother record not found.');
    }

    // Validation: method_used required only if family_planning_method = true
    if (family_planning_method && !method_used) {
      throw new ApiError(400, 'Method used is required when family planning method is Yes.');
    }

    // Create new visit record
    const newVisit = await ec_visit.create({
      mother_id,
      visit_date,
      family_planning_method,
      method_used: family_planning_method ? method_used : null,
      period_missed,
      pregnancy,
    });

    // Response
    res.status(201).json({
      message: 'EC visit recorded successfully.',
      visit_id: newVisit.visit_id,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getECVillages,
  getAshaByVillage,
  registerEC,
  registerECVisit,
  getLastVisit,
};
