const { pool } = require('../models/db');

// Create a new lead
exports.createLead = async (req, res) => {
  const {
    name, date_of_birth, whatsapp_mobile, email, city, country,
    investment_timeline, investment_duration, risk_understanding,
    previous_mutual_fund_experience, investment_type, investment_amount,
    monthly_income, lic_premium, ideal_call_time, interested_products,
    prefer_rahul_kulkarni, is_nri, specific_issues
  } = req.body;

  try {
    const [result] = await pool.query(
      'INSERT INTO leads (name, date_of_birth, whatsapp_mobile, email, city, country, investment_timeline, investment_duration, risk_understanding, previous_mutual_fund_experience, investment_type, investment_amount, monthly_income, lic_premium, ideal_call_time, interested_products, prefer_rahul_kulkarni, is_nri, specific_issues) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, date_of_birth, whatsapp_mobile, email, city, country, investment_timeline, investment_duration, risk_understanding, previous_mutual_fund_experience, investment_type, investment_amount, monthly_income, lic_premium, ideal_call_time, interested_products, prefer_rahul_kulkarni, is_nri, specific_issues]
    );

    res.status(201).json({ message: 'Lead created successfully', leadId: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all leads
exports.getLeads = async (req, res) => {
  try {
    let query = 'SELECT * FROM leads';
    let queryParams = [];

    if (req.user.role === 'subprofile') {
      const [userRows] = await pool.query('SELECT min_investment, max_investment FROM users WHERE id = ?', [req.user.id]);
      const { min_investment, max_investment } = userRows[0];
      query += ' WHERE investment_amount BETWEEN ? AND ?';
      queryParams = [min_investment, max_investment];
    }

    const [rows] = await pool.query(query, queryParams);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get status names
exports.getStatusNames = (req, res) => {
  res.json({ statusNames: ['contacted', 'interested', 'not_interested'] });
};

// Get current statuses
exports.getCurrentStatuses = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT l.id AS lead_id, l.name, 
             lsd.current_status,
             lsd.contacted, lsd.interested, lsd.not_interested
      FROM leads l
      LEFT JOIN leadstatusdetails lsd ON l.id = lsd.lead_id
    `);

    const leadStatuses = rows.map(row => {
      const { lead_id, name, current_status, contacted, interested, not_interested } = row;
      return {
        lead_id,
        name,
        currentStatus: current_status || 'new',
        statuses: {
          contacted: contacted || '',
          interested: interested || '',
          not_interested: not_interested || ''
        }
      };
    });

    res.json(leadStatuses);
  } catch (error) {
    console.error('Error fetching lead statuses:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update lead status
exports.updateLeadStatus = async (req, res) => {
  const { lead_id } = req.params;
  const { status, remark } = req.body;

  if (!['contacted', 'interested', 'not_interested'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    // Check if the lead status exists
    const [rows] = await pool.query(`
      SELECT * FROM leadstatusdetails
      WHERE lead_id = ?
    `, [lead_id]);

    if (rows.length === 0) {
      // If no row exists, insert a new row
      await pool.query(`
        INSERT INTO leadstatusdetails (lead_id, ${status}, current_status, created_at)
        VALUES (?, ?, ?, NOW())
      `, [lead_id, remark, status]);
    } else {
      // Update the existing row
      await pool.query(`
        UPDATE leadstatusdetails
        SET ${status} = ?, current_status = ?, created_at = NOW()
        WHERE lead_id = ?
      `, [remark, status, lead_id]);
    }

    res.json({ message: 'Lead status updated successfully' });
  } catch (error) {
    console.error('Error updating lead status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
