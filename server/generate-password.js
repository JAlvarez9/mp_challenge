/**
 * Script para generar hash de contraseña con bcrypt
 * Ejecutar con: node generate-password.js
 */

const bcrypt = require("bcrypt");

const password = "123456";
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) {
    console.error("Error al generar hash:", err);
    return;
  }

  console.log("\n========================================");
  console.log("HASH DE CONTRASEÑA GENERADO");
  console.log("========================================\n");
  console.log("Password original:", password);
  console.log("\nHash bcrypt:");
  console.log(hash);
  console.log("\n========================================");
  console.log("SQL para insertar usuario:");
  console.log("========================================\n");
  console.log(`EXEC sp_crear_usuario 
    @nombre = 'Administrador', 
    @email = 'admin@test.com', 
    @password = '${hash}', 
    @rol = 'ADMIN';`);
  console.log("\n");
});
