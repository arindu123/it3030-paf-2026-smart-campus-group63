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

## 3) Run backend with shared profile
```powershell
cd backend/smartcampus
.\run-backend.ps1
```

## 4) One-time upgrade for existing databases
If your `users.provider` column was created before GitHub login support, run this once:

```sql
USE smartcampusdb;
ALTER TABLE users
	MODIFY COLUMN provider ENUM('LOCAL','GOOGLE','GITHUB') NULL;
```
