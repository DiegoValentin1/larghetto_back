const {query} = require('../../../utils/mysql');

const findAllPromocion = async()=>{
    const sql = `SELECT * FROM promocion`;
    return await query(sql, []);
}

const save = async(promocion)=>{
    if(!promocion.promocion) throw Error("Missing fields");
    const sql = `INSERT INTO promocion(promocion) VALUES(?)`;
    const {insertedId} = await query(sql, [promocion.promocion]);

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

    const sql = `UPDATE promocion SET promocion=? WHERE id=?;`;

    await query(sql, [
        promocion.promocion,
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

module.exports = {findAllPromocion , save, update , remove /*, findAllAdmin*/};