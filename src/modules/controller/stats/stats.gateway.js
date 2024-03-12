const { query } = require('../../../utils/mysql');

const findAllTotal = async () => {
    const sql = `SELECT fecha, SUM(total) as total FROM larghetto.registro_alumnos WHERE YEAR(fecha) = YEAR(CURDATE()) group by fecha`;
    return await query(sql, []);
}

const insertLog = async (log) => {
    const sqlLog = `INSERT INTO logs (fecha, autor, accion) VALUES (CURRENT_TIMESTAMP, ?, ?)`;
    await query(sqlLog, [log.empleado, log.accion]);
}



const findAllCentro = async () => {
    const sql = `SELECT campus, fecha, SUM(total) as total FROM registro_alumnos WHERE campus='centro' AND YEAR(fecha) = YEAR(CURDATE()) group by campus, fecha`;
    return await query(sql, []);
}

const findAllBuga = async () => {
    const sql = `SELECT campus, fecha, SUM(total) as total FROM larghetto.registro_alumnos WHERE campus='bugambilias' AND YEAR(fecha) = YEAR(CURDATE()) group by campus, fecha`;
    return await query(sql, []);
}

const findAllCuautla = async () => {
    const sql = `SELECT campus, fecha, SUM(total) as total FROM larghetto.registro_alumnos WHERE campus='cuautla' AND YEAR(fecha) = YEAR(CURDATE()) group by campus, fecha`;
    return await query(sql, []);
}

const findAllActual = async () => {
    const sql = `SELECT us.campus, count(alc.id) as total FROM alumno_clases as alc
    JOIN users us on us.id=alc.id_alumno
    JOIN alumno alu on alu.user_id=us.id 
    WHERE us.role='ALUMNO' AND alu.estado != 0 group by us.campus`;
    return await query(sql, []);
}

const guardarActual = async () => {
    const sql = `call InsertarRegistrosPorCampus()`;
    return await query(sql, []);
}

const findAllAlumnoPagos = async (id) => {
    const sql = `SELECT fecha, tipo from alumno_pagos WHERE alumno_id=?`;
    return await query(sql, [id]);
}

const findAllAlumnoMensualidades = async () => {
    const sql = `select sum(alu.mensualidad - (alu.mensualidad * (pro.descuento/100))) as total_mensualidad from alumno alu 
    JOIN promocion pro on pro.id=alu.promocion_id
    JOIN users us on us.id=alu.user_id
    WHERE alu.estado!=0`;
    const response = await query(sql, []);
    const sql2 = `SELECT 
    SUM(
        CASE tipo
            WHEN 2 THEN mensualidad - ((mensualidad - (alu.mensualidad * (pro.descuento/100))) * 0.95)  -- Restar 5%
            WHEN 3 THEN mensualidad - ((mensualidad - (alu.mensualidad * (pro.descuento/100))) * 1.10)  -- Sumar 10%
            ELSE 0  -- En caso de que tipo no sea 1, 2 o 3, sumar normalmente
        END
    ) AS total_pagado_resta
FROM 
    alumno alu
JOIN alumno_pagos alp ON alu.user_id = alp.alumno_id 
JOIN users us ON us.id = alu.user_id
JOIN promocion pro on pro.id=alu.promocion_id
WHERE 
    fecha = DATE_FORMAT(curdate(), '%Y-%m-01');`;
    const response2 = await query(sql2, []);
        const total_mensualidad = response[0].total_mensualidad-response2[0].total_pagado_resta;
    return [{total_mensualidad}];
}

const findAllAlumnoMensualidadesCampus = async (campus) => {
    const sql = `select sum(alu.mensualidad - (alu.mensualidad * (pro.descuento/100))) as total_mensualidad from alumno alu 
    JOIN promocion pro on pro.id=alu.promocion_id
    JOIN users us on us.id=alu.user_id
    WHERE alu.estado!=0 AND campus=?`;
    const response = await query(sql, [campus]);
    const sql2 = `SELECT 
    SUM(
        CASE tipo
            WHEN 2 THEN mensualidad - ((mensualidad - (alu.mensualidad * (pro.descuento/100))) * 0.95)  -- Restar 5%
            WHEN 3 THEN mensualidad - ((mensualidad - (alu.mensualidad * (pro.descuento/100))) * 1.10)  -- Sumar 10%
            ELSE 0  -- En caso de que tipo no sea 1, 2 o 3, sumar normalmente
        END
    ) AS total_pagado_resta
FROM 
    alumno alu
JOIN alumno_pagos alp ON alu.user_id = alp.alumno_id 
JOIN users us ON us.id = alu.user_id
JOIN promocion pro on pro.id=alu.promocion_id
WHERE 
    fecha = DATE_FORMAT(curdate(), '%Y-%m-01') AND campus=?;`;
    const response2 = await query(sql2, [campus]);
        const total_mensualidad = response[0].total_mensualidad-response2[0].total_pagado_resta;
    return [{total_mensualidad}];
}

const findAllAlumnoInscripciones = async () => {
    const sql = `select sum(inscripcion) total_inscripciones from alumno where estado=2;`;
    return await query(sql);
}

const findAllAlumnoInscripcionesCampus = async (campus) => {
    const sql = `select sum(inscripcion) as total_inscripciones from alumno alu
    JOIN users us on us.id=alu.user_id
    where estado=2 AND campus=?;`;
    return await query(sql, [campus]);
}

const findAlumnoPagosMes = async () => {
    const sql = `SELECT 
    SUM(
        CASE tipo
            WHEN 1 THEN mensualidad - (alu.mensualidad * (pro.descuento/100))
            WHEN 2 THEN (mensualidad - (alu.mensualidad * (pro.descuento/100))) * 0.95  -- Restar 5%
            WHEN 3 THEN (mensualidad - (alu.mensualidad * (pro.descuento/100))) * 1.10  -- Sumar 10%
            ELSE mensualidad  -- En caso de que tipo no sea 1, 2 o 3, sumar normalmente
        END
    ) AS total_pagado
FROM 
    alumno_pagos alp 
JOIN alumno alu ON alu.user_id = alp.alumno_id 
JOIN users us ON us.id = alu.user_id
JOIN promocion pro on pro.id=alu.promocion_id
WHERE 
    fecha = DATE_FORMAT(curdate(), '%Y-%m-01')`;
    return await query(sql, []);
}

const findAlumnoPagosMesCampus = async (campus) => {
    const sql = `SELECT 
    SUM(
        CASE tipo
            WHEN 1 THEN mensualidad - (alu.mensualidad * (pro.descuento/100))
            WHEN 2 THEN (mensualidad - (alu.mensualidad * (pro.descuento/100))) * 0.95  -- Restar 5%
            WHEN 3 THEN (mensualidad - (alu.mensualidad * (pro.descuento/100))) * 1.10  -- Sumar 10%
            ELSE mensualidad  -- En caso de que tipo no sea 1, 2 o 3, sumar normalmente
        END
    ) AS total_pagado
FROM 
    alumno_pagos alp 
JOIN alumno alu ON alu.user_id = alp.alumno_id 
JOIN users us ON us.id = alu.user_id
JOIN promocion pro on pro.id=alu.promocion_id
WHERE 
    fecha = DATE_FORMAT(curdate(), '%Y-%m-01') 
    AND campus =?`;
    return await query(sql, [campus]);
}

module.exports = { findAllTotal, findAllCentro, findAllCuautla, findAllBuga, findAllActual, guardarActual, findAllAlumnoPagos, insertLog, findAlumnoPagosMes, findAlumnoPagosMesCampus, findAllAlumnoMensualidades, findAllAlumnoMensualidadesCampus, findAllAlumnoInscripciones, findAllAlumnoInscripcionesCampus };