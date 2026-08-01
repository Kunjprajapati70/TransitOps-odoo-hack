const analyticsService = require('../services/analyticsService');
const { jsonToCsv } = require('../utils/csvGenerator');
const { generatePDFReport } = require('../utils/pdfGenerator');

// @desc    Get dashboard KPI summaries & charts
// @route   GET /api/analytics/dashboard
// @access  Private
exports.getDashboardData = async (req, res) => {
  try {
    const kpis = await analyticsService.getKPIStatistics();
    const charts = await analyticsService.getChartsData();
    res.json({ success: true, data: { kpis, charts } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get vehicle ROI report
// @route   GET /api/analytics/reports/roi
// @access  Private
exports.getROIReport = async (req, res) => {
  try {
    const data = await analyticsService.getVehicleROI();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get driver performance report
// @route   GET /api/analytics/reports/drivers
// @access  Private
exports.getDriverReport = async (req, res) => {
  try {
    const data = await analyticsService.getDriverPerformance();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get fuel efficiency report
// @route   GET /api/analytics/reports/fuel
// @access  Private
exports.getFuelReport = async (req, res) => {
  try {
    const data = await analyticsService.getFuelEfficiencyReport();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Export reports as CSV
// @route   GET /api/analytics/export/csv/:reportType
// @access  Private
exports.exportCSV = async (req, res) => {
  try {
    const { reportType } = req.params;
    let data = [];
    let fields = [];

    if (reportType === 'roi') {
      data = await analyticsService.getVehicleROI();
      fields = ['registrationNumber', 'name', 'acquisitionCost', 'revenue', 'operationalCost', 'netProfit', 'roi'];
    } else if (reportType === 'drivers') {
      data = await analyticsService.getDriverPerformance();
      fields = ['name', 'licenseNumber', 'safetyScore', 'completedTrips', 'revenueGenerated', 'distanceTraveled', 'status'];
    } else if (reportType === 'fuel') {
      data = await analyticsService.getFuelEfficiencyReport();
      fields = ['tripId', 'vehicleRegNumber', 'vehicleName', 'distance', 'fuelConsumed', 'efficiency'];
    } else {
      return res.status(400).json({ success: false, message: 'Invalid report type' });
    }

    const csv = jsonToCsv(data, fields);
    res.header('Content-Type', 'text/csv');
    res.attachment(`${reportType}_report.csv`);
    return res.send(csv);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Export reports as PDF
// @route   GET /api/analytics/export/pdf/:reportType
// @access  Private
exports.exportPDF = async (req, res) => {
  try {
    const { reportType } = req.params;
    let title = '';
    let headers = [];
    let rows = [];

    if (reportType === 'roi') {
      title = 'Vehicle Return on Investment (ROI) Report';
      headers = ['Reg No.', 'Name', 'Acq. Cost (₹)', 'Revenue (₹)', 'Op. Cost (₹)', 'Net Profit (₹)', 'ROI %'];
      const data = await analyticsService.getVehicleROI();
      rows = data.map(r => [
        r.registrationNumber,
        r.name,
        r.acquisitionCost,
        r.revenue,
        r.operationalCost,
        r.netProfit,
        `${r.roi}%`
      ]);
    } else if (reportType === 'drivers') {
      title = 'Driver Operations & Safety Report';
      headers = ['Driver Name', 'License No', 'Safety Score', 'Trips Done', 'Rev. Generated (₹)', 'Dist. Traveled (km)', 'Status'];
      const data = await analyticsService.getDriverPerformance();
      rows = data.map(r => [
        r.name,
        r.licenseNumber,
        r.safetyScore,
        r.completedTrips,
        r.revenueGenerated,
        r.distanceTraveled,
        r.status
      ]);
    } else if (reportType === 'fuel') {
      title = 'Fuel efficiency & Consumption Report';
      headers = ['Trip ID', 'Reg No', 'Vehicle Name', 'Distance (km)', 'Fuel Used (L)', 'Efficiency (km/L)'];
      const data = await analyticsService.getFuelEfficiencyReport();
      rows = data.map(r => [
        r.tripId,
        r.vehicleRegNumber,
        r.vehicleName,
        r.distance,
        r.fuelConsumed,
        r.efficiency
      ]);
    } else {
      return res.status(400).json({ success: false, message: 'Invalid report type' });
    }

    res.header('Content-Type', 'application/pdf');
    res.attachment(`${reportType}_report.pdf`);
    generatePDFReport(res, title, headers, rows);
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};
