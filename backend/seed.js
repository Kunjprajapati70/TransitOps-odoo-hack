require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Vehicle = require('./models/Vehicle');
const Driver = require('./models/Driver');
const Trip = require('./models/Trip');
const MaintenanceLog = require('./models/MaintenanceLog');
const FuelLog = require('./models/FuelLog');
const Expense = require('./models/Expense');
const Notification = require('./models/Notification');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/transitops';

const seedData = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to Database. Dropping existing collections...');
    
    await User.deleteMany({});
    await Vehicle.deleteMany({});
    await Driver.deleteMany({});
    await Trip.deleteMany({});
    await MaintenanceLog.deleteMany({});
    await FuelLog.deleteMany({});
    await Expense.deleteMany({});
    await Notification.deleteMany({});

    console.log('Inserting seed users...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const users = await User.create([
      { name: 'Marcus Vance', email: 'fleet@transitops.com', password: hashedPassword, role: 'Fleet Manager' },
      { name: 'Raven K.', email: 'dispatcher@transitops.com', password: hashedPassword, role: 'Dispatcher' },
      { name: 'Sarah Connor', email: 'safety@transitops.com', password: hashedPassword, role: 'Safety Officer' },
      { name: 'Fiona Gallagher', email: 'finance@transitops.com', password: hashedPassword, role: 'Financial Analyst' },
      { name: 'Admin Root', email: 'admin@transitops.com', password: hashedPassword, role: 'Admin' }
    ]);
    console.log(`Created ${users.length} users.`);

    console.log('Inserting seed vehicles...');
    const vehicles = await Vehicle.create([
      {
        registrationNumber: 'GJ01AB452',
        name: 'VAN-05',
        model: 'Ford Transit Custom',
        type: 'Van',
        maxLoadCapacity: 500, // 500 kg
        currentOdometer: 74000,
        acquisitionCost: 12000,
        purchaseDate: new Date('2024-03-15'),
        status: 'Available'
      },
      {
        registrationNumber: 'GJ01AB998',
        name: 'TRUCK-11',
        model: 'Volvo FH16 HMV',
        type: 'Truck',
        maxLoadCapacity: 5000, // 5 Tons
        currentOdometer: 182000,
        acquisitionCost: 45000,
        purchaseDate: new Date('2022-05-10'),
        status: 'On Trip' 
      },
      {
        registrationNumber: 'GJ01AB1120',
        name: 'MINI-03',
        model: 'Tata Ace Gold',
        type: 'Mini',
        maxLoadCapacity: 1000, // 1 Ton
        currentOdometer: 66000,
        acquisitionCost: 8000,
        purchaseDate: new Date('2024-09-01'),
        status: 'In Shop'
      },
      {
        registrationNumber: 'GJ01AB0008',
        name: 'VAN-09',
        model: 'Chevrolet Express',
        type: 'Van',
        maxLoadCapacity: 750,
        currentOdometer: 241900,
        acquisitionCost: 11000,
        purchaseDate: new Date('2021-11-20'),
        status: 'Retired'
      }
    ]);
    console.log(`Created ${vehicles.length} vehicles.`);

    console.log('Inserting seed drivers...');
    
    // John's license expired in 2025, since we are in July 2026.
    const drivers = await Driver.create([
      {
        name: 'Alex Mercer',
        licenseNumber: 'DL-88213',
        licenseCategory: 'LMV',
        licenseExpiryDate: new Date('2028-12-15'),
        contactNumber: '9876543210',
        email: 'alex@transitops.com',
        safetyScore: 96,
        status: 'Available',
        profilePhoto: ''
      },
      {
        name: 'John Miller',
        licenseNumber: 'DL-44120',
        licenseCategory: 'HMV',
        licenseExpiryDate: new Date('2025-03-20'), // Expired license!
        contactNumber: '9822011111',
        email: 'john@transitops.com',
        safetyScore: 81,
        status: 'Suspended',
        profilePhoto: ''
      },
      {
        name: 'Priya Sharma',
        licenseNumber: 'DL-77031',
        licenseCategory: 'LMV',
        licenseExpiryDate: new Date('2027-08-30'),
        contactNumber: '9911022222',
        email: 'priya@transitops.com',
        safetyScore: 99,
        status: 'On Trip', 
        profilePhoto: ''
      },
      {
        name: 'Suresh Kumar',
        licenseNumber: 'DL-90045',
        licenseCategory: 'HMV',
        licenseExpiryDate: new Date('2027-01-10'),
        contactNumber: '9744033333',
        email: 'suresh@transitops.com',
        safetyScore: 88,
        status: 'Off Duty',
        profilePhoto: ''
      }
    ]);
    console.log(`Created ${drivers.length} drivers.`);

    console.log('Inserting historical and seed trips...');
    const trip1 = await Trip.create({
      tripId: 'TR001',
      source: 'Gandhinagar Depot',
      destination: 'Ahmedabad Hub',
      vehicle: vehicles[0]._id, // VAN-05 (Available)
      driver: drivers[0]._id, // Alex (Available)
      cargoWeight: 350,
      plannedDistance: 38,
      revenue: 650,
      dispatchDate: new Date('2026-07-10T08:00:00Z'),
      completionDate: new Date('2026-07-10T10:30:00Z'),
      fuelConsumed: 5,
      status: 'Completed'
    });

    const trip2 = await Trip.create({
      tripId: 'TR002',
      source: 'Vadodara Logistics Center',
      destination: 'Surat Cargo Yard',
      vehicle: vehicles[1]._id, // TRUCK-11 (On Trip)
      driver: drivers[2]._id, // Priya (On Trip)
      cargoWeight: 4200,
      plannedDistance: 150,
      revenue: 2800,
      dispatchDate: new Date(),
      status: 'Dispatched'
    });

    const trip3 = await Trip.create({
      tripId: 'TR003',
      source: 'Vatva Industrial Area',
      destination: 'Sanand Warehouse',
      vehicle: vehicles[0]._id, // VAN-05
      driver: drivers[0]._id, // Alex
      cargoWeight: 400,
      plannedDistance: 45,
      revenue: 720,
      status: 'Draft'
    });

    const trip4 = await Trip.create({
      tripId: 'TR004',
      source: 'Mansa Depot',
      destination: 'Kalol Depot',
      vehicle: vehicles[2]._id, // MINI-03
      driver: drivers[3]._id, // Suresh
      cargoWeight: 600,
      plannedDistance: 50,
      revenue: 800,
      status: 'Cancelled'
    });
    console.log('Trips created.');

    console.log('Inserting maintenance logs...');
    // Log for Mini-03 (In Shop)
    await MaintenanceLog.create({
      vehicle: vehicles[2]._id,
      type: 'Repair',
      description: 'Engine alternator replacement & oil change',
      cost: 450,
      startDate: new Date('2026-07-11'),
      endDate: new Date('2026-07-13'),
      status: 'In Progress'
    });

    // Scheduled log for Van-05
    await MaintenanceLog.create({
      vehicle: vehicles[0]._id,
      type: 'Preventative',
      description: 'Wheel alignment & tire rotation checklist',
      cost: 180,
      startDate: new Date(new Date().getTime() + 1 * 24 * 60 * 60 * 1000), // Tomorrow
      endDate: new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000),
      status: 'Scheduled'
    });
    console.log('Maintenance logs created.');

    console.log('Inserting fuel logs...');
    await FuelLog.create([
      {
        vehicle: vehicles[0]._id,
        trip: trip1._id,
        quantity: 5,
        cost: 6.75, // Liters * Cost
        date: new Date('2026-07-10')
      },
      {
        vehicle: vehicles[1]._id,
        quantity: 120,
        cost: 162,
        date: new Date('2026-07-05')
      }
    ]);
    console.log('Fuel logs created.');

    console.log('Inserting expenses...');
    await Expense.create([
      {
        vehicle: vehicles[0]._id,
        trip: trip1._id,
        toll: 15,
        parking: 5,
        repair: 0,
        other: 0,
        description: 'Toll plaza charges Highway NH-8',
        date: new Date('2026-07-10')
      },
      {
        vehicle: vehicles[1]._id,
        toll: 80,
        parking: 15,
        repair: 120,
        other: 20,
        description: 'Tyre patch repair & terminal fees',
        date: new Date('2026-07-05')
      }
    ]);
    console.log('Expenses created.');

    console.log('Creating initial notifications...');
    // Create notifications for John's expired license
    await Notification.create({
      type: 'expired_license',
      message: `Driver license for John Miller (License No: DL-44120) has expired on ${new Date('2025-03-20').toLocaleDateString()}!`,
      isRead: false
    });

    console.log('Database Seeding successfully completed!');
    process.exit(0);
  } catch (error) {
    console.error('Fatal Database Seed error:', error.message);
    process.exit(1);
  }
};

seedData();
