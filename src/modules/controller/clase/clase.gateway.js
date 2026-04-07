const { query } = require('../../../utils/mysql');

const findAllByMaestro = async (id) => {
    if (!id) throw Error("Missing fields");
    const sql = `SELECT alc.dia, 
    alc.hora, 
    ins.instrumento,
    GROUP_CONCAT(DISTINCT pea.name SEPARATOR ', ') AS alumnos
FROM alumno_clases alc
JOIN maestro ma ON ma.user_id = alc.id_maestro
JOIN alumno alu ON alu.user_id = alc.id_alumno
JOIN users usa ON usa.id = alc.id_alumno
JOIN personal pea ON pea.id = usa.personal_id
JOIN users usm ON usm.id = alc.id_maestro
JOIN personal pem ON pem.id = usm.personal_id
JOIN instrumento ins ON ins.id=alc.id_instrumento
WHERE alc.id_maestro = ? AND alu.estado!=0 AND usa.campus=usm.campus AND usm.role="MAESTRO" AND usa.role="ALUMNO"
GROUP BY alc.dia, alc.hora, ins.instrumento
ORDER BY alc.dia;`;
    return await query(sql, [id]);
}

const findAllByMaestroCampus = async (id, campus) => {
    if (!id) throw Error("Missing fields");
    const sql = `SELECT alc.dia, 
    alc.hora, 
    ins.instrumento,
    GROUP_CONCAT(DISTINCT pea.name SEPARATOR ', ') AS alumnos
FROM alumno_clases alc
JOIN maestro ma ON ma.user_id = alc.id_maestro
JOIN alumno alu ON alu.user_id = alc.id_alumno
JOIN users usa ON usa.id = alc.id_alumno
JOIN personal pea ON pea.id = usa.personal_id
JOIN users usm ON usm.id = alc.id_maestro
JOIN personal pem ON pem.id = usm.personal_id
JOIN instrumento ins ON ins.id=alc.id_instrumento
WHERE alc.id_maestro = ? AND alu.estado!=0 AND alu.estado!=7 AND usa.campus=usm.campus AND usm.role="MAESTRO" AND usa.role="ALUMNO" AND usm.campus=? AND usa.campus=?
GROUP BY alc.dia, alc.hora, ins.instrumento
ORDER BY alc.dia;`;
    return await query(sql, [id, campus, campus]);
}

const findHorarioAllByMaestro = async (id) => {
    if (!id) throw Error("Missing fields");
    const sql = `SELECT * from maestro_clases WHERE id_maestro=?`;
    return await query(sql, [id]);
}

// const save = async(promocion)=>{
//     if(!promocion.promocion) throw Error("Missing fields");
//     const sql = `INSERT INTO promocion(promocion, descuento) VALUES(?,?)`;
//     const {insertedId} = await query(sql, [promocion.promocion, promocion.descuento]);

//     return {...promocion, id:insertedId}
// }

// const update = async (promocion) => {
//     //Con esto se valida que id  sea un numero
//     if (Number.isNaN(promocion.id)) throw Error("Wrong Type");
//     //Valida que el id no venga vacio, Espera que mandes un parametro, Y no uno vacio 
//     if (!promocion.id) throw Error("Missing Fields");
//     if (
//         !promocion.promocion
//     ) throw Error("Missing Fields");

//     const sql = `UPDATE promocion SET promocion=?, descuento=? WHERE id=?;`;

//     await query(sql, [
//         promocion.promocion,
//         promocion.descuento,
//         promocion.id,
//     ]);
//     return{ ...promocion }
// };

// const remove = async(id)=>{
//     if (Number.isNaN(id)) throw Error("Wrong Type"); 
//     if (!id) throw Error('Missing Fields');
//     const sql = `UPDATE promocion SET status=IF(status = true, false, true) WHERE id=?`;
//     await query(sql,[id]);

//     return{ idDeleted:id };
// }

/**
 * Devuelve los alumnos de una clase específica con estado de asistencia para una fecha dada.
 * Usado para el pase de lista desde el calendario del maestro.
 */
const findAlumnosByClaseDetalle = async (maestro_id, dia, hora, instrumento, fecha) => {
    const sql = `
        SELECT
            alc.id          AS id_clase,
            alc.id_alumno,
            pe.name,
            al.matricula,
            CASE WHEN aa.id IS NOT NULL THEN 1 ELSE 0 END AS asistio
        FROM alumno_clases alc
        JOIN users us       ON us.id       = alc.id_alumno
        JOIN personal pe    ON pe.id       = us.personal_id
        JOIN alumno al      ON al.user_id  = alc.id_alumno
        JOIN instrumento ins ON ins.id     = alc.id_instrumento
        LEFT JOIN alumno_asistencias aa
            ON aa.id_alumno = alc.id_alumno
           AND aa.id_clase  = alc.id
           AND DATE(aa.fecha) = ?
        WHERE alc.id_maestro = ?
          AND alc.dia        = ?
          AND alc.hora       = ?
          AND ins.instrumento = ?
          AND us.role = 'ALUMNO'
          AND (al.estado != 0 OR aa.id IS NOT NULL)
        ORDER BY pe.name
    `;
    return await query(sql, [fecha, maestro_id, dia, hora, instrumento]);
};

/**
 * Devuelve el historial de pases de lista del maestro, agrupado por fecha+clase.
 */
const findHistorialByMaestro = async (maestro_id, limit = 20) => {
    const sql = `
        SELECT
            DATE_FORMAT(DATE(aa.fecha), '%Y-%m-%d')                           AS fecha,
            alc.dia,
            alc.hora,
            ins.instrumento,
            COUNT(DISTINCT aa.id_alumno)                                      AS total_presentes,
            GROUP_CONCAT(DISTINCT pe.name ORDER BY pe.name SEPARATOR ', ')    AS nombres
        FROM alumno_asistencias aa
        JOIN alumno_clases alc  ON alc.id    = aa.id_clase
        JOIN instrumento ins    ON ins.id    = alc.id_instrumento
        JOIN users us           ON us.id     = aa.id_alumno
        JOIN personal pe        ON pe.id     = us.personal_id
        WHERE alc.id_maestro = ?
        GROUP BY DATE_FORMAT(DATE(aa.fecha), '%Y-%m-%d'), alc.dia, alc.hora, ins.instrumento
        ORDER BY DATE_FORMAT(DATE(aa.fecha), '%Y-%m-%d') DESC, alc.hora ASC
        LIMIT ?
    `;
    return await query(sql, [maestro_id, parseInt(limit)]);
};

module.exports = { findAllByMaestro, findHorarioAllByMaestro, findAllByMaestroCampus, findAlumnosByClaseDetalle, findHistorialByMaestro };