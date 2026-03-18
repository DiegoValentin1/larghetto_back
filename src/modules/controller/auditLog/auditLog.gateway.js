const { query } = require('../../../utils/mysql');

/**
 * Obtiene logs de auditoría paginados con filtros opcionales.
 * Aplica filtro de campus automáticamente si se proporciona.
 */
const getAuditLogs = async ({ page = 1, limit = 50, dateFrom, dateTo, entityType, actionType, campus, userId } = {}) => {
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const conditions = [];
    const params = [];

    if (dateFrom) { conditions.push('created_at >= ?'); params.push(dateFrom); }
    if (dateTo)   { conditions.push('created_at <= ?'); params.push(dateTo + ' 23:59:59'); }
    if (entityType) { conditions.push('entity_type = ?'); params.push(entityType); }
    if (actionType) { conditions.push('action_type = ?'); params.push(actionType); }
    if (campus)     { conditions.push('campus = ?'); params.push(campus); }
    if (userId)     { conditions.push('user_id = ?'); params.push(userId); }

    const where = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    const [countResult, data] = await Promise.all([
        query(`SELECT COUNT(*) as total FROM audit_log ${where}`, params),
        query(`SELECT * FROM audit_log ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`, [...params, parseInt(limit), offset])
    ]);

    return {
        data,
        total: countResult[0].total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(countResult[0].total / parseInt(limit))
    };
};

/**
 * Obtiene el timeline de una entidad (todos sus cambios, más reciente primero).
 */
const getEntityTimeline = async ({ entityType, entityId }) => {
    return await query(
        `SELECT * FROM audit_log WHERE entity_type = ? AND entity_id = ? ORDER BY created_at DESC`,
        [entityType, parseInt(entityId)]
    );
};

module.exports = { getAuditLogs, getEntityTimeline };
