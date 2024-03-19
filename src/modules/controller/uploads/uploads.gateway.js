const { query } = require('../../../utils/mysql');

const findImg = async (id) => {
    const sql = `SELECT path from alumno_img WHERE alumno_id=?`;
    return await query(sql, [id]);
}

const saveImg = async (alumno) => {
    const sql2 = `DELETE FROM alumno_img WHERE alumno_id=?`;
    await query(sql2, [alumno.id]);
    const sql = `INSERT INTO alumno_img (path, alumno_id) values (?,?)`;
    return await query(sql, [alumno.filename, alumno.id]);
}


module.exports = { findImg, saveImg };