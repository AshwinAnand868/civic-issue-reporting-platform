import mongoose from 'mongoose';
import User from './models/User';
import dotenv from 'dotenv';

dotenv.config();

async function checkUser() {
    try {
        await mongoose.connect(process.env.MONGO_URI!);
        const user = await User.findOne({ email: 'nikhil55299@gmail.com' });
        if (!user) {
            console.log('User not found');
        } else {
            console.log('User found:', user.email);
            console.log('Voice sample exists:', !!user.voice_sample);
            if (user.voice_sample) {
                console.log('Voice sample length:', user.voice_sample.length);
            }
            console.log('Voice sample MIME:', user.voice_sample_mime);
        }
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

checkUser();
