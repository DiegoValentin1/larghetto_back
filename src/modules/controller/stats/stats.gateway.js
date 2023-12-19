const {query} = require('../../../utils/mysql');

const findAllTotal = async()=>{
    const sql = `SELECT fecha, SUM(total) as total FROM registro_alumnos group by fecha`;
    return await query(sql, []);
}

const findAllCentro = async()=>{
    const sql = `SELECT campus, fecha, SUM(total) as total FROM registro_alumnos WHERE campus='centro' group by campus, fecha`;
    return await query(sql, []);
}

const findAllBuga = async()=>{
    const sql = `SELECT campus, fecha, SUM(total) as total FROM larghetto.registro_alumnos WHERE campus='bugambilias' group by campus, fecha`;
    return await query(sql, []);
}

const findAllCuautla = async()=>{
    const sql = `SELECT campus, fecha, SUM(total) as total FROM larghetto.registro_alumnos WHERE campus='cuautla' group by campus, fecha`;
    return await query(sql, []);
}

const findAllActual = async()=>{
    const sql = `SELECT campus, count(id) as total FROM users WHERE role='ALUMNO' group by campus`;
    return await query(sql, []);
}

module.exports = {findAllTotal, findAllCentro, findAllCuautla, findAllBuga, findAllActual};