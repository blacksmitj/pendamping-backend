import 'dotenv/config';
import { Client } from 'pg';

async function main() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });
    await client.connect();
    try {
        console.log('Checking for missing columns...');
        
        // Check universities status
        const univStatusCheck = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'universities' AND column_name = 'status'
        `);
        
        if (univStatusCheck.rows.length === 0) {
            console.log('Adding status column to universities...');
            await client.query("ALTER TABLE universities ADD COLUMN status VARCHAR(25) DEFAULT 'active' NOT NULL");
            console.log('Status column added to universities.');
        } else {
            console.log('Status column already exists in universities.');
        }

        // Check for other discrepancies
        // In the inspection, I saw participants had university_id but schema didn't.
        // Let's check if it should be there.
        
    } catch (err) {
        console.error('Error fixing schema:', err);
    } finally {
        await client.end();
    }
}

main();
