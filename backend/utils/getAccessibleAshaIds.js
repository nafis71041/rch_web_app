const { ApiError } = require('./apiError');
const { health_worker, village, asha, supervisor } = require('../models/user_models');

async function getAccessibleAshaIds(role, email) {
    if (role === 'asha') {
        const ashaUser = await asha.findOne({
            where: { email },
            attributes: ['asha_id']
        });
        return ashaUser ? [ashaUser.asha_id] : [];
    }

    if (role === 'health_worker') {
        const hw = await health_worker.findOne({
            where: { email },
            attributes: ['health_worker_id']
        });
        if (!hw) return [];

        const villages = await village.findAll({
            where: { health_worker_id: hw.health_worker_id },
            attributes: ['village_id']
        });
        if (!villages.length) return [];

        const ashas = await asha.findAll({
            where: { village_id: villages.map(v => v.village_id) },
            attributes: ['asha_id']
        });
        return ashas.map(a => a.asha_id);
    }

    if (role === 'supervisor') {
        const sup = await supervisor.findOne({
            where: { email },
            attributes: ['supervisor_id']
        });
        if (!sup) return [];

        const healthWorkers = await health_worker.findAll({
            where: { supervisor_id: sup.supervisor_id },
            attributes: ['health_worker_id']
        });
        if (!healthWorkers.length) return [];

        const villages = await village.findAll({
            where: { health_worker_id: healthWorkers.map(hw => hw.health_worker_id) },
            attributes: ['village_id']
        });
        if (!villages.length) return [];

        const ashas = await asha.findAll({
            where: { village_id: villages.map(v => v.village_id) },
            attributes: ['asha_id']
        });
        return ashas.map(a => a.asha_id);
    }

    if (role === 'admin') {
        const ashas = await asha.findAll({ attributes: ['asha_id'] });
        return ashas.map(a => a.asha_id);
    }

    throw new ApiError(403, 'invalid role or unauthorized access');
}

module.exports = { getAccessibleAshaIds };
