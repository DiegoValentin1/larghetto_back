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
            CASE WHEN aa.id IS NOT NULL THEN 1 ELSE 0 END AS asistio,
            ar.id           AS id_repo,
            -- Fecha de asistencia en otra clase de esta semana con este maestro (para mostrar aviso de "slot cubierto")
            (
                SELECT DATE_FORMAT(DATE(aw.fecha), '%Y-%m-%d')
                FROM alumno_asistencias aw
                LEFT JOIN alumno_clases alc_w ON alc_w.id = aw.id_clase
                WHERE aw.id_alumno = alc.id_alumno
                  AND YEARWEEK(aw.fecha, 1) = YEARWEEK(?, 1)
                  AND DATE(aw.fecha) != ?
                  AND (
                      alc_w.id_maestro = ?
                      OR (alc_w.id IS NULL AND aw.id_alumno IN (
                          SELECT id_alumno FROM alumno_clases WHERE id_maestro = ?
                      ))
                  )
                LIMIT 1
            ) AS asistencia_otra_fecha
        FROM alumno_clases alc
        JOIN users us       ON us.id       = alc.id_alumno
        JOIN personal pe    ON pe.id       = us.personal_id
        JOIN alumno al      ON al.user_id  = alc.id_alumno
        JOIN instrumento ins ON ins.id     = alc.id_instrumento
        LEFT JOIN alumno_asistencias aa
            ON aa.id_alumno = alc.id_alumno
           AND aa.id_clase  = alc.id
           AND DATE(aa.fecha) = ?
        LEFT JOIN alumno_repo ar
            ON ar.alumno_id  = alc.id_alumno
           AND ar.maestro_id = ?
           AND DATE(ar.fecha) = ?
        WHERE alc.id_maestro = ?
          AND alc.dia        = ?
          AND alc.hora       = ?
          AND ins.instrumento = ?
          AND us.role = 'ALUMNO'
          AND (al.estado != 0 OR aa.id IS NOT NULL)

        UNION

        -- Alumnos con asistencia huérfana en esta fecha (su id_clase fue borrado al cambiar horario)
        SELECT
            aa2.id_clase    AS id_clase,
            aa2.id_alumno,
            pe2.name,
            al2.matricula,
            1               AS asistio,
            NULL            AS id_repo,
            NULL            AS asistencia_otra_fecha
        FROM alumno_asistencias aa2
        JOIN users us2    ON us2.id      = aa2.id_alumno
        JOIN personal pe2 ON pe2.id     = us2.personal_id
        JOIN alumno al2   ON al2.user_id = aa2.id_alumno
        LEFT JOIN alumno_clases alc2 ON alc2.id = aa2.id_clase
        WHERE alc2.id IS NULL
          AND DATE(aa2.fecha) = ?
          AND aa2.id_alumno IN (
              SELECT id_alumno FROM alumno_clases WHERE id_maestro = ?
          )
          AND us2.role = 'ALUMNO'

        ORDER BY name
    `;
    return await query(sql, [
        fecha, fecha, maestro_id, maestro_id,  // subquery asistencia_otra_fecha
        fecha, maestro_id, fecha,               // LEFT JOINs aa y ar
        maestro_id, dia, hora, instrumento,     // WHERE principal
        fecha, maestro_id                       // UNION huérfanas
    ]);
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

/**
 * Pase de lista mensual: alumnos × fechas con estado A (asistencia) o R (reposición).
 * Las columnas (fechas) se derivan del horario registrado del maestro, no de las asistencias.
 */
const findPaseListaMensual = async (maestro_id, year, month) => {
    // Días de semana únicos que tiene el maestro en alumno_clases
    const sqlDias = `
        SELECT DISTINCT dia FROM alumno_clases WHERE id_maestro = ?
    `;

    // Alumnos activos + sus días de clase con este maestro
    const sqlAlumnos = `
        SELECT DISTINCT alc.id_alumno AS id, pe.name AS nombre
        FROM alumno_clases alc
        JOIN users u    ON u.id       = alc.id_alumno
        JOIN personal pe ON pe.id    = u.personal_id
        JOIN alumno al  ON al.user_id = alc.id_alumno
        WHERE alc.id_maestro = ?
          AND u.role = 'ALUMNO'
          AND al.estado != 0
        ORDER BY pe.name
    `;

    // Días de cada alumno activo con este maestro
    const sqlDiasAlumno = `
        SELECT alc.id_alumno, alc.dia
        FROM alumno_clases alc
        JOIN alumno al ON al.user_id = alc.id_alumno
        WHERE alc.id_maestro = ?
          AND al.estado != 0
    `;

    // Asistencias del mes — incluye huérfanas (id_clase ya no existe) de alumnos
    // que actualmente siguen con este maestro
    const sqlAsistencias = `
        SELECT aa.id_alumno, DATE_FORMAT(DATE(aa.fecha), '%Y-%m-%d') AS fecha
        FROM alumno_asistencias aa
        JOIN alumno_clases alc ON alc.id = aa.id_clase
        WHERE alc.id_maestro = ?
          AND MONTH(aa.fecha) = ?
          AND YEAR(aa.fecha)  = ?

        UNION

        SELECT aa.id_alumno, DATE_FORMAT(DATE(aa.fecha), '%Y-%m-%d') AS fecha
        FROM alumno_asistencias aa
        LEFT JOIN alumno_clases alc ON alc.id = aa.id_clase
        WHERE alc.id IS NULL
          AND MONTH(aa.fecha) = ?
          AND YEAR(aa.fecha)  = ?
          AND aa.id_alumno IN (
              SELECT id_alumno FROM alumno_clases WHERE id_maestro = ?
          )
    `;

    // Repos del mes
    const sqlRepos = `
        SELECT ar.alumno_id AS id_alumno, DATE_FORMAT(DATE(ar.fecha), '%Y-%m-%d') AS fecha
        FROM alumno_repo ar
        WHERE ar.maestro_id = ?
          AND MONTH(ar.fecha) = ?
          AND YEAR(ar.fecha)  = ?
    `;

    const [diasRows, alumnos, diasAlumnoRows, asistencias, repos] = await Promise.all([
        query(sqlDias, [maestro_id]),
        query(sqlAlumnos, [maestro_id]),
        query(sqlDiasAlumno, [maestro_id]),
        query(sqlAsistencias, [maestro_id, month, year, month, year, maestro_id]),
        query(sqlRepos, [maestro_id, month, year]),
    ]);

    // Construir mapa {id_alumno: Set<dia>}
    const diasPorAlumno = {};
    for (const { id_alumno, dia } of diasAlumnoRows) {
        if (!diasPorAlumno[id_alumno]) diasPorAlumno[id_alumno] = new Set();
        diasPorAlumno[id_alumno].add(dia);
    }

    // Mapeo de nombre del día (DB) → getDay() de JS
    const DIAS_DB_DOW = { Domingo: 0, Lunes: 1, Martes: 2, Miercoles: 3, Jueves: 4, Viernes: 5, Sabado: 6 };

    // Expandir cada día de semana a todas sus fechas en el mes dado
    const daysInMonth = new Date(year, month, 0).getDate();
    const fechasSet = new Set();

    for (const { dia } of diasRows) {
        const targetDow = DIAS_DB_DOW[dia];
        if (targetDow === undefined) continue;
        for (let d = 1; d <= daysInMonth; d++) {
            if (new Date(year, month - 1, d).getDay() === targetDow) {
                fechasSet.add(
                    `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`
                );
            }
        }
    }

    const fechas = [...fechasSet].sort();

    // Construir matriz {[id_alumno]: {[fecha]: 'A' | 'R'}}
    const matriz = {};
    for (const al of alumnos) matriz[al.id] = {};

    for (const a of asistencias) {
        if (matriz[a.id_alumno] !== undefined) {
            matriz[a.id_alumno][a.fecha] = 'A';
        }
    }
    for (const r of repos) {
        if (matriz[r.id_alumno] !== undefined && !matriz[r.id_alumno][r.fecha]) {
            matriz[r.id_alumno][r.fecha] = 'R';
        }
    }

    // Serializar Sets a arrays
    const diasPorAlumnoFinal = {};
    for (const [id, set] of Object.entries(diasPorAlumno)) {
        diasPorAlumnoFinal[id] = [...set];
    }

    return {
        meta: { year: parseInt(year), month: parseInt(month) },
        fechas,
        alumnos,
        matriz,
        diasPorAlumno: diasPorAlumnoFinal,
        resumen: {
            total_fechas: fechas.length,
            total_alumnos: alumnos.length,
            total_asistencias: asistencias.length,
            total_repos: repos.length,
        },
    };
};

module.exports = { findAllByMaestro, findHorarioAllByMaestro, findAllByMaestroCampus, findAlumnosByClaseDetalle, findHistorialByMaestro, findPaseListaMensual };