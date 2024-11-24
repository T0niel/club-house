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
        VALUES (
                $1,
                $2,
                $3,
                $4,
                $5
            )
    `;

    const {rows} = await pool.query(query, [title, description, creationDate, userId, clubId]);
}

async function getAllPostsAndUsers(){
    const query = `
        SELECT
            *
        FROM
            posts p
        INNER JOIN users u ON p.user_id = u.id
            ORDER BY
        creation_date;
    `;
    const {rows} = await pool.query(query);

    return rows;
}

module.exports = {
  insertPost,
  getAllPostsAndUsers,
};
