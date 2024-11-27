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