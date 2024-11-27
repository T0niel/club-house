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

  const { rows } = await pool.query(query, [
    firstName,
    lastName,
    email,
    password,
    userRole,
  ]);
  return rows[0];
}

async function findUser(email) {
  const query = 'SELECT * FROM users WHERE email = $1';

  const { rows } = await pool.query(query, [email]);
  return rows[0];
}

async function findUserById(id) {
  const query = 'SELECT * FROM users WHERE id = $1';

  const { rows } = await pool.query(query, [id]);
  return rows[0];
}

async function getAllUsersInfo() {
  const query = `
    SELECT
      u.first_name,
      u.last_name,
      u.email,
      u.id,
      SUM(
        CASE
          WHEN cm.club_id IS NULL THEN 0
          ELSE 1
        END
      ) AS clubs_joined,
      SUM(
        CASE
          WHEN c.user_admin_id = u.id THEN 1
          ELSE 0
        END
      ) AS clubs_created,
      SUM(
        CASE
          WHEN p.id IS NOT NULL THEN 1
          ELSE 0
        END
      ) AS posts_created,
      CASE
        WHEN u.user_role_id = 1 THEN TRUE
        ELSE FALSE
      END AS is_admin,
      CASE
        WHEN u.user_status_id = 1 THEN 'Active'
        ELSE 'Banned'
      END AS user_status
    FROM
      users u
      LEFT JOIN club_members cm ON cm.user_id = u.id
      LEFT JOIN clubs c ON cm.club_id = c.id
      LEFT JOIN posts p ON p.club_id = c.id AND p.user_id = u.id
    GROUP BY
      u.first_name,
      u.last_name,
      u.email,
      u.user_role_id,
      u.id;
  `;

  const { rows } = await pool.query(query);
  return rows;
}

async function updateUserStatus(userId, statusId) {
  const query = `
        UPDATE users u SET user_status_id = $1 WHERE u.id = $2 
    `;

  const { rows } = await pool.query(query, [statusId, userId]);
  return rows;
}

module.exports = {
  insertUser,
  findUser,
  findUserById,
  getAllUsersInfo,
  updateUserStatus,
};
