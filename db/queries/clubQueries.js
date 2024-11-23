const pool = require('../pool');

async function insertClub(
  clubName,
  clubDescription,
  userAdminId,
  joinPassword
) {
  const query = `
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
    `;
  const { rows } = await pool.query(query, [
    clubName,
    clubDescription,
    userAdminId,
    joinPassword,
  ]);

  return rows[0].id;
}

async function getClubByName(name) {
  const query = `SELECT * FROM clubs WHERE club_name ILIKE $1`;

  const { rows } = await pool.query(query, [name]);
  return rows[0];
}

async function clubExists(name) {
  return !!(await getClubByName(name));
}

async function insertClubMember(clubId, userId) {
  const query = `
        INSERT INTO 
            club_members(
                club_id,
                user_id
            ) 
            VALUES (
                $1,
                $2
            );
  `;

  const { rows } = await pool.query(query, [clubId, userId]);
  return rows;
}

async function getClubs(userId) {
  const query = `
    SELECT * FROM clubs c
      INNER JOIN club_members cm ON c.id = cm.club_id
    WHERE
      cm.user_id = $1;
  `;

  const { rows } = await pool.query(query, [userId]);
  return rows;
}

async function deleteClubMember(clubId, userId){
  const query = `DELETE FROM club_members WHERE club_id = $1 AND user_id = $2`;

  const {rows} = await pool.query(query, [clubId, userId]);
  return rows;
}

async function userHasClub(name, userId){
  const query = `
    SELECT * FROM clubs c
      INNER JOIN club_members cm ON c.id = cm.club_id
    WHERE
      c.club_name ILIKE $1
    AND
      cm.user_id = $2;
  `;

  const {rows} = await pool.query(query, [name, userId]);
  return rows.length > 0;
}

module.exports = {
  insertClub,
  clubExists,
  getClubByName,
  insertClubMember,
  getClubs,
  deleteClubMember,
  userHasClub
};
