const {query} = require('../../../utils/mysql');

const findAllInstrumento = async()=>{
    const sql = `SELECT * FROM instrumento`;
    return await query(sql, []);
}

const findById = async(id)=>{
    if (Number.isNaN(id)) throw Error("Wrong Type");
    if(!id)throw Error("Missing fields");
    const sql = `SELECT pe.*, us.email, us.role, us.status , us.id as user_id
    FROM personal pe join users us on us.personal_id=pe.id WHERE user_id=?`;

    return await query(sql, [id]);
}

const save = async(instrumento)=>{
    if(!instrumento.instrumento) throw Error("Missing fields");
    const sql = `INSERT INTO instrumento(instrumento) VALUES(?)`;
    const {insertedId} = await query(sql, [instrumento.instrumento]);

    return {...instrumento, id:insertedId}
}

const update = async (instrumento) => {
    //Con esto se valida que id  sea un numero
    if (Number.isNaN(instrumento.id)) throw Error("Wrong Type");
    //Valida que el id no venga vacio, Espera que mandes un parametro, Y no uno vacio 
    if (!instrumento.id) throw Error("Missing Fields");
    if (
        !instrumento.instrumento
    ) throw Error("Missing Fields");

    const sql = `UPDATE instrumento SET instrumento=? WHERE id=?;`;

    await query(sql, [
        instrumento.instrumento,
        instrumento.id,
    ]);
    return{ ...instrumento }
};

const remove = async(id)=>{
    if (Number.isNaN(id)) throw Error("Wrong Type"); 
    if (!id) throw Error('Missing Fields');
    const sql = `UPDATE instrumento SET status=IF(status = true, false, true) WHERE id=?`;
    await query(sql,[id]);

    return{ idDeleted:id };
}

module.exports = {findAllInstrumento , save, update , remove /*, findAllAdmin*/};