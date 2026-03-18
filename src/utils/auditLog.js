const { query } = require('./mysql');

/**
 * Registra una acción de auditoría en audit_log.
 * NO lanza excepción si falla — loggea el error pero no bloquea la operación de negocio.
 *
 * @param {Object} params
 * @param {string} params.entityType  - 'ALUMNO'|'MAESTRO'|'PERSONAL'|'SOLICITUD_BAJA'|'ASISTENCIA'|'REPOSICION'
 * @param {number} params.entityId    - ID de la entidad afectada
 * @param {string} params.actionType  - 'CREATE'|'UPDATE'|'DELETE'|'STATUS_CHANGE'|'BAJA_SOLICITADA'|'BAJA_APROBADA'|'BAJA_RECHAZADA'|'ASISTENCIA'|'ARCHIVE'
 * @param {number} params.userId      - ID del usuario ejecutor
 * @param {string} params.userName    - Nombre del usuario ejecutor
 * @param {string} params.userRole    - 'SUPER'|'ENCARGADO'|'RECEPCION'
 * @param {string} [params.campus]    - Campus del usuario
 * @param {string} params.summary     - Texto legible: "Juan actualizó alumno Carlos"
 * @param {Object|null} [params.oldValue] - Estado anterior (null para CREATE)
 * @param {Object|null} [params.newValue] - Estado nuevo (null para DELETE)
 * @param {string} [params.ip]        - IP del cliente (opcional)
 */
const register = async ({
    entityType,
    entityId,
    entityName = null,
    actionType,
    userId,
    userName,
    userRole,
    campus,
    summary,
    oldValue = null,
    newValue = null,
    ip = null
}) => {
    try {
        const sql = `INSERT INTO audit_log
            (entity_type, entity_id, entity_name, action_type, user_id, user_name, user_role, campus, summary, old_value, new_value, ip_address)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        await query(sql, [
            entityType,
            entityId,
            entityName || null,
            actionType,
            userId,
            userName,
            userRole,
            campus || null,
            summary,
            oldValue !== null ? JSON.stringify(oldValue) : null,
            newValue !== null ? JSON.stringify(newValue) : null,
            ip || null
        ]);
    } catch (error) {
        console.error('[auditLog] Error al registrar log de auditoría:', error.message);
        // NO re-lanzar — el log nunca debe bloquear la operación de negocio
    }
};

module.exports = { register };
