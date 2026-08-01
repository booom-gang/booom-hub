import bcrypt from 'bcrypt';
import { fileURLToPath } from 'url';

const password = process.argv[2];

if (!password) {
  console.error('Usage: node scripts/hashPassword.js <password>');
  process.exit(1);
}

const SALT_ROUNDS = 12;
const hash = await bcrypt.hash(password, SALT_ROUNDS);
console.log(`\nMaster Password Hash (add this to MASTER_PASSWORD_HASH in .env):\n${hash}\n`);
