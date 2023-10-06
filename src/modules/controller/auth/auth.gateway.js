const { query } = require("../../../utils/mysql");
const { generateToken } = require("../../../config/jwt");
const { validatePassword, hashPassword } = require("../../../utils/functions");

const login = async (user) => {
    const { email, password } = user;
    if (!email || !password) throw Error('Missing fields');
    const sql = `SELECT * FROM users join personal on users.personal_id = personal.id WHERE email=? AND users.status=1`;
    const existUser = await query(sql, [email]);
    console.log(existUser);
    if (
        await validatePassword(password, existUser[0].password)
    )
        return {
            token: generateToken({
                id: existUser[0].id,
                email: existUser[0].email,
                role: existUser[0].role,
                isLogged: true
            }), 
            role: existUser[0].role,
            name:existUser[0].name,
            empresa:existUser[0].empresa

        }
    throw Error('Password missmatch');
}

const signup = async (user) => {
    const { email, password, role, name, empresa } = user;
    if (!email || !password || !role || !name || !empresa) throw Error('Missing fields');
    const hashedPassword = await hashPassword(password);
    const sql = `CALL InsertUser(?, ?, ?, ?, ?);`;
    await query(sql, [email, hashedPassword, role, name, empresa]);
}

module.exports = {
    login, signup
}