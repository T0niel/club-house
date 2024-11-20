const { Client } = require('pg');
const dbConnectionString = process.argv[2];

const client = new Client({
  connectionString: dbConnectionString,
});

const sql = `
CREATE TABLE
    IF NOT EXISTS user_roles (
        id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        role_name VARCHAR(255)
    );

CREATE TABLE
    IF NOT EXISTS users (
        id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        user_role_id BIGINT,
        FOREIGN KEY (user_role_id) REFERENCES user_roles (id)
    );

CREATE TABLE
    IF NOT EXISTS clubs (
        id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        club_name VARCHAR(100) NOT NULL,
        club_description TEXT NOT NULL,
        user_admin_id BIGINT NOT NULL,
        join_password VARCHAR(255) NOT NULL,
        FOREIGN KEY (user_admin_id) REFERENCES users (id)
    );

CREATE TABLE
    IF NOT EXISTS club_members (
        club_id BIGINT,
        user_id BIGINT,
        PRIMARY KEY (club_id, user_id),

        FOREIGN KEY (club_id) REFERENCES clubs (id),
        FOREIGN KEY (user_id) REFERENCES users (id)
    );

CREATE TABLE
    IF NOT EXISTS messages (
        id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        title VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        creation_date TIMESTAMP NOT NULL,
        user_id BIGINT NOT NULL,
        club_id BIGINT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (club_id) REFERENCES clubs (id)
    );
 
INSERT INTO
    user_roles (
        role_name
    )
VALUES
    ('admin'),
    ('user')`;

async function main() {
  console.log('Seeding...');
  await client.connect();
  await client.query(sql);
  await client.end();
  console.log('Done.');
}

main();
