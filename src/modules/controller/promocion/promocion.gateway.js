const {query} = require('../../../utils/mysql');

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
    const sql = `INSERT INTO promocion(promocion, descuento, fecha_inicio, fecha_fin) VALUES(?,?,?,?)`;
    const {insertedId} = await query(sql, [
        promocion.promocion,
        promocion.descuento,
        promocion.fecha_inicio || null,
        promocion.fecha_fin || null
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

    const sql = `UPDATE promocion SET promocion=?, descuento=?, fecha_inicio=?, fecha_fin=? WHERE id=?;`;

    await query(sql, [
        promocion.promocion,
        promocion.descuento,
        promocion.fecha_inicio || null,
        promocion.fecha_fin || null,
        promocion.id,
    ]);
    return{ ...promocion }
};

const remove = async(id)=>{
    if (Number.isNaN(id)) throw Error("Wrong Type");
    if (!id) throw Error('Missing Fields');
    const sql = `UPDATE promocion SET status=IF(status = true, false, true) WHERE id=?`;
    await query(sql,[id]);

    return{ idDeleted:id };
}

// ========================================
// ELIMINACIÓN SEGURA DE PROMOCIONES
// ========================================

const deleteFisicaPromocion = async (id) => {
    if (Number.isNaN(id)) throw Error("Wrong Type");
    if (!id) throw Error('Missing Fields');

    // 1. Verificar si hay alumnos usando la promoción
    const sqlCheck = `SELECT COUNT(*) as count FROM alumno WHERE promocion_id = ?`;
    const result = await query(sqlCheck, [id]);
    const count = result[0].count;

    if (count > 0) {
        // Si hay alumnos usando la promoción, solo inactivar
        const sqlInactivar = `UPDATE promocion SET status = 0 WHERE id = ?`;
        await query(sqlInactivar, [id]);

        return {
            deleted: false,
            inactivated: true,
            message: `No se puede eliminar. La promoción está asignada a ${count} alumno(s). Se ha inactivado en su lugar.`,
            alumnos_afectados: count
        };
    }

    // 2. Si no hay alumnos, eliminar físicamente
    const sqlDelete = `DELETE FROM promocion WHERE id = ?`;
    await query(sqlDelete, [id]);

    return {
        deleted: true,
        inactivated: false,
        message: 'Promoción eliminada exitosamente',
        idDeleted: id
    };
};

module.exports = {findAllPromocion , save, update , remove, deleteFisicaPromocion};