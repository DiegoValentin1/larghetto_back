const {query} = require('../../../utils/mysql');

const findAll = async()=>{
    const sql = `SELECT pe.*, us.email, us.role, us.status , us.id as user_id
    FROM personal pe join users us on us.personal_id=pe.id`;
    return await query(sql, []);
}

const findAllStudent = async()=>{
    const sql = `SELECT pe.*, us.email, us.role, us.status , us.id as id_user, al.*, ins.instrumento, personal_maestro.name as maestro
    FROM personal pe 
    join users us on us.personal_id=pe.id 
    join alumno al on al.user_id=us.id
    join instrumento ins on ins.id=instrumento_id
    join users maestro on al.maestro_id=maestro.id
    join personal personal_maestro on maestro.personal_id=personal_maestro.id
    WHERE us.role='ALUMNO'`;
    return await query(sql, []);
}

const findAllTeacher = async()=>{
    const sql = `SELECT pe.*, us.email, us.role, us.status , us.id as user_id
    FROM personal pe join users us on us.personal_id=pe.id WHERE us.role='MAESTRO'`;
    return await query(sql, []);
}

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

const save = async(person)=>{
    if(!person.name || !person.lastname || !person.birthday || !person.salary || !person.position) throw Error("Missing fields");
    const sql = `INSERT INTO personal(name, lastname, birthday, salary, position_id) VALUES(?,?,?,?,?)`;
    const {insertedId} = await query(sql, [person.name, person.lastname, person.birthday, person.salary,person.position]);

    return {...person, id:insertedId}
}

const update = async (person) => {
    //Con esto se valida que id  sea un numero
    if (Number.isNaN(person.id)) throw Error("Wrong Type");
    //Valida que el id no venga vacio, Espera que mandes un parametro, Y no uno vacio 
    if (!person.id) throw Error("Missing Fields");
    if (
        !person.name ||
        !person.email ||
        !person.role ||
        !person.user_id ||
        !person.id ||
        !person.empresa 
    ) throw Error("Missing Fields");

    const sql = `CALL UpdateUser(?, ?, ?, ?, ?, ?);`;

    await query(sql, [
        person.email, //"name":"cesar"
        person.empresa, //"lastname": "morales"
        person.user_id,
        person.id,
        person.name,
        person.role,
    ]);
    return{ ...person }
};

const remove = async(id)=>{
    if (Number.isNaN(id)) throw Error("Wrong Type"); 
    if (!id) throw Error('Missing Fields');
    const sql = `UPDATE users SET status=IF(status = true, false, true) WHERE id=?`;
    await query(sql,[id]);

    return{ idDeleted:id };
}

module.exports = {findAllStudent, findAllTeacher, findAllInstrumento /*, save, update, remove, findAllAdmin*/};