# Shared MySQL Setup

## 1) Create database and user (run once on MySQL server)
```sql
CREATE DATABASE smartcampusdb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'smartcampus_user'@'%' IDENTIFIED BY 'StrongPass123!';
GRANT ALL PRIVILEGES ON smartcampusdb.* TO 'smartcampus_user'@'%';
FLUSH PRIVILEGES;
```

## 2) Set environment variables (each team member)
```powershell
$env:DB_URL="jdbc:mysql://<SHARED_HOST>:3306/smartcampusdb?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Colombo"
$env:DB_USERNAME="smartcampus_user"
$env:DB_PASSWORD="StrongPass123!"
```

If you use the default credentials above, you can skip the env vars and just run the backend with `shared` or `local` profile.

## 3) Run backend with shared profile
```powershell
cd backend/smartcampus
.\run-backend.ps1 -Profile shared
```

## 4) Run backend with local MySQL profile
```powershell
.\run-backend.ps1 -Profile local
```

Both profiles now use MySQL only. There is no H2 fallback or H2 console anymore. `shared` reads the DB settings from environment variables, while `local` points to `localhost` by default.
