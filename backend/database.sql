-- ================================================
-- Script de base de datos: gestor_tareas
-- ================================================

-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS gestor_tareas
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE gestor_tareas;

-- ------------------------------------------------
-- Tabla: usuarios
-- ------------------------------------------------
CREATE TABLE IF NOT EXISTS usuarios (
  id       INT AUTO_INCREMENT PRIMARY KEY,
  correo   VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL
);

-- ------------------------------------------------
-- Tabla: tareas
-- ------------------------------------------------
CREATE TABLE IF NOT EXISTS tareas (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  titulo     VARCHAR(255) NOT NULL,
  id_usuario INT NOT NULL,
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id)
    ON DELETE CASCADE
);
