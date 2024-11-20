const pool = require('../pool');

async function insertUser(firstName, lastName, email, password) {
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

    const {rows} = await pool.query(query, [firstName, lastName, email, password, 1]);
    return rows[0];
}

async function userExists(email){
    const query = `SELECT * FROM users WHERE email = $1`;

    const {rows} = await pool.query(query, [email]);
    return rows.length >= 1;
}

module.exports = {
  insertUser,
  userExists
};
