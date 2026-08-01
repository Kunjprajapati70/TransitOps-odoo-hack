const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const Trip = require('../models/Trip');
const FuelLog = require('../models/FuelLog');
const MaintenanceLog = require('../models/MaintenanceLog');
const Expense = require('../models/Expense');

exports.getKPIStatistics = async () => {
  // Vehicle counts
  const totalVehicles = await Vehicle.countDocuments({ status: { $ne: 'Retired' } });
  const retiredVehicles = await Vehicle.countDocuments({ status: 'Retired' });
  const availableVehicles = await Vehicle.countDocuments({ status: 'Available' });
  const onTripVehicles = await Vehicle.countDocuments({ status: 'On Trip' });
  const maintenanceVehicles = await Vehicle.countDocuments({ status: 'In Shop' });

  // Driver counts
  const totalDrivers = await Driver.countDocuments();
  const onDutyDrivers = await Driver.countDocuments({ status: 'On Trip' });

  // Trips
  const activeTrips = await Trip.countDocuments({ status: 'Dispatched' });
  const completedTrips = await Trip.countDocuments({ status: 'Completed' });

  // Fleet Utilization % = (Vehicles On Trip / Total Active Vehicles) * 100
  const fleetUtilization = totalVehicles > 0 
    ? Math.round((onTripVehicles / totalVehicles) * 100) 
    : 0;

  // Financial aggregates
  const fuelCostResult = await FuelLog.aggregate([
    { $group: { _id: null, total: { $sum: '$cost' } } }
  ]);
  const totalFuelCost = fuelCostResult[0]?.total || 0;

  const maintenanceCostResult = await MaintenanceLog.aggregate([
    { $group: { _id: null, total: { $sum: '$cost' } } }
  ]);
  const totalMaintenanceCost = maintenanceCostResult[0]?.total || 0;

  const revenueResult = await Trip.aggregate([
    { $match: { status: 'Completed' } },
    { $group: { _id: null, total: { $sum: '$revenue' } } }
  ]);
  const totalRevenue = revenueResult[0]?.total || 0;

  return {
    totalVehicles: totalVehicles + retiredVehicles,
    activeVehicles: totalVehicles,
    availableVehicles,
    vehiclesOnTrip: onTripVehicles,
    vehiclesInMaintenance: maintenanceVehicles,
    totalDrivers,
    driversOnDuty: onDutyDrivers,
    activeTrips,
    completedTrips,
    fleetUtilization,
    totalFuelCost,
    totalMaintenanceCost,
    totalRevenue
  };
};

exports.getChartsData = async () => {
  // 1. Monthly Revenue & Expenses
  // Let's bucket completed trips, fuel, maintenance, and other expenses by month (last 6 months)
  const today = new Date();
  const months = [];
  const monthlyRevenue = [];
  const monthlyExpenses = [];

  for (let i = 5; i >= 0; i--) {
    let d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const monthName = d.toLocaleString('default', { month: 'short' });
    const startOfMonth = new Date(d.getFullYear(), d.getMonth(), 1);
    const endOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);

    months.push(monthName);

    // Sum revenue
    const rev = await Trip.aggregate([
      { $match: { status: 'Completed', completionDate: { $gte: startOfMonth, $lte: endOfMonth } } },
      { $group: { _id: null, total: { $sum: '$revenue' } } }
    ]);
    monthlyRevenue.push(rev[0]?.total || 0);

    // Sum expenses (Fuel + Maintenance + Tolls/Expenses)
    const fuel = await FuelLog.aggregate([
      { $match: { date: { $gte: startOfMonth, $lte: endOfMonth } } },
      { $group: { _id: null, total: { $sum: '$cost' } } }
    ]);
    const maint = await MaintenanceLog.aggregate([
      { $match: { startDate: { $gte: startOfMonth, $lte: endOfMonth } } },
      { $group: { _id: null, total: { $sum: '$cost' } } }
    ]);
    const exp = await Expense.aggregate([
      { $match: { date: { $gte: startOfMonth, $lte: endOfMonth } } },
      { $group: { _id: null, total: { $sum: { $add: ['$toll', '$parking', '$repair', '$other'] } } } }
    ]);

    const totalExp = (fuel[0]?.total || 0) + (maint[0]?.total || 0) + (exp[0]?.total || 0);
    monthlyExpenses.push(totalExp);
  }

  // 2. Vehicle Status Distribution (For Pie Chart)
  const vehicleStats = [
    await Vehicle.countDocuments({ status: 'Available' }),
    await Vehicle.countDocuments({ status: 'On Trip' }),
    await Vehicle.countDocuments({ status: 'In Shop' }),
    await Vehicle.countDocuments({ status: 'Retired' })
  ];

  return {
    monthlyLabels: months,
    revenueDataset: monthlyRevenue,
    expenseDataset: monthlyExpenses,
    vehicleStatusDistribution: {
      labels: ['Available', 'On Trip', 'In Shop', 'Retired'],
      data: vehicleStats
    }
  };
};

exports.getVehicleROI = async () => {
  const vehicles = await Vehicle.find({ status: { $ne: 'Retired' } });
  
  const roiReport = [];

  for (const vehicle of vehicles) {
    // 1. Revenue
    const revenueRes = await Trip.aggregate([
      { $match: { vehicle: vehicle._id, status: 'Completed' } },
      { $group: { _id: null, total: { $sum: '$revenue' } } }
    ]);
    const revenue = revenueRes[0]?.total || 0;

    // 2. Fuel Costs
    const fuelRes = await FuelLog.aggregate([
      { $match: { vehicle: vehicle._id } },
      { $group: { _id: null, total: { $sum: '$cost' } } }
    ]);
    const fuelCost = fuelRes[0]?.total || 0;

    // 3. Maintenance Costs
    const maintRes = await MaintenanceLog.aggregate([
      { $match: { vehicle: vehicle._id } },
      { $group: { _id: null, total: { $sum: '$cost' } } }
    ]);
    const maintenanceCost = maintRes[0]?.total || 0;

    // 4. Expenses (tolls, parking, repairs, other)
    const expRes = await Expense.aggregate([
      { $match: { vehicle: vehicle._id } },
      { $group: { 
          _id: null, 
          total: { $sum: { $add: ['$toll', '$parking', '$repair', '$other'] } } 
        } 
      }
    ]);
    const otherCost = expRes[0]?.total || 0;

    const totalOperationalCost = fuelCost + maintenanceCost + otherCost;
    const netProfit = revenue - totalOperationalCost;

    // ROI = (Net Profit / Acquisition Cost) * 100
    const roiPercentage = vehicle.acquisitionCost > 0
      ? parseFloat(((netProfit / vehicle.acquisitionCost) * 100).toFixed(2))
      : 0;

    roiReport.push({
      id: vehicle._id,
      registrationNumber: vehicle.registrationNumber,
      name: vehicle.name,
      acquisitionCost: vehicle.acquisitionCost,
      revenue,
      operationalCost: totalOperationalCost,
      netProfit,
      roi: roiPercentage
    });
  }

  return roiReport;
};

exports.getDriverPerformance = async () => {
  const drivers = await Driver.find();
  const driverReport = [];

  for (const driver of drivers) {
    const tripStats = await Trip.aggregate([
      { $match: { driver: driver._id, status: 'Completed' } },
      { $group: { 
          _id: null, 
          count: { $sum: 1 }, 
          totalRevenue: { $sum: '$revenue' },
          totalDistance: { $sum: '$plannedDistance' }
        } 
      }
    ]);

    const completedTripsCount = tripStats[0]?.count || 0;
    const totalRevenueGenerated = tripStats[0]?.totalRevenue || 0;
    const totalDistanceTraveled = tripStats[0]?.totalDistance || 0;

    driverReport.push({
      id: driver._id,
      name: driver.name,
      licenseNumber: driver.licenseNumber,
      safetyScore: driver.safetyScore,
      completedTrips: completedTripsCount,
      revenueGenerated: totalRevenueGenerated,
      distanceTraveled: totalDistanceTraveled,
      status: driver.status
    });
  }

  return driverReport;
};

exports.getFuelEfficiencyReport = async () => {
  // Aggregate trips where status is completed to calculate average fuel efficiency
  const trips = await Trip.find({ status: 'Completed', fuelConsumed: { $gt: 0 } }).populate('vehicle');

  return trips.map(t => {
    const efficiency = t.fuelConsumed > 0 
      ? parseFloat((t.plannedDistance / t.fuelConsumed).toFixed(2)) 
      : 0; // km per Liter

    return {
      tripId: t.tripId,
      vehicleRegNumber: t.vehicle?.registrationNumber || 'N/A',
      vehicleName: t.vehicle?.name || 'N/A',
      distance: t.plannedDistance,
      fuelConsumed: t.fuelConsumed,
      efficiency
    };
  });
};
