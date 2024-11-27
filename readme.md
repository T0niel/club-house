# LIVE AT RENDER (YOU ARE GOING TO WAIT 50 SECONDS FOR THE PROJECT TO LOAD IM USING A FREE PLAN BECAUSE IM POOR)
## https://club-house-07bi.onrender.com

## Project overview
Club house project is a project where users can create clubs (like groups) where other users can join
and they can together post content where only members of that club can view, the owner of that club
can delete the posts, and the users can leave the club if they want to.

I've also implemented a admin which will be able to view the clubs and the users and ban the users.

# Run localy

## Requirements

- Node.js
- PostgreSQL

## Setup

### 1. Install Dependencies

First, install the necessary dependencies by running:

```bash
npm install
```

### 2. Create Database

```sql
CREATE DATABASE club_house_db;
```

### 3. Configure Environment Variables

Create .env at the root of the project

- Provide port (optional)
- Database url
- Session secret

## Make sure you change this with your information

```env
PORT=3000
DB_CONNECTION_STRING = postgres://username:password@localhost:5432/club_house_db
SESSION_SECRET = 12345678

```

### 4. Populate the database with the script provided

The json passed as the second argument is the admin information and it is required,
make sure you fill it with the information of the admin like what first name you 
want the admin to have what password and so on

```bash
node db/populatedb.js "postgres://user:password@localhost:5432/yourdatabase" '{"firstName":"Admin","lastName":"User","email":"admin@example.com","password":"adminpassword123"}'
```

### 5. Run application

```bash
npm run build
```
