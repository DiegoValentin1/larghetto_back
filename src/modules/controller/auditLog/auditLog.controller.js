const { Router } = require('express');
const { checkRoles } = require('../../../config/jwt');
const { getAuditLogs, getEntityTimeline } = require('./auditLog.gateway');

const auditLogRouter = Router();

/**
 * GET /api/audit-log
 * Query params: page, limit, dateFrom, dateTo, entityType, actionType, campus, userId
 * SUPER: ve todos los campus. ENCARGADO: filtrado por su campus automáticamente.
 */
auditLogRouter.get('/', checkRoles(['SUPER', 'ENCARGADO']), async (req, res) => {
    try {
        const { page, limit, dateFrom, dateTo, entityType, actionType, userId } = req.query;

        // ENCARGADO solo ve su campus
        const campus = req.token.role === 'ENCARGADO'
            ? req.token.campus
            : req.query.campus;

        const result = await getAuditLogs({ page, limit, dateFrom, dateTo, entityType, actionType, campus, userId });
        res.status(200).json(result);
    } catch (error) {
        console.error('[auditLog] Error en GET /audit-log:', error);
        res.status(500).json({ message: 'Error al obtener logs de auditoría' });
    }
});

/**
 * GET /api/audit-log/entity/:entityType/:entityId
 * Timeline de todos los cambios de una entidad específica.
 */
auditLogRouter.get('/entity/:entityType/:entityId', checkRoles(['SUPER', 'ENCARGADO']), async (req, res) => {
    try {
        const { entityType, entityId } = req.params;
        const timeline = await getEntityTimeline({ entityType, entityId });
        res.status(200).json(timeline);
    } catch (error) {
        console.error('[auditLog] Error en GET /audit-log/entity:', error);
        res.status(500).json({ message: 'Error al obtener timeline de la entidad' });
    }
});

module.exports = { auditLogRouter };
