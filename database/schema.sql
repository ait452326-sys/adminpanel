CREATE DATABASE IF NOT EXISTS admin_panel_db
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE admin_panel_db;

CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  full_name VARCHAR(100) NOT NULL,
  username VARCHAR(30) NOT NULL,
  email VARCHAR(254) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_username (username),
  UNIQUE KEY uq_users_email (email),
  KEY idx_users_created_at (created_at)
) ENGINE=InnoDB;

-- express-mysql-session creates and maintains its own sessions table
-- automatically when the server starts. No manual session-table SQL is needed.
