const pool = require('../pool');

async function insertPost(title, description, creationDate, userId, clubId) {
  const query = `
    INSERT INTO
        posts (
            title,
            description,
            creation_date,
            user_id,
            club_id
        )
    VALUES
        ($1, $2, $3, $4, $5)
  `;

  const { rows } = await pool.query(query, [
    title,
    description,
    creationDate,
    userId,
    clubId,
  ]);
}

async function getAllPostsAndUsers(clubId) {
  const query = `
    SELECT
        *, 
        p.id AS post_id
    FROM
        posts p
    INNER JOIN 
        users u 
        ON p.user_id = u.id
    INNER JOIN 
        posts_status ps 
        ON p.post_status_id = ps.id
    WHERE p.club_id = $1
    ORDER BY
        creation_date
  `;

  const { rows } = await pool.query(query, [clubId]);

  return rows;
}

async function setPostStatusToDeleted(id) {
  const query = `
    UPDATE 
        posts
    SET 
        post_status_id = 2
    WHERE 
        id = $1
  `;

  const { rows } = await pool.query(query, [id]);

  return rows;
}

async function userHasPost(userId, postId) {
  const query = `
        SELECT 
            * 
        FROM 
            posts 
        WHERE 
            user_id = $1 
            AND id = $2
    `;

  const { rows } = await pool.query(query, [userId, postId]);
  return rows.length;
}

module.exports = {
  insertPost,
  getAllPostsAndUsers,
  setPostStatusToDeleted,
  userHasPost,
};
