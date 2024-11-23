const pool = require('../pool');

async function insertUser(firstName, lastName, email, password, userRole) {
  const query = `
        INSERT INTO
            users (
                first_name,
                last_name,
                email,
                password,
                user_role_id
            )
        VALUES
            ($1, $2, $3, $4, $5)
        RETURNING id`;

    const {rows} = await pool.query(query, [firstName, lastName, email, password, userRole]);
    return rows[0];
}

async function userExists(email){
    const query = `SELECT * FROM users WHERE email = $1`;

    const {rows} = await pool.query(query, [email]);
    return rows.length >= 1;
}

async function findUser(email){
    const query = 'SELECT * FROM users WHERE email = $1';

    const {rows} = await pool.query(query, [email]);
    return rows[0];
}

async function findUserById(id){
    const query = 'SELECT * FROM users WHERE id = $1';

    const {rows} = await pool.query(query, [id]);
    return rows[0];
}

module.exports = {
  insertUser,
  userExists,
  findUser,
  findUserById
};
