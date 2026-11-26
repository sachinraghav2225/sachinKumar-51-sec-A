# Student API (Node.js + Express + MongoDB)

JWT-protected REST API with role-based access control.

| Role    | Permissions                                                        |
|---------|--------------------------------------------------------------------|
| admin   | Create, read (all / one), update, delete any student               |
| student | Read own profile; update only `name`, `phone`, `address`, `dateOfBirth` |

## Setup
```bash
npm install
cp .env.example .env      # then edit MONGO_URI and JWT_SECRET
npm run seed:admin        # creates the first admin account
npm run dev               # or: npm start
```

## Endpoints
| Method | Route                       | Access  | Description                  |
|--------|-----------------------------|---------|------------------------------|
| POST   | /api/auth/login             | Public  | Get JWT token                |
| PUT    | /api/auth/change-password   | Any user| Change own password          |
| POST   | /api/students               | Admin   | Create student (+ login)     |
| GET    | /api/students               | Admin   | List (page, limit, search)   |
| GET    | /api/students/:id           | Admin   | Get one student              |
| PUT    | /api/students/:id           | Admin   | Update any student           |
| DELETE | /api/students/:id           | Admin   | Delete student + account     |
| GET    | /api/students/me            | Student | View own record              |
| PUT    | /api/students/me            | Student | Update own limited fields    |

Send the token as: `Authorization: Bearer <token>`

## Example requests
```bash
# Login as admin
curl -X POST localhost:5000/api/auth/login -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Admin@12345"}'

# Create a student (admin token)
curl -X POST localhost:5000/api/students -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Ravi Kumar","email":"ravi@example.com","password":"ravi123","rollNumber":"CS101","course":"B.Tech CS"}'

# Student updates own phone
curl -X PUT localhost:5000/api/students/me -H "Authorization: Bearer $STUDENT_TOKEN" \
  -H "Content-Type: application/json" -d '{"phone":"9876543210"}'
```
