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

async function deleteClubMember(clubId, userId) {
  const query = `DELETE FROM club_members WHERE club_id = $1 AND user_id = $2`;

  const { rows } = await pool.query(query, [clubId, userId]);
  return rows;
}

async function userHasClub(name, userId) {
  const query = `
    SELECT * FROM clubs c
      INNER JOIN club_members cm ON c.id = cm.club_id
    WHERE
      c.club_name ILIKE $1
    AND
      cm.user_id = $2;
  `;

  const { rows } = await pool.query(query, [name, userId]);
  return rows.length > 0;
}

async function getClubsInfoByAdminId(adminId) {
  const query = `
    SELECT
          c.id AS club_id,
          c.club_name,
          c.club_description,
          CONCAT(u.first_name, ' ', u.last_name) AS admin_name,
          u.email AS admin_email,
          COUNT(DISTINCT cm.user_id) AS total_members,
          COUNT(DISTINCT p.id) AS total_posts,
          SUM(CASE WHEN ps.status = 'Active' THEN 1 ELSE 0 END) AS active_posts,
          SUM(CASE WHEN ps.status = 'Deleted' THEN 1 ELSE 0 END) AS deleted_posts
    FROM 
        clubs c
    LEFT JOIN 
        users u ON c.user_admin_id = u.id
    LEFT JOIN 
        club_members cm ON c.id = cm.club_id
    LEFT JOIN 
        posts p ON c.id = p.club_id
    LEFT JOIN 
        posts_status ps ON p.post_status_id = ps.id
    WHERE 
        c.user_admin_id = $1
    GROUP BY 
        c.id, c.club_name, c.club_description, u.first_name, u.last_name, u.email
    ORDER BY 
        c.club_name;
  `;

  const { rows } = await pool.query(query, [adminId]);
  return rows;
}

async function getAllClubsInfo() {
  const query = `
    SELECT
          c.id AS club_id,
          c.club_name,
          c.club_description,
          CONCAT(u.first_name, ' ', u.last_name) AS admin_name,
          u.email AS admin_email,
          COUNT(DISTINCT cm.user_id) AS total_members,
          COUNT(DISTINCT p.id) AS total_posts,
          SUM(CASE WHEN ps.status = 'Active' THEN 1 ELSE 0 END) AS active_posts,
          SUM(CASE WHEN ps.status = 'Deleted' THEN 1 ELSE 0 END) AS deleted_posts
    FROM 
        clubs c
    LEFT JOIN 
        users u ON c.user_admin_id = u.id
    LEFT JOIN 
        club_members cm ON c.id = cm.club_id
    LEFT JOIN 
        posts p ON c.id = p.club_id
    LEFT JOIN 
        posts_status ps ON p.post_status_id = ps.id
    GROUP BY 
        c.id, c.club_name, c.club_description, u.first_name, u.last_name, u.email
    ORDER BY 
        c.club_name
  `;

  const { rows } = await pool.query(query);
  return rows;
}

async function deleteClubById(clubId) {
  const query = `
    DELETE FROM clubs WHERE id = $1
  `;

  const { rows } = await pool.query(query, [clubId]);
  return rows;
}

module.exports = {
  insertClub,
  getClubByName,
  insertClubMember,
  getClubs,
  deleteClubMember,
  userHasClub,
  getClubsInfoByAdminId,
  deleteClubById,
  getAllClubsInfo
};
