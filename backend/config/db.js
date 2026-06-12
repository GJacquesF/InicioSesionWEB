// Importa la librería para MySQL
const mysql = require('mysql2');

// Crea la conexión con la base de datos
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'gestor_tareas'
});

// Intenta conectarse
connection.connect((error) => {
  if (error) {
    console.log("Error de conexión:", error.message);
    return;
  }
  console.log("Conectado a MySQL correctamente");
});

// Exporta la conexión
module.exports = connection;
