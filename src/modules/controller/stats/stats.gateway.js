const {query} = require('../../../utils/mysql');

const findAllTotal = async()=>{
    const sql = `SELECT fecha, SUM(total) as total FROM larghetto.registro_alumnos WHERE YEAR(fecha) = YEAR(CURDATE()) group by fecha`;
    return await query(sql, []);
}

const insertLog = async(log)=>{
    const sqlLog = `INSERT INTO logs (fecha, autor, accion) VALUES (CURRENT_TIMESTAMP, ?, ?)`;
    await query(sqlLog,[log.empleado, log.accion]);
}



const findAllCentro = async()=>{
    const sql = `SELECT campus, fecha, SUM(total) as total FROM registro_alumnos WHERE campus='centro' AND YEAR(fecha) = YEAR(CURDATE()) group by campus, fecha`;
    return await query(sql, []);
}

const findAllBuga = async()=>{
    const sql = `SELECT campus, fecha, SUM(total) as total FROM larghetto.registro_alumnos WHERE campus='bugambilias' AND YEAR(fecha) = YEAR(CURDATE()) group by campus, fecha`;
    return await query(sql, []);
}

const findAllCuautla = async()=>{
    const sql = `SELECT campus, fecha, SUM(total) as total FROM larghetto.registro_alumnos WHERE campus='cuautla' AND YEAR(fecha) = YEAR(CURDATE()) group by campus, fecha`;
    return await query(sql, []);
}

const findAllActual = async()=>{
    const sql = `SELECT us.campus, count(us.id) as total FROM users us JOIN alumno alu on alu.user_id=us.id WHERE us.role='ALUMNO' AND alu.estado != 0 group by us.campus`;
    return await query(sql, []);
}

const guardarActual = async()=>{
    const sql = `call InsertarRegistrosPorCampus()`;
    return await query(sql, []);
}

const findAllAlumnoPagos = async(id)=>{
    const sql = `SELECT fecha from alumno_pagos WHERE alumno_id=?`;
    return await query(sql, [id]);
}

module.exports = {findAllTotal, findAllCentro, findAllCuautla, findAllBuga, findAllActual, guardarActual, findAllAlumnoPagos, insertLog};