import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function runMigrations() {
  try {
    const { stdout, stderr } = await execAsync('npx migrate-mongo up');
    console.log('Migration Output:\n', stdout);
    if (stderr) console.error('Migration Errors:\n', stderr);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1); // optional: exit if migrations fail
  }
}
