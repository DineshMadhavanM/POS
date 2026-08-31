import { connectDB, disconnectDB } from './config/db';
import { User } from './models/User';
import { Organization } from './models/Organization';
import { Outlet } from './models/Outlet';
import { Employee } from './models/Employee';
import { Product } from './models/Product';
import { Category } from './models/Category';
import { Table } from './models/Table';
import { BusinessType, UserRole, TableStatus } from './constants/enums';
import bcrypt from 'bcryptjs';

const seedDatabase = async () => {
  try {
    console.log('Connecting to MongoDB Atlas for initial database seeding...');
    await connectDB();

    const testEmail = 'owner@nexstack.com';
    let user = await User.findOne({ email: testEmail });

    if (!user) {
      const passwordHash = await bcrypt.hash('DemoOwner2026!', 10);
      user = await User.create({
        name: 'Demo Business Owner',
        email: testEmail,
        passwordHash,
        phoneNumber: '+1 555-019-2026'
      });
      console.log('✔ Created Demo User account:', testEmail);
    } else {
      console.log('ℹ Demo User account already exists:', testEmail);
    }

    let org = await Organization.findOne({ ownerId: user._id });
    if (!org) {
      org = await Organization.create({
        businessName: 'NexStack Bistro & Bakery',
        businessType: BusinessType.RESTAURANT,
        ownerId: user._id,
        email: user.email,
        phoneNumber: user.phoneNumber,
        currency: 'USD',
        taxRateDefault: 5,
        invoicePrefix: 'NEX'
      });
      console.log('✔ Created Organization Workspace in Atlas:', org.businessName);
    }

    let outlet = await Outlet.findOne({ organizationId: org._id });
    if (!outlet) {
      outlet = await Outlet.create({
        organizationId: org._id,
        name: 'Main Flagship Outlet',
        code: 'OUTLET-01',
        isDefault: true
      });
    }

    let emp = await Employee.findOne({ organizationId: org._id, userId: user._id });
    if (!emp) {
      await Employee.create({
        organizationId: org._id,
        userId: user._id,
        outletIds: [outlet._id],
        role: UserRole.OWNER,
        status: 'ACTIVE'
      });
    }

    // Create Sample Category & Products
    let cat = await Category.findOne({ organizationId: org._id, name: 'Beverages & Desserts' });
    if (!cat) {
      cat = await Category.create({
        organizationId: org._id,
        name: 'Beverages & Desserts',
        description: 'Hot drinks and artisanal pastries'
      });
    }

    const sampleProducts = [
      { name: 'Artisanal Dark Chocolate Cake', sellingPrice: 12.5, currentStock: 25, barcode: '8901001001' },
      { name: 'Iced Vanilla Latte', sellingPrice: 4.8, currentStock: 100, barcode: '8901001002' },
      { name: 'Croissant Butter Delight', sellingPrice: 3.5, currentStock: 40, barcode: '8901001003' },
      { name: 'Double Espresso Shot', sellingPrice: 3.0, currentStock: 150, barcode: '8901001004' }
    ];

    for (const p of sampleProducts) {
      const exists = await Product.findOne({ organizationId: org._id, name: p.name });
      if (!exists) {
        await Product.create({
          ...p,
          organizationId: org._id,
          outletId: outlet._id,
          categoryId: cat._id,
          costPrice: p.sellingPrice * 0.4,
          taxRate: 5,
          minimumStock: 10,
          activeStatus: true
        });
        console.log(`✔ Seeded Atlas Product: ${p.name}`);
      }
    }

    // Seed Tables for Restaurant floor map
    const tablesCount = await Table.countDocuments({ organizationId: org._id });
    if (tablesCount === 0) {
      await Table.create([
        { organizationId: org._id, outletId: outlet._id, tableNumber: 'T-01', capacity: 2, status: TableStatus.AVAILABLE },
        { organizationId: org._id, outletId: outlet._id, tableNumber: 'T-02', capacity: 4, status: TableStatus.AVAILABLE },
        { organizationId: org._id, outletId: outlet._id, tableNumber: 'T-03', capacity: 6, status: TableStatus.AVAILABLE },
        { organizationId: org._id, outletId: outlet._id, tableNumber: 'T-04', capacity: 4, status: TableStatus.RESERVED }
      ]);
      console.log('✔ Seeded Restaurant Tables in Atlas');
    }

    console.log('=================================================');
    console.log(' Successfully populated Atlas MongoDB database!');
    console.log(' Demo Login Credentials:');
    console.log(` Email: ${testEmail}`);
    console.log(' Password: DemoOwner2026!');
    console.log('=================================================');

    await disconnectDB();
  } catch (err) {
    console.error('Seeding failed:', err);
  }
};

seedDatabase();
