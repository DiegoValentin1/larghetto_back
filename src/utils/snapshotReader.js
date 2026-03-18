const { query } = require('./mysql');

/**
 * Lee el estado completo de un alumno ANTES de mutarlo.
 * Incluye clases y pagos actuales.
 * @param {number} userId - user_id del alumno (campo user_id en tabla alumno)
 */
const getAlumnoSnapshot = async (userId) => {
    try {
        const alumnoRows = await query(
            `SELECT alu.*, us.campus, us.email,
                    pe.name, pe.telefono, pe.domicilio, pe.municipio,
                    pe.fechaNacimiento, pe.contactoEmergencia, pe.observaciones
             FROM alumno alu
             JOIN users us ON us.id = alu.user_id
             JOIN personal pe ON pe.id = us.personal_id
             WHERE alu.user_id = ?`,
            [userId]
        );
        if (!alumnoRows || alumnoRows.length === 0) return null;

        const [clasesRows, pagosRows] = await Promise.all([
            query(
                `SELECT ac.id_instrumento, ac.id_maestro, ac.dia, ac.hora,
                        ins.instrumento, pe.name as maestro_nombre
                 FROM alumno_clases ac
                 LEFT JOIN instrumento ins ON ins.id = ac.id_instrumento
                 LEFT JOIN users um ON um.id = ac.id_maestro
                 LEFT JOIN personal pe ON pe.id = um.personal_id
                 WHERE ac.id_alumno = ?`,
                [userId]
            ),
            query(
                `SELECT tipo, fecha, monto_registrado FROM alumno_pagos WHERE alumno_id = ?`,
                [userId]
            )
        ]);

        return {
            ...alumnoRows[0],
            clases: clasesRows || [],
            pagos: pagosRows || []
        };
    } catch (error) {
        console.error('[snapshotReader] Error leyendo snapshot de alumno:', error.message);
        return null;
    }
};

/**
 * Lee el estado de un maestro.
 * @param {number} userId - user_id del maestro
 */
const getMaestroSnapshot = async (userId) => {
    try {
        const rows = await query(
            `SELECT pe.*, us.email, us.campus, us.status
             FROM personal pe
             JOIN users us ON us.personal_id = pe.id
             WHERE us.id = ? AND us.role = 'MAESTRO'`,
            [userId]
        );
        return rows && rows.length > 0 ? rows[0] : null;
    } catch (error) {
        console.error('[snapshotReader] Error leyendo snapshot de maestro:', error.message);
        return null;
    }
};

/**
 * Lee el estado de un personal (encargado/recepcionista).
 * @param {number} personalId - id en tabla personal
 */
const getPersonalSnapshot = async (personalId) => {
    try {
        const rows = await query(
            `SELECT pe.*, us.email, us.campus, us.role, us.status
             FROM personal pe
             JOIN users us ON us.personal_id = pe.id
             WHERE pe.id = ?`,
            [personalId]
        );
        return rows && rows.length > 0 ? rows[0] : null;
    } catch (error) {
        console.error('[snapshotReader] Error leyendo snapshot de personal:', error.message);
        return null;
    }
};

/**
 * Compara dos objetos y retorna solo los campos que cambiaron.
 * Ignora arrays complejos (clases, pagos) que se manejan aparte.
 * @returns {{ oldFields: Object|null, newFields: Object|null }}
 */
const getDiff = (oldObj, newObj) => {
    const IGNORE_KEYS = ['clases', 'pagos'];

    if (!oldObj) return { oldFields: null, newFields: newObj };
    if (!newObj) return { oldFields: oldObj, newFields: null };

    const oldFields = {};
    const newFields = {};

    const allKeys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)]);
    for (const key of allKeys) {
        if (IGNORE_KEYS.includes(key)) continue;
        const oldVal = oldObj[key] === undefined ? null : oldObj[key];
        const newVal = newObj[key] === undefined ? null : newObj[key];
        if (String(oldVal) !== String(newVal)) {
            oldFields[key] = oldVal;
            newFields[key] = newVal;
        }
    }

    return { oldFields, newFields };
};

/**
 * Whitelist de campos que el frontend puede modificar en un alumno.
 * Solo estos campos se comparan en el diff para evitar falsos positivos.
 */
const ALUMNO_WHITELIST = [
    'name', 'fechaNacimiento', 'domicilio', 'municipio', 'telefono',
    'contactoEmergencia', 'email', 'nivel', 'mensualidad', 'observaciones',
    'nombreMadre', 'nombrePadre', 'padreTelefono', 'madreTelefono',
    'inscripcion', 'promocion'
];

/**
 * Compara solo los campos de ALUMNO_WHITELIST entre snapshot y objeto nuevo.
 * Evita falsos positivos por campos de sistema (id, matricula, estado, user_id, etc.)
 * @returns {{ oldFields: Object, newFields: Object }}
 */
const NUMERIC_FIELDS = new Set(['mensualidad', 'inscripcion', 'promocion', 'instrumento_id', 'maestro_id']);
const DATE_FIELDS    = new Set(['fechaNacimiento', 'fecha_inicio']);

// Campos de snapshot con nombre diferente al del frontend
const SNAPSHOT_FIELD_MAP = {
    'promocion': 'promocion_id'   // frontend manda "promocion", BD lo guarda como "promocion_id"
};

const normalizeForDiff = (value) => {
    if (value === null || value === undefined || value === '' || String(value).trim() === 'null') return null;
    return String(value).trim();
};

const getStudentDataDiff = (oldSnapshot, newPartialObj) => {
    if (!oldSnapshot || !newPartialObj) return { oldFields: {}, newFields: {} };
    const oldFields = {};
    const newFields = {};
    for (const key of ALUMNO_WHITELIST) {
        const snapshotKey = SNAPSHOT_FIELD_MAP[key] || key;
        const oldRaw = oldSnapshot[snapshotKey] !== undefined ? oldSnapshot[snapshotKey] : null;
        const newRaw = newPartialObj[key]       !== undefined ? newPartialObj[key]       : null;

        // Normalizar fechas a YYYY-MM-DD antes de comparar (mysql2 devuelve DATE como objeto)
        if (DATE_FIELDS.has(key)) {
            const toDateStr = (v) => {
                if (!v) return null;
                if (v instanceof Date) return v.toISOString().substring(0, 10);
                return String(v).substring(0, 10);
            };
            if (toDateStr(oldRaw) === toDateStr(newRaw)) continue;
            oldFields[key] = toDateStr(oldRaw);
            newFields[key] = toDateStr(newRaw);
            continue;
        }

        const oldNorm = normalizeForDiff(oldRaw);
        const newNorm = normalizeForDiff(newRaw);
        if (oldNorm === newNorm) continue;
        // Para campos numéricos, comparar como número para evitar falsos positivos por tipo (2 vs "2")
        if (NUMERIC_FIELDS.has(key) && oldNorm !== null && newNorm !== null && !isNaN(Number(oldNorm)) && !isNaN(Number(newNorm))) {
            if (Number(oldNorm) === Number(newNorm)) continue;
        }
        oldFields[key] = oldRaw;
        newFields[key] = newRaw;
    }
    return { oldFields, newFields };
};

/**
 * Compara arrays de pagos por contenido (fecha + tipo + monto_registrado).
 * No compara por ID porque los pagos se borran y reinsertan en cada update.
 * @param {Array} oldPagos - pagos antes del update (con monto_registrado)
 * @param {Array} newPagos - pagos después del update (con monto_registrado calculado)
 * @returns {{ hasChanges: boolean, added: Array, removed: Array }}
 */
const getPaymentsDiff = (oldPagos, newPagos) => {
    const fechaStr = (f) => {
        if (!f) return '';
        // mysql2 devuelve DATE como objeto Date — usar ISO para evitar conversión de timezone
        if (f instanceof Date) return f.toISOString().substring(0, 10);
        return String(f).substring(0, 10);
    };
    // Comparar solo por fecha+tipo: el monto es calculado en servidor y cambia
    // automáticamente cuando cambia la mensualidad. Ese cambio se captura en el
    // log de UPDATE, no en el de PAGO. El log de PAGO solo registra altas/bajas de fechas.
    const normalize = (p) => `${fechaStr(p.fecha)}|${p.tipo}`;
    const old = oldPagos || [];
    const nuevo = newPagos || [];
    const oldSet = new Set(old.map(normalize));
    const newSet = new Set(nuevo.map(normalize));
    const added   = nuevo.filter(p => !oldSet.has(normalize(p)));
    const removed = old.filter(p => !newSet.has(normalize(p)));
    return { hasChanges: added.length > 0 || removed.length > 0, added, removed };
};

module.exports = { getAlumnoSnapshot, getMaestroSnapshot, getPersonalSnapshot, getDiff, getStudentDataDiff, getPaymentsDiff };
