const { response } = require('express');
const { query } = require('../../../utils/mysql');
const { generarSQLDescuentoVigente } = require('../../../utils/promocion-helper');
const { RECARGO_PORCENTAJE, DIA_LIMITE_PAGO } = require('../../../config/pagos.config');

// Expresión CASE WHEN para calcular descuento vigente (usar en queries)
// Usa diferencia de meses CALENDARIOS (no días exactos) para contar meses de descuento
const DESCUENTO_VIGENTE_SQL = `
CASE
    WHEN pro.duracion_meses IS NULL OR pro.duracion_meses = 0
        THEN pro.descuento
    WHEN alu.fecha_inicio_promo IS NULL
        THEN 0
    WHEN ((YEAR(CURDATE()) - YEAR(alu.fecha_inicio_promo)) * 12 + (MONTH(CURDATE()) - MONTH(alu.fecha_inicio_promo))) < pro.duracion_meses
        THEN pro.descuento
    ELSE 0
END`;

const findAllTotal = async (year) => {
    const yearFilter = year || new Date().getFullYear();
    const sql = `SELECT fecha, SUM(total) as total FROM registro_alumnos WHERE YEAR(fecha) = ? group by fecha`;
    return await query(sql, [yearFilter]);
}

const insertLog = async (log) => {
    const sqlLog = `INSERT INTO logs (fecha, autor, accion) VALUES (CURRENT_TIMESTAMP, ?, ?)`;
    await query(sqlLog, [log.empleado, log.accion]);
}



const findAllCentro = async (year) => {
    const yearFilter = year || new Date().getFullYear();
    const sql = `SELECT campus, fecha, SUM(total) as total FROM registro_alumnos WHERE campus='centro' AND YEAR(fecha) = ? group by campus, fecha`;
    return await query(sql, [yearFilter]);
}

const findAllBuga = async (year) => {
    const yearFilter = year || new Date().getFullYear();
    const sql = `SELECT campus, fecha, SUM(total) as total FROM registro_alumnos WHERE campus='bugambilias' AND YEAR(fecha) = ? group by campus, fecha`;
    return await query(sql, [yearFilter]);
}

const findAllCuautla = async (year) => {
    const yearFilter = year || new Date().getFullYear();
    const sql = `SELECT campus, fecha, SUM(total) as total FROM registro_alumnos WHERE campus='cuautla' AND YEAR(fecha) = ? group by campus, fecha`;
    return await query(sql, [yearFilter]);
}

const findAllCdmx = async (year) => {
    const yearFilter = year || new Date().getFullYear();
    const sql = `SELECT campus, fecha, SUM(total) as total FROM registro_alumnos WHERE campus='CDMX' AND YEAR(fecha) = ? group by campus, fecha`;
    return await query(sql, [yearFilter]);
}

const findAllActual = async () => {
    const sql = `SELECT us.campus, count(alc.id) as total FROM alumno_clases as alc
    JOIN users us on us.id=alc.id_alumno
    JOIN alumno alu on alu.user_id=us.id 
    WHERE us.role='ALUMNO' AND alu.estado != 0 AND alu.estado != 7 group by us.campus`;
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
    sum(alu.mensualidad - (alu.mensualidad * (
        CASE
            WHEN pro.duracion_meses IS NULL OR pro.duracion_meses = 0
                THEN pro.descuento
            WHEN alu.fecha_inicio_promo IS NULL
                THEN 0
            WHEN ((YEAR(CURDATE()) - YEAR(alu.fecha_inicio_promo)) * 12 + (MONTH(CURDATE()) - MONTH(alu.fecha_inicio_promo))) < pro.duracion_meses
                THEN pro.descuento
            ELSE 0
        END
    ) / 100)) as faltas
FROM alumno alu
JOIN users us ON us.id = alu.user_id
JOIN promocion pro ON pro.id = alu.promocion_id
    WHERE alu.proximo_pago <= CURDATE() AND alu.estado!=0;`;

    const sql2 = `SELECT COALESCE(SUM(alp.monto_registrado), 0) AS total_pagado
FROM alumno_pagos alp
WHERE alp.fecha = DATE_FORMAT(CURDATE(), '%Y-%m-01')`;

    const response1 = await query(sql, []);
    const response2 = await query(sql2, []);
    const total_mensualidad = Number(response1[0].faltas || 0) + Number(response2[0].total_pagado || 0);
    return [{  total_mensualidad }];
}
//Eta nueva función va a sumar los pagos faltantes con los pagos obtenidos, asi dando el total mensualidades :) Por campus
const findAllAlumnoMensualidadesCampusSumaFaltaMasPagos = async (campus) => {
    const sql = `SELECT
    sum(alu.mensualidad - (alu.mensualidad * (
        CASE
            WHEN pro.duracion_meses IS NULL OR pro.duracion_meses = 0
                THEN pro.descuento
            WHEN alu.fecha_inicio_promo IS NULL
                THEN 0
            WHEN ((YEAR(CURDATE()) - YEAR(alu.fecha_inicio_promo)) * 12 + (MONTH(CURDATE()) - MONTH(alu.fecha_inicio_promo))) < pro.duracion_meses
                THEN pro.descuento
            ELSE 0
        END
    ) / 100)) as faltas
FROM alumno alu
JOIN users us ON us.id = alu.user_id
JOIN promocion pro ON pro.id = alu.promocion_id
    WHERE us.campus=? AND alu.proximo_pago <= CURDATE() AND alu.estado!=0;`;
    const sql2 = `SELECT COALESCE(SUM(alp.monto_registrado), 0) AS total_pagado
FROM alumno_pagos alp
JOIN users us ON us.id = alp.alumno_id
WHERE alp.fecha = DATE_FORMAT(CURDATE(), '%Y-%m-01')
  AND us.campus = ?`;

    const response1 = await query(sql, [campus]);
    const response2 = await query(sql2, [campus]);
    const total_mensualidad = Number(response1[0].faltas || 0) + Number(response2[0].total_pagado || 0);
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
    const sql = `SELECT COALESCE(SUM(alp.monto_registrado), 0) AS total_pagado
FROM alumno_pagos alp
WHERE alp.fecha = DATE_FORMAT(CURDATE(), '%Y-%m-01')`;
    const rows = await query(sql, []);
    return [{ total_pagado: Number(rows[0]?.total_pagado || 0) }];
}

const findAlumnoPagosMesCampus = async (campus) => {
    const sql = `SELECT COALESCE(SUM(alp.monto_registrado), 0) AS total_pagado
FROM alumno_pagos alp
JOIN users us ON us.id = alp.alumno_id
WHERE alp.fecha = DATE_FORMAT(CURDATE(), '%Y-%m-01')
  AND us.campus = ?`;
    const rows = await query(sql, [campus]);
    return [{ total_pagado: Number(rows[0]?.total_pagado || 0) }];
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
    sum(alu.mensualidad - (alu.mensualidad * (
        CASE
            WHEN pro.duracion_meses IS NULL OR pro.duracion_meses = 0
                THEN pro.descuento
            WHEN alu.fecha_inicio_promo IS NULL
                THEN 0
            WHEN ((YEAR(CURDATE()) - YEAR(alu.fecha_inicio_promo)) * 12 + (MONTH(CURDATE()) - MONTH(alu.fecha_inicio_promo))) < pro.duracion_meses
                THEN pro.descuento
            ELSE 0
        END
    ) / 100)) as lol
FROM alumno alu
JOIN users us ON us.id = alu.user_id
JOIN promocion pro ON pro.id = alu.promocion_id
WHERE us.campus=? AND alu.proximo_pago <= CURDATE() AND alu.estado!=0;`;
    return await query(sql, [campus]);
}

const findAllAlumnoFaltantes = async () => {
    const sql = `SELECT
    sum(alu.mensualidad - (alu.mensualidad * (
        CASE
            WHEN pro.duracion_meses IS NULL OR pro.duracion_meses = 0
                THEN pro.descuento
            WHEN alu.fecha_inicio_promo IS NULL
                THEN 0
            WHEN ((YEAR(CURDATE()) - YEAR(alu.fecha_inicio_promo)) * 12 + (MONTH(CURDATE()) - MONTH(alu.fecha_inicio_promo))) < pro.duracion_meses
                THEN pro.descuento
            ELSE 0
        END
    ) / 100)) as lol
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

const findHistoricoPagos = async (year) => {
    const yearParam = parseInt(year) || new Date().getFullYear();

    const sql = `
        SELECT
            MONTH(alp.fecha) as mes,
            us.campus,
            SUM(alp.monto_registrado) as total_mes
        FROM alumno_pagos alp
        JOIN users us ON us.id = alp.alumno_id
        WHERE YEAR(alp.fecha) = ?
        GROUP BY MONTH(alp.fecha), us.campus
        ORDER BY mes ASC, us.campus ASC
    `;

    return await query(sql, [yearParam]);
};

// ========================================
// STATS DE RECARGOS
// ========================================

const findRecargosCampus = async (campus) => {
    const isTotal = campus === 'total';
    const sql = `
        SELECT COALESCE(SUM(ap.monto_registrado), 0) AS total_recargos
        FROM alumno_pagos ap
        JOIN alumno al ON ap.alumno_id = al.user_id
        JOIN users u ON al.user_id = u.id
        WHERE ${isTotal ? '1=1' : 'u.campus = ?'}
          AND ap.tipo = 3
          AND MONTH(ap.fecha) = MONTH(CURDATE())
          AND YEAR(ap.fecha) = YEAR(CURDATE())
    `;
    const rows = await query(sql, isTotal ? [] : [campus]);
    const totalConRecargo = Number(rows[0]?.total_recargos || 0);
    // Solo el extra del recargo: monto_registrado = base * 1.10, entonces extra = total * 0.10/1.10
    return { total_recargos: totalConRecargo * RECARGO_PORCENTAJE / (1 + RECARGO_PORCENTAJE) };
};

const findRecargosEsperadosCampus = async (campus) => {
    const isTotal = campus === 'total';
    const sql = `
        SELECT
            COUNT(*) AS cantidad,
            COALESCE(SUM(al.mensualidad * ?), 0) AS estimado
        FROM alumno al
        JOIN users u ON al.user_id = u.id
        WHERE ${isTotal ? '1=1' : 'u.campus = ?'}
          AND al.estado != 0
          AND al.user_id NOT IN (
              SELECT alumno_id FROM alumno_pagos
              WHERE MONTH(fecha) = MONTH(CURDATE())
              AND YEAR(fecha) = YEAR(CURDATE())
          )
          AND DAY(CURDATE()) > ?
    `;
    const params = isTotal
        ? [RECARGO_PORCENTAJE, DIA_LIMITE_PAGO]
        : [RECARGO_PORCENTAJE, campus, DIA_LIMITE_PAGO];
    const rows = await query(sql, params);
    return {
        cantidad: Number(rows[0]?.cantidad || 0),
        estimado: Number(rows[0]?.estimado || 0)
    };
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
    findHistoricoPagos,
    // Recargos
    findRecargosCampus,
    findRecargosEsperadosCampus
};