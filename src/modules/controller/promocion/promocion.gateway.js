const {query, getConnection} = require('../../../utils/mysql');

const findAllPromocion = async()=>{
    const sql = `
        SELECT *,
        CASE
            WHEN fecha_fin IS NULL THEN TRUE
            WHEN fecha_inicio IS NULL THEN TRUE
            WHEN CURDATE() BETWEEN fecha_inicio AND fecha_fin THEN TRUE
            ELSE FALSE
        END as vigente
        FROM promocion
    `;
    return await query(sql, []);
}

const save = async(promocion)=>{
    if(!promocion.promocion) throw Error("Missing fields");
    const sql = `INSERT INTO promocion(promocion, descuento, fecha_inicio, fecha_fin, duracion_meses) VALUES(?,?,?,?,?)`;
    const {insertedId} = await query(sql, [
        promocion.promocion,
        promocion.descuento,
        promocion.fecha_inicio || null,
        promocion.fecha_fin || null,
        promocion.duracion_meses || null
    ]);

    return {...promocion, id:insertedId}
}

const update = async (promocion) => {
    //Con esto se valida que id  sea un numero
    if (Number.isNaN(promocion.id)) throw Error("Wrong Type");
    //Valida que el id no venga vacio, Espera que mandes un parametro, Y no uno vacio
    if (!promocion.id) throw Error("Missing Fields");
    if (
        !promocion.promocion
    ) throw Error("Missing Fields");

    const sql = `UPDATE promocion SET promocion=?, descuento=?, fecha_inicio=?, fecha_fin=?, duracion_meses=? WHERE id=?;`;

    await query(sql, [
        promocion.promocion,
        promocion.descuento,
        promocion.fecha_inicio || null,
        promocion.fecha_fin || null,
        promocion.duracion_meses || null,
        promocion.id,
    ]);
    return{ ...promocion }
};

const remove = async(id)=>{
    if (Number.isNaN(id)) throw Error("Wrong Type");
    if (!id) throw Error('Missing Fields');
    if (parseInt(id) === 1) throw Object.assign(Error("La promoción 'Sin Promoción' no puede ser eliminada"), { statusCode: 400 });
    const sql = `UPDATE promocion SET status=IF(status = true, false, true) WHERE id=?`;
    await query(sql,[id]);

    return{ idDeleted:id };
}

// ========================================
// ELIMINACIÓN FÍSICA DE PROMOCIONES
// ========================================

const deleteFisicaPromocion = async (id) => {
    if (Number.isNaN(id)) throw Error("Wrong Type");
    if (!id) throw Error('Missing Fields');
    if (parseInt(id) === 1) throw Object.assign(Error("La promoción 'Sin Promoción' no puede ser eliminada"), { statusCode: 400 });

    const conn = await getConnection();
    const promiseConn = conn.promise();

    try {
        await promiseConn.beginTransaction();

        // 1. Reasignar alumnos afectados a "Sin Promoción" (id=1)
        const [updateResult] = await promiseConn.query(
            'UPDATE alumno SET promocion_id = 1 WHERE promocion_id = ?',
            [id]
        );

        // 2. Eliminar físicamente la promoción
        await promiseConn.query('DELETE FROM promocion WHERE id = ?', [id]);

        await promiseConn.commit();

        return {
            success: true,
            eliminada: true,
            alumnosReasignados: updateResult.affectedRows
        };
    } catch (error) {
        await promiseConn.rollback();
        throw error;
    } finally {
        conn.release();
    }
};

module.exports = {findAllPromocion , save, update , remove, deleteFisicaPromocion};