const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const readline = require('readline');
const dotenv = require('dotenv');

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function createSuperadmin() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    const [rows] = await connection.query('SELECT * FROM users WHERE role = "superadmin"');
    if (rows.length === 0) {
      console.log('Creating superadmin:');
      
      const username = await question('Enter superadmin username: ');
      const password = await question('Enter superadmin password: ');

      const hashedPassword = await bcrypt.hash(password, 10);
      await connection.query('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [username, hashedPassword, 'superadmin']);
      console.log('Superadmin created successfully.');
    } else {
      console.log('Superadmin already exists.');
    }

    await connection.end();
    rl.close();
  } catch (error) {
    console.error('Error creating superadmin:', error);
    rl.close();
    process.exit(1);
  }
}

createSuperadmin();