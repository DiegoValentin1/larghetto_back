const {query} = require('../../../utils/mysql');
const auditLog = require('../../../utils/auditLog');

const findAllInstrumento = async()=>{
    const sql = `SELECT * FROM instrumento`;
    return await query(sql, []);
}

const findAllInstrumento2 = async()=>{
    const sql = `SELECT *, instrumento.id as instrumento_id FROM instrumento`;
    return await query(sql, []);
}

const findAllInstrumentoMaestro = async()=>{
    const sql = `SELECT *, ins.instrumento FROM maestro_instrumento mi
    join instrumento ins on mi.instrumento_id=ins.id`;
    return await query(sql, []);
}

const findLastestLogs = async(year)=>{
    const yearFilter = parseInt(year) || new Date().getFullYear();
    const sql = `SELECT * FROM logs WHERE YEAR(fecha) = ? ORDER BY id DESC LIMIT 1000`;
    return await query(sql, [yearFilter]);
}

const findLogsPaginados = async({ fechaInicio, fechaFin, page, limit }) => {
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const params = [];
    let where = 'WHERE 1=1';

    if (fechaInicio) { where += ' AND DATE(fecha) >= ?'; params.push(fechaInicio); }
    if (fechaFin)    { where += ' AND DATE(fecha) <= ?'; params.push(fechaFin); }

    const sqlCount = `SELECT COUNT(*) as total FROM logs ${where}`;
    const sqlData  = `SELECT * FROM logs ${where} ORDER BY id DESC LIMIT ? OFFSET ?`;

    const [countResult, data] = await Promise.all([
        query(sqlCount, [...params]),
        query(sqlData,  [...params, parseInt(limit), offset])
    ]);

    return { data, total: countResult[0].total };
}

const findLogsRangoFechas = async() => {
    const sql = `SELECT DATE(MIN(fecha)) as fecha_min, DATE(MAX(fecha)) as fecha_max FROM logs`;
    const result = await query(sql, []);
    return result[0];
}

const findById = async(id)=>{
    if (Number.isNaN(id)) throw Error("Wrong Type");
    if(!id)throw Error("Missing fields");
    const sql = `SELECT * FROM alumno_clases WHERE id_alumno=?`;

    return await query(sql, [id]);
}

const findAlumnosClasesCampus = async(campus)=>{
    const sql = `SELECT count(*) from alumno_clases alc 
	JOIN alumno alu on alu.user_id=alc.id_alumno
    JOIN users us on us.id=alc.id_alumno
    WHERE us.campus=? AND alu.estado!=0 AND alu.estado!=7;`;

    return await query(sql, [campus]);
}

const findAlumnosClases = async()=>{
    const sql = `SELECT count(*) from alumno_clases alc 
	JOIN alumno alu on alu.user_id=alc.id_alumno
    WHERE alu.estado!=0 AND alu.estado!=7`;
    return await query(sql, []);
}

const save = async(instrumento)=>{
    if(!instrumento.instrumento) throw Error("Missing fields");
    const sql = `INSERT INTO instrumento(instrumento) VALUES(?)`;
    const {insertedId} = await query(sql, [instrumento.instrumento]);

    return {...instrumento, id:insertedId}
}

const formatFechaLegible = (fechaStr) => {
    if (!fechaStr) return fechaStr;
    const [y, m, d] = String(fechaStr).split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return new Intl.DateTimeFormat('es-MX', { weekday: 'long', day: 'numeric', month: 'long' }).format(date);
};

const saveRepo = async(instrumento, userData = {})=>{

    const sql = `INSERT INTO alumno_repo(fecha, alumno_id, maestro_id, hora, instrumento, fecha_original) VALUES(?,?,?,?,?,?)`;
    const result = await query(sql, [instrumento.fecha, instrumento.alumno_id, instrumento.maestro_id, instrumento.hora || null, instrumento.instrumento || null, instrumento.fecha_original || null]);
    const insertedId = result.insertId;

    if (userData && userData.id) {
        const [alumnoRows] = await Promise.all([
            query(
                `SELECT pe.name, al.matricula, us.campus FROM users us JOIN personal pe ON pe.id = us.personal_id JOIN alumno al ON al.user_id = us.id WHERE us.id = ? LIMIT 1`,
                [instrumento.alumno_id]
            )
        ]);
        const alumno = alumnoRows[0] || {};
        const alumnoLabel = alumno.name && alumno.matricula
            ? `${alumno.name} (${alumno.matricula})`
            : `ID: ${instrumento.alumno_id}`;

        const fechaRepo     = formatFechaLegible(instrumento.fecha);
        const fechaOriginal = instrumento.fecha_original ? formatFechaLegible(instrumento.fecha_original) : null;
        const summaryFechas = fechaOriginal
            ? `clase del ${fechaOriginal} → repone el ${fechaRepo}`
            : `repone el ${fechaRepo}`;

        await auditLog.register({
            entityType: 'REPOSICION',
            entityId: insertedId,
            entityName: alumnoLabel,
            actionType: 'CREATE',
            userId: userData.id,
            userName: userData.name || userData.email,
            userRole: userData.role,
            campus: alumno.campus || userData.campus || null,
            summary: `${userData.name || userData.email} registró reposición de ${alumnoLabel} — ${summaryFechas}`,
            oldValue: null,
            newValue: { alumno: alumnoLabel, fecha: instrumento.fecha, fecha_original: instrumento.fecha_original || null, hora: instrumento.hora || null, instrumento: instrumento.instrumento || null }
        });
    }

    return {...instrumento, id:insertedId}
}

const update = async (instrumento) => {
    //Con esto se valida que id  sea un numero
    if (Number.isNaN(instrumento.id)) throw Error("Wrong Type");
    //Valida que el id no venga vacio, Espera que mandes un parametro, Y no uno vacio 
    if (!instrumento.id) throw Error("Missing Fields");
    if (
        !instrumento.instrumento
    ) throw Error("Missing Fields");

    const sql = `UPDATE instrumento SET instrumento=? WHERE id=?;`;

    await query(sql, [
        instrumento.instrumento,
        instrumento.id,
    ]);
    return{ ...instrumento }
};

const remove = async(id)=>{
    if (Number.isNaN(id)) throw Error("Wrong Type"); 
    if (!id) throw Error('Missing Fields');
    const sql = `UPDATE instrumento SET status=IF(status = true, false, true) WHERE id=?`;
    await query(sql,[id]);

    return{ idDeleted:id };
}

module.exports = {findAllInstrumento , save, update , remove, findLastestLogs, findById, findAllInstrumentoMaestro, findAllInstrumento2, saveRepo /*, findAllAdmin*/, findAlumnosClases, findAlumnosClasesCampus, findLogsPaginados, findLogsRangoFechas};