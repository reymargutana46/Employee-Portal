# 🔩 Full Stack Project – Laravel API + React TypeScript

This project consists of:

* `server/` – Laravel API backend (PHP + SQLite)
* `web/` – React frontend (TypeScript + Vite)

---

## ⚙️ Backend Setup – Laravel API (`server/`)

### 1. Navigate to the backend folder

```bash
cd server
```

### 2. Install PHP dependencies

```bash
composer install
```

### 3. Create `.env` file

```bash
cp .env.example .env
```

### 4. Configure the `.env` file

Update the database section in `.env` to:

```env
DB_CONNECTION=sqlite
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=emport.db
DB_USERNAME=root
DB_PASSWORD=
```

### 5. Create the SQLite database file

```bash
touch emport.db
```

Make sure this file is located in the `server/` directory (same level as `.env`).

### 6. Generate the application key

```bash
php artisan key:generate
```

### 7. To create the symbolic link

```bash
php artisan storage:link
```

### 8. Run migrations and seed the database

```bash
php artisan migrate:fresh --seed
php artisan db:seed --class=RoomSeeder
```

### 9. Start the Laravel development server

```bash
php artisan serve
```

---

## 💻 Frontend Setup – React TypeScript (`web/`)

### 1. Navigate to the frontend folder

```bash
cd ../web
```

### 2. Install Node dependencies

```bash
npm install
```

### 3. Start the development server

```bash
npm run dev
```


---

## ✅ Prerequisites

Make sure you have the following installed:

* PHP 8.x
* Composer
* Node.js (v16+ recommended)
* npm

---

## 📝 Notes

* API base URL in the frontend should match your Laravel server (`http://127.0.0.1:8000`). Configure it in your frontend `.env` or API service.
* SQLite is used for simplicity. You can switch to MySQL or Postgres if needed by updating the `.env`.

---
