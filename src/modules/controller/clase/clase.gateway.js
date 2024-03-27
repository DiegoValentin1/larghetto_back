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

module.exports = { findAllByMaestro, findHorarioAllByMaestro, findAllByMaestroCampus };