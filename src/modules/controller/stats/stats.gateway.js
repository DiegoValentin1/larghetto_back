const { response } = require('express');
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
const findAllCdmx = async () => {
    const sql = `SELECT campus, fecha, SUM(total) as total FROM larghetto.registro_alumnos WHERE campus='CDMX' AND YEAR(fecha) = YEAR(CURDATE()) group by campus, fecha`;
    const response = await query(sql, []);
    console.log(response);
    return response;
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







//Eta nueva función va a sumar los pagos faltantes con los pagos obtenidos, asi dando el total mensualidades :) Pero para global
const findAllAlumnoMensualidadesSumaFaltaMasPagos = async () => {
    const sql = `SELECT 
    sum(alu.mensualidad - (alu.mensualidad * pro.descuento / 100)) as faltas
FROM alumno alu
JOIN users us ON us.id = alu.user_id
JOIN promocion pro ON pro.id = alu.promocion_id
    WHERE alu.proximo_pago <= CURDATE() AND alu.estado!=0;`;

    const sql2 = `SELECT 
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

    const response1 = await query(sql, []);
    const response2 = await query(sql2, []);
    const total_mensualidad = response1[0].faltas + response2[0].total_pagado;
    console.log(response1 , response2)
    return [{  total_mensualidad }];
}
//Eta nueva función va a sumar los pagos faltantes con los pagos obtenidos, asi dando el total mensualidades :) Por campus
const findAllAlumnoMensualidadesCampusSumaFaltaMasPagos = async (campus) => {
    const sql = `SELECT 
    sum(alu.mensualidad - (alu.mensualidad * pro.descuento / 100)) as faltas
FROM alumno alu
JOIN users us ON us.id = alu.user_id
JOIN promocion pro ON pro.id = alu.promocion_id
    WHERE us.campus=? AND alu.proximo_pago <= CURDATE() AND alu.estado!=0;`;
    const sql2 = `SELECT 
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

    const response1 = await query(sql, [campus]);
    const response2 = await query(sql2, [campus]);
    const total_mensualidad = response1[0].faltas + response2[0].total_pagado;
    console.log(response1 , response2)
    return [{  total_mensualidad }];
}

// const findAllAlumnoMensualidades = async () => {
//     const sql = `select sum(alu.mensualidad - (alu.mensualidad * (pro.descuento/100))) as total_mensualidad from alumno alu 
//     JOIN promocion pro on pro.id=alu.promocion_id
//     JOIN users us on us.id=alu.user_id
//     WHERE alu.estado!=0 AND alu.estado!=7`;
//     const response = await query(sql, []);
//     const sql2 = `SELECT 
//     SUM(
//         CASE tipo
//             WHEN 2 THEN mensualidad - ((mensualidad - (alu.mensualidad * (pro.descuento/100))) * 0.95)  -- Restar 5%
//             WHEN 3 THEN mensualidad - ((mensualidad - (alu.mensualidad * (pro.descuento/100))) * 1.10)  -- Sumar 10%
//             ELSE 0  -- En caso de que tipo no sea 1, 2 o 3, sumar normalmente
//         END
//     ) AS total_pagado_resta
// FROM 
//     alumno alu
// JOIN alumno_pagos alp ON alu.user_id = alp.alumno_id 
// JOIN users us ON us.id = alu.user_id
// JOIN promocion pro on pro.id=alu.promocion_id
// WHERE 
//     fecha = DATE_FORMAT(curdate(), '%Y-%m-01');`;
//     const response2 = await query(sql2, []);
//     console.log(response[0], response2[0])
//     const total_mensualidad = response[0].total_mensualidad - response2[0].total_pagado_resta;
//     return [{ total_mensualidad }];
// }
const separator = 0;

// const findAllAlumnoMensualidadesCampus = async (campus) => {
//     const sql = `select sum(alu.mensualidad - (alu.mensualidad * (pro.descuento/100))) as total_mensualidad from alumno alu 
//     JOIN promocion pro on pro.id=alu.promocion_id
//     JOIN users us on us.id=alu.user_id
//     WHERE alu.estado!=0 AND alu.estado!=7 AND campus=?`;
//     const response = await query(sql, [campus]);
//     const sql2 = `SELECT 
//     SUM(
//         CASE tipo
//             WHEN 2 THEN mensualidad - ((mensualidad - (alu.mensualidad * (pro.descuento/100))) * 0.95)  -- Restar 5%
//             WHEN 3 THEN mensualidad - ((mensualidad - (alu.mensualidad * (pro.descuento/100))) * 1.10)  -- Sumar 10%
//             ELSE 0  -- En caso de que tipo no sea 1, 2 o 3, sumar normalmente
//         END
//     ) AS total_pagado_resta
// FROM 
//     alumno alu
// JOIN alumno_pagos alp ON alu.user_id = alp.alumno_id 
// JOIN users us ON us.id = alu.user_id
// JOIN promocion pro on pro.id=alu.promocion_id
// WHERE 
//     fecha = DATE_FORMAT(curdate(), '%Y-%m-01') AND campus=?;`;
//     const response2 = await query(sql2, [campus]);
//     const total_mensualidad = response[0].total_mensualidad - response2[0].total_pagado_resta;
//     return [{ total_mensualidad }];
// }

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


const lastThree = async (campus) => {
    const sql = `SELECT us.campus, pe.name, MAX(alu.proximo_pago) AS proximo_pago
    FROM alumno_asistencias als
    JOIN users us ON us.id = als.id_alumno
    JOIN personal pe ON pe.id = us.personal_id
    JOIN alumno alu ON alu.user_id = us.id
    WHERE us.campus=?
    GROUP BY pe.name, us.campus
    ORDER BY MAX(als.id) DESC
    LIMIT 3;`;
    return await query(sql, [campus]);
}

const findAllAlumnoFaltantesCampus = async (campus) => {
    const sql = `SELECT 
    sum(alu.mensualidad - (alu.mensualidad * pro.descuento / 100)) as lol
FROM alumno alu
JOIN users us ON us.id = alu.user_id
JOIN promocion pro ON pro.id = alu.promocion_id
WHERE us.campus=? AND alu.proximo_pago <= CURDATE() AND alu.estado!=0;`;
    return await query(sql, [campus]);
}

const findAllAlumnoFaltantes = async () => {
    const sql = `SELECT 
    sum(alu.mensualidad - (alu.mensualidad * pro.descuento / 100)) as lol
FROM alumno alu
JOIN users us ON us.id = alu.user_id
JOIN promocion pro ON pro.id = alu.promocion_id
WHERE alu.proximo_pago <= CURDATE() AND alu.estado!=0;`;
    const response = await query(sql, []);
    console.log(response);
    return response;
}

// ========================================
// REPORTES HISTÓRICOS
// ========================================

const findHistoricoAlumnos = async (year, campus) => {
    let sql = `
        SELECT
            fecha,
            campus,
            total
        FROM registro_alumnos
        WHERE YEAR(fecha) = ?
    `;

    const params = [parseInt(year) || new Date().getFullYear()];

    if (campus) {
        sql += ' AND campus = ?';
        params.push(campus);
    }

    sql += ' ORDER BY fecha ASC';

    const result = await query(sql, params);
    return result;
};

const findHistoricoPagos = async (year, month, campus) => {
    console.log('🔍 findHistoricoPagos llamada con:', {year, month, campus});

    let sql = `
        SELECT
            MONTH(alp.fecha) as mes,
            MONTHNAME(alp.fecha) as nombre_mes,
            SUM(CASE
                WHEN alp.tipo = 1 THEN (alu.mensualidad - (alu.mensualidad * (COALESCE(pro.descuento, 0) / 100)))
                WHEN alp.tipo = 2 THEN (alu.mensualidad - (alu.mensualidad * (COALESCE(pro.descuento, 0) / 100))) * 0.95
                WHEN alp.tipo = 3 THEN (alu.mensualidad - (alu.mensualidad * (COALESCE(pro.descuento, 0) / 100))) * 1.10
                ELSE 0
            END) as total_mes,
            SUM(CASE WHEN alp.tipo = 1 THEN (alu.mensualidad - (alu.mensualidad * (COALESCE(pro.descuento, 0) / 100))) ELSE 0 END) as pagos_normales,
            SUM(CASE WHEN alp.tipo = 2 THEN (alu.mensualidad - (alu.mensualidad * (COALESCE(pro.descuento, 0) / 100))) * 0.95 ELSE 0 END) as pagos_descuento,
            SUM(CASE WHEN alp.tipo = 3 THEN (alu.mensualidad - (alu.mensualidad * (COALESCE(pro.descuento, 0) / 100))) * 1.10 ELSE 0 END) as pagos_recargo,
            COUNT(*) as total_transacciones,
            COUNT(DISTINCT alp.alumno_id) as alumnos_que_pagaron
        FROM alumno_pagos alp
        JOIN alumno alu ON alu.user_id = alp.alumno_id
        LEFT JOIN promocion pro ON pro.id = alu.promocion_id
        JOIN users us ON us.id = alu.user_id
        WHERE YEAR(alp.fecha) = ?
    `;

    const yearParam = parseInt(year) || new Date().getFullYear();
    console.log('📅 Año parseado:', yearParam);
    const params = [yearParam];

    if (month) {
        sql += ' AND MONTH(alp.fecha) = ?';
        params.push(parseInt(month));
    }

    if (campus) {
        sql += ' AND us.campus = ?';
        params.push(campus);
    }

    sql += ' GROUP BY MONTH(alp.fecha), MONTHNAME(alp.fecha) ORDER BY mes ASC';

    console.log('📊 SQL:', sql.substring(0, 100) + '...');
    console.log('📊 Params:', params);
    const result = await query(sql, params);
    console.log('✅ Resultado query:', result?.length, 'registros');
    return result;
};

module.exports = {
    findAllTotal,
    findAllCentro,
    findAllCuautla,
    findAllCdmx,
    findAllBuga,
    findAllActual,
    guardarActual,
    findAllAlumnoPagos,
    insertLog,
    findAlumnoPagosMes,
    findAlumnoPagosMesCampus,
    findAllAlumnoMensualidadesSumaFaltaMasPagos,
    findAllAlumnoMensualidadesCampusSumaFaltaMasPagos,
    findAllAlumnoInscripciones,
    findAllAlumnoInscripcionesCampus,
    lastThree,
    findAllAlumnoFaltantes,
    findAllAlumnoFaltantesCampus,
    // Reportes históricos
    findHistoricoAlumnos,
    findHistoricoPagos
};