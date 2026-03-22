import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

async function testVerification() {
    console.log('Testing /verify-speaker/ on port 8001...');
    const formData = new FormData();
    
    // Use the real test.wav file we created
    const audioData = fs.readFileSync('test.wav');
    
    formData.append('file1', audioData, { filename: 'test1.wav', contentType: 'audio/wav' });
    formData.append('file2', audioData, { filename: 'test2.wav', contentType: 'audio/wav' });

    try {
        const res = await axios.post('http://127.0.0.1:8001/verify-speaker/', formData, {
            headers: formData.getHeaders()
        });
        console.log('Response:', res.data);
    } catch (err: any) {
        console.error('Verification Failed!');
        if (err.response) {
            console.error('Error Response:', err.response.status, err.response.data);
        } else {
            console.error('Error Message:', err.message);
        }
    }
}

testVerification();
