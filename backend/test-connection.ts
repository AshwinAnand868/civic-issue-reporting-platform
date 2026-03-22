import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '.env') });

async function testConnection() {
    console.log('Testing connection to Voice Service...');
    console.log('VOICE_SERVICE_URL:', process.env.VOICE_SERVICE_URL);
    
    try {
        const res = await axios.get(process.env.VOICE_SERVICE_URL || 'http://127.0.0.1:8001');
        console.log('Connection Successful:', res.data);
    } catch (err: any) {
        console.error('Connection Failed!');
        if (err.response) {
            console.error('Error Response:', err.response.status, err.response.data);
        } else {
            console.error('Error Message:', err.message);
        }
    }
}

testConnection();
