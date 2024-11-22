const pool = require('../pool');

async function insertClub(
  clubName,
  clubDescription,
  userAdminId,
  joinPassword
) {
  const { rows } = await pool.query(
    `
        INSERT INTO 
            clubs(
                club_name,
                club_description,
                user_admin_id,
                join_password
            ) 
            VALUES (
                $1,
                $2,
                $3,
                $4
            ) RETURNING id;
    `,
    [clubName, clubDescription, userAdminId, joinPassword]
  );

  return rows[0].id;
}

module.exports = {
  insertClub,
};
