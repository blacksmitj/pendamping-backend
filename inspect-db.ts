import 'dotenv/config';
import { Client } from 'pg';

async function main() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });
    await client.connect();
    try {
        console.log('--- Tables ---');
        const tables = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        console.log(tables.rows.map(r => r.table_name).join(', '));

        console.log('\n--- Columns for universities ---');
        const univColumns = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'universities'
        `);
        univColumns.rows.forEach(r => console.log(`${r.column_name}: ${r.data_type}`));

        console.log('\n--- Columns for profiles ---');
        const profileColumns = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'profiles'
        `);
        profileColumns.rows.forEach(r => console.log(`${r.column_name}: ${r.data_type}`));

        console.log('\n--- Columns for participants ---');
        const participantColumns = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'participants'
        `);
        participantColumns.rows.forEach(r => console.log(`${r.column_name}: ${r.data_type}`));

        console.log('\n--- Columns for roles ---');
        const roleColumns = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'roles'
        `);
        roleColumns.rows.forEach(r => console.log(`${r.column_name}: ${r.data_type}`));

        console.log('\n--- Columns for users ---');
        const userColumns = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'users'
        `);
        userColumns.rows.forEach(r => console.log(`${r.column_name}: ${r.data_type}`));

        console.log('\n--- Columns for mentor_participants ---');
        const mpColumns = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'mentor_participants'
        `);
        mpColumns.rows.forEach(r => console.log(`${r.column_name}: ${r.data_type}`));

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

main();
