// backend/seedAdmin.ts
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import Admin from './models/Admin'; 
import Department from './models/Department'; 

dotenv.config();

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI not defined in .env file.");
    }
    // Use the { family: 4 } option to force IPv4 and avoid connection issues in some environments
    await mongoose.connect(process.env.MONGO_URI as string, { family: 4 }); 
    console.log('✅ MongoDB connected successfully.');
  } catch (err: any) {
    console.error(`❌ MongoDB Connection Error: ${err.message}`);
    process.exit(1);
  }
};

// Define the exact names of the existing departments
const DEPARTMENT_NAMES = ['Sanitation', 'Roads', 'Electricity'];

// Define the structure for the admins we intend to create
interface AdminData {
    name: string;
    email: string;
    deptName: string;
}

const seedAdmin = async () => {
  await connectDB();
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const seededAdmins: { email: string, department: string }[] = [];
    const defaultPassword = process.env.ADMIN_PASS;
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(defaultPassword!, salt);
    
    console.log(`\n--- Starting Admin Seeding Process (Admin Only) ---`);
    
    // 1. Find all required Department documents first
    const departments = await Department.find({ name: { $in: DEPARTMENT_NAMES } }).session(session);

    if (departments.length !== DEPARTMENT_NAMES.length) {
        const foundNames = departments.map(d => d.name);
        const missingNames = DEPARTMENT_NAMES.filter(name => !foundNames.includes(name));
        throw new Error(`Critical Error: Could not find all required departments. Missing: ${missingNames.join(', ')}. Please check your database.`);
    }

    // Map department objects for easy lookup
    const deptMap = new Map(departments.map(d => [d.name, d._id]));

    const ADMINS_TO_CREATE: AdminData[] = DEPARTMENT_NAMES.map(name => ({
        name: `${name} Admin`,
        deptName: name,
        email: `admin.${name.toLowerCase().replace(/[^a-z0-9]/g, '')}@janbol.gov`
    }));

    // 2. Iterate through the Admin list and insert
    for (const adminData of ADMINS_TO_CREATE) {
        const { name, email, deptName } = adminData;
        const department_id = deptMap.get(deptName);
        
        if (!department_id) {
            console.error(`Skipping ${name}: Department ID not found in map.`);
            continue; 
        }

        let adminUser = await Admin.findOne({ email: email }).session(session);

        if (adminUser) {
            console.log(`   -> ⚠️ Admin User (${email}) already exists. Skipping.`);
        } else {
            // 3. Create the New Admin User
            const newAdmin = await Admin.create([{
                name: name,
                email: email,
                password_hash,
                role: 'admin',
                department_id: department_id, 
            }], { session });

            adminUser = newAdmin[0];
            
            if (!adminUser) {
                 throw new Error(`Failed to create admin user for: ${email}`);
            }
            
            console.log(`   -> Created NEW Admin: ${adminUser.name} (${adminUser.email})`);
            seededAdmins.push({ email: adminUser.email, department: deptName });
        }
    }
    
    await session.commitTransaction();
    console.log(`\n🎉🎉 Seeding Complete! ${seededAdmins.length} new Admins created. 🎉🎉`);
    
    if (seededAdmins.length > 0) {
        console.log(`\n--- CREDENTIALS (All use password: ${defaultPassword}) ---`);
        seededAdmins.forEach(a => console.log(`| ${a.department} Admin: ${a.email}`));
        console.log(`--------------------------------------------------------`);
    }

  } catch (error) {
    await session.abortTransaction();
    console.error('\n❌ Admin Seeding encountered a serious error. Transaction aborted:', error);
  } finally {
    await session.endSession();
    await mongoose.connection.close();
    console.log('🔗 MongoDB connection closed.');
  }
};

seedAdmin();
