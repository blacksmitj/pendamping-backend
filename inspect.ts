import 'dotenv/config';
import { Client } from 'pg';

async function main() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });
    await client.connect();
    try {
        console.log('\n--- Columns for universities ---');
        const univColumns = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'universities'
        `);
        univColumns.rows.forEach(r => console.log(`${r.column_name}: ${r.data_type}`));

        console.log('\n--- Columns for participants ---');
        const participantColumns = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'participants'
        `);
        participantColumns.rows.forEach(r => console.log(`${r.column_name}: ${r.data_type}`));

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

main();
