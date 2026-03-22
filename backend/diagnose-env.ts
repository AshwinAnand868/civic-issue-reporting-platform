import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

async function diagnose() {
    const url = process.env.VOICE_SERVICE_URL || "http://127.0.0.1:8001";
    console.log(`Connecting to: ${url}`);
    
    try {
        const res = await axios.get(url, { timeout: 5000 });
        console.log('Success! Response:', res.status, res.data);
    } catch (err: any) {
        console.error('Connection Failed!');
        console.error('Code:', err.code);
        console.error('Message:', err.message);
        if (err.response) {
            console.error('Status:', err.response.status);
            console.error('Data:', err.response.data);
        }
    }
}

diagnose();
