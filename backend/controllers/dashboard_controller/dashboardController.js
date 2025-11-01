const ApiError = require('../../utils/apiError');

const { users, supervisor, health_worker, village, asha } = require('../../models/user_models');
const { eligible_couple } = require('../../models/ec_models/eligible_couple');
const { pregnant_women } = require('../../models/pw_models/pregnant_women');
const { child } = require('../../models/child_models/child');
const { getAccessibleAshaIds } = require('../../utils/getAccessibleAshaIds');

// -----------------------------
// GET /api/dashboard/user-info
// -----------------------------
async function getUserInfo(req, res, next) {
    try {
        const { username, role } = req.user;

        // find user by username (login identifier)
        const baseUser = await users.findOne({ where: { username } });
        if (!baseUser) throw new ApiError(404, 'user not found');

        let userDetails = null;
        let villageList = [];

        if (role === 'admin') {
            const villages = await village.findAll({ attributes: ['village_name'] });
            villageList = villages.map(v => v.village_name);
            userDetails = { name: baseUser.username, phone_no: 'N/A' };
        }

        else if (role === 'supervisor') {
            // supervisor.email == users.username
            userDetails = await supervisor.findOne({ where: { email: username } });
            if (!userDetails) throw new ApiError(404, 'supervisor details not found');

            const healthWorkers = await health_worker.findAll({
                where: { supervisor_id: userDetails.supervisor_id },
                attributes: ['health_worker_id']
            });

            const villages = await village.findAll({
                where: { health_worker_id: healthWorkers.map(hw => hw.health_worker_id) },
                attributes: ['village_name']
            });

            villageList = villages.map(v => v.village_name);
        }

        else if (role === 'health_worker') {
            // health_worker.email == users.username
            userDetails = await health_worker.findOne({ where: { email: username } });
            if (!userDetails) throw new ApiError(404, 'health worker details not found');

            const villages = await village.findAll({
                where: { health_worker_id: userDetails.health_worker_id },
                attributes: ['village_name']
            });

            villageList = villages.map(v => v.village_name);
        }

        else if (role === 'asha') {
            // asha.email == users.username
            userDetails = await asha.findOne({
                where: { email: username },
                include: [{ model: village, attributes: ['village_name'] }]
            });
            if (!userDetails) throw new ApiError(404, 'asha details not found');
            villageList = userDetails.village ? [userDetails.village.village_name] : [];
        }

        return res.status(200).json({
            user: {
                user_name: userDetails.name,
                user_role: role,
                phone_number: userDetails.phone_no,
                village_list: villageList
            }
        });
    } catch (err) {
        next(err);
    }
}

// -----------------------------
// GET /api/dashboard/summary
// -----------------------------
async function getSummary(req, res, next) {
    try {
        const { username, role } = req.user;

        // use username (which equals email in linked tables)
        const ashaIds = await getAccessibleAshaIds(role, username);
        if (!ashaIds.length) {
            return res.status(200).json({
                summary: {
                    total_pregnant_women: 0,
                    total_eligible_couples: 0,
                    total_children: 0
                }
            });
        }

        const totalEligibleCouples = await eligible_couple.count({
            where: { asha_id: ashaIds }
        });

        const totalPregnantWomen = await pregnant_women.count({
            include: [{
                model: eligible_couple,
                where: { asha_id: ashaIds },
                attributes: []
            }]
        });

        const totalChildren = await child.count({
            include: [{
                model: eligible_couple,
                where: { asha_id: ashaIds },
                attributes: []
            }]
        });

        return res.status(200).json({
            summary: {
                total_pregnant_women: totalPregnantWomen,
                total_eligible_couples: totalEligibleCouples,
                total_children: totalChildren
            }
        });
    } catch (err) {
        next(err);
    }
}

module.exports = { getUserInfo, getSummary };
