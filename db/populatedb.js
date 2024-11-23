const { Client } = require('pg');
const bcrypt = require('bcryptjs');
const util = require('util');

const hashAsync = util.promisify(bcrypt.hash);
const args = process.argv.slice(2);

const dbConnectionString = args[0];
let adminInfo = {};

try {
  adminInfo = JSON.parse(args[1]);
} catch (err) {
  console.error('Invalid JSON object:', err);
}

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
        club_name VARCHAR(100) UNIQUE NOT NULL,
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
    IF NOT EXISTS posts (
        id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        title VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        creation_date TIMESTAMP NOT NULL,
        user_id BIGINT NOT NULL,
        club_id BIGINT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (club_id) REFERENCES clubs (id)
    );

-- This is for storing sessions

CREATE TABLE "session" (
  "sid" varchar NOT NULL COLLATE "default",
  "sess" json NOT NULL,
  "expire" timestamp(6) NOT NULL
)
WITH (OIDS=FALSE);

ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;

CREATE INDEX "IDX_session_expire" ON "session" ("expire");
 
INSERT INTO
    user_roles (
        role_name
    )
VALUES
    ('admin'),
    ('user');
       
`;

const insertAdmin = `
INSERT INTO
    users (
        first_name,
        last_name,
        email,
        password,
        user_role_id
    )
    VALUES
        ($1, $2, $3, $4, $5);
`;

const insertGeneralClub = `
INSERT INTO
    clubs (
        club_name,
        club_description,
        user_admin_id,
        join_password
    )
VALUES
    ('General', 'General club', 1, ''); 
`;

const insertClubMembers = `
INSERT INTO
    club_members (
        club_id,
        user_id
    )
VALUES
    (1, 1);
`

async function main() {
  console.log('Seeding...');
  await client.connect();
  await client.query(sql);
  const password = await hashAsync(adminInfo.password, 10);
  await client.query(insertAdmin, [
    adminInfo.firstName,
    adminInfo.lastName,
    adminInfo.email,
    password,
    1,
  ]);
  await client.query(insertGeneralClub);
  await client.query(insertClubMembers);
  await client.end();
  console.log('Done.');
}

main();
