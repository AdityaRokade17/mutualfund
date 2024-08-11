const { pool } = require('../models/db');


// Helper function to assign a lead
async function balanceAndAssignLead(leadId, investmentAmount) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Step 1: Get eligible subprofiles with their current active lead count
    const [eligibleSubprofiles] = await connection.query(`
      SELECT u.id, u.username, u.min_investment, u.max_investment, 
             COALESCE(la.active_lead_count, 0) as active_lead_count
      FROM users u
      LEFT JOIN (
        SELECT user_id, COUNT(*) as active_lead_count
        FROM lead_assignments
        WHERE status = 'active'
        GROUP BY user_id
      ) la ON u.id = la.user_id
      WHERE u.role = 'subprofile' 
      AND ? BETWEEN u.min_investment AND u.max_investment
      ORDER BY active_lead_count ASC, RAND()
    `, [investmentAmount]);

    if (eligibleSubprofiles.length > 0) {
      // Step 2: Calculate the ideal number of leads per subprofile
      const totalLeads = eligibleSubprofiles.reduce((sum, sp) => sum + sp.active_lead_count, 0) + 1; // +1 for the new lead
      const idealLeadsPerSubprofile = Math.ceil(totalLeads / eligibleSubprofiles.length);

      // Step 3: Rebalance existing leads if necessary
      for (let i = 0; i < eligibleSubprofiles.length - 1; i++) {
        const currentSubprofile = eligibleSubprofiles[i];
        const nextSubprofile = eligibleSubprofiles[i + 1];
        
        if (currentSubprofile.active_lead_count < idealLeadsPerSubprofile && 
            nextSubprofile.active_lead_count > idealLeadsPerSubprofile) {
          const leadsToMove = Math.min(
            nextSubprofile.active_lead_count - idealLeadsPerSubprofile,
            idealLeadsPerSubprofile - currentSubprofile.active_lead_count
          );

          if (leadsToMove > 0) {
            // Move leads from nextSubprofile to currentSubprofile
            await connection.query(`
              UPDATE lead_assignments
              SET user_id = ?
              WHERE user_id = ? AND status = 'active'
              ORDER BY assigned_at ASC
              LIMIT ?
            `, [currentSubprofile.id, nextSubprofile.id, leadsToMove]);

            currentSubprofile.active_lead_count += leadsToMove;
            nextSubprofile.active_lead_count -= leadsToMove;

            console.log(`Moved ${leadsToMove} leads from ${nextSubprofile.username} to ${currentSubprofile.username}`);
          }
        }
      }

      // Step 4: Assign the new lead to the subprofile with the least leads
      const selectedSubprofile = eligibleSubprofiles[0];
      await connection.query(`
        INSERT INTO lead_assignments (lead_id, user_id, status)
        VALUES (?, ?, 'active')
      `, [leadId, selectedSubprofile.id]);

      console.log(`Lead ${leadId} assigned to subprofile ${selectedSubprofile.username} (ID: ${selectedSubprofile.id})`);
    } else {
      console.log(`No eligible subprofile found for lead ${leadId} with investment amount ${investmentAmount}`);
    }

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    console.error('Error in balanceAndAssignLead:', error);
    throw error;
  } finally {
    connection.release();
  }
}

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

    // Assign the lead
    await balanceAndAssignLead(result.insertId, investment_amount);

    res.status(201).json({ message: 'Lead created and assigned successfully', leadId: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get leads (for both superadmin and subprofiles)
exports.getLeads = async (req, res) => {
  try {
    let query;
    let queryParams = [];

    if (req.user.role === 'superadmin') {
      // Superadmin can see all leads
      query = `
        SELECT l.*, 
               la.user_id AS assigned_to, 
               u.username AS assigned_to_username,
               lsd.current_status
        FROM leads l
        LEFT JOIN lead_assignments la ON l.id = la.lead_id AND la.status = 'active'
        LEFT JOIN users u ON la.user_id = u.id
        LEFT JOIN leadstatusdetails lsd ON l.id = lsd.lead_id
      `;
    } else if (req.user.role === 'subprofile') {
      // Subprofiles can only see their assigned leads
      query = `
        SELECT l.*, lsd.current_status
        FROM leads l
        JOIN lead_assignments la ON l.id = la.lead_id
        LEFT JOIN leadstatusdetails lsd ON l.id = lsd.lead_id
        WHERE la.user_id = ? AND la.status = 'active'
      `;
      queryParams = [req.user.id];
    } else {
      // Handle any other roles or unauthorized access
      return res.status(403).json({ message: 'Unauthorized access' });
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

// Get current status of leads
exports.getCurrentStatuses =async (req, res) => {
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

// Mark a lead as completed (for subprofiles)
exports.markLeadAsCompleted = async (req, res) => {
  const { lead_id } = req.params;

  try {
    await pool.query(`
      UPDATE lead_assignments
      SET status = 'completed'
      WHERE lead_id = ? AND user_id = ?
    `, [lead_id, req.user.id]);

    res.json({ message: 'Lead marked as completed' });
  } catch (error) {
    console.error('Error completing lead:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Reassign a lead (for superadmin only)
// exports.reassignLead = async (req, res) => {
//   if (req.user.role !== 'superadmin') {
//     return res.status(403).json({ message: 'Unauthorized access' });
//   }

//   const { lead_id } = req.params;
//   const { new_user_id } = req.body;

//   try {
//     await pool.query(`
//       UPDATE lead_assignments
//       SET user_id = ?, assigned_at = NOW()
//       WHERE lead_id = ? AND status = 'active'
//     `, [new_user_id, lead_id]);

//     res.json({ message: 'Lead reassigned successfully' });
//   } catch (error) {
//     console.error('Error reassigning lead:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };

exports.reassignLead = async (req, res) => {
  if (req.user.role !== 'superadmin') {
    return res.status(403).json({ message: 'Unauthorized access' });
  }

  const { lead_id } = req.params;
  const { new_user_id } = req.body;

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Get lead details
    const [leadRows] = await connection.query('SELECT investment_amount FROM leads WHERE id = ?', [lead_id]);
    if (leadRows.length === 0) {
      throw new Error('Lead not found');
    }
    const { investment_amount } = leadRows[0];

    // Check if there's an existing assignment
    const [assignmentRows] = await connection.query(
      'SELECT * FROM lead_assignments WHERE lead_id = ? AND status = "active"',
      [lead_id]
    );

    if (assignmentRows.length === 0) {
      // If no assignment exists, use balanceAndAssignLead logic
      await balanceAndAssignLead(lead_id, investment_amount);
    } else {
      // If an assignment exists, update it
      const [userRows] = await connection.query(
        'SELECT * FROM users WHERE id = ? AND ? BETWEEN min_investment AND max_investment',
        [new_user_id, investment_amount]
      );
      if (userRows.length === 0) {
        throw new Error('The selected user\'s investment range does not match the lead\'s investment amount');
      }

      await connection.query(
        'UPDATE lead_assignments SET user_id = ?, assigned_at = NOW() WHERE lead_id = ? AND status = "active"',
        [new_user_id, lead_id]
      );
    }

    await connection.commit();
    res.json({ message: 'Lead reassigned successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Error reassigning lead:', error);
    res.status(400).json({ message: error.message });
  } finally {
    connection.release();
  }
};

// View assignment history for a lead (for superadmin only)
exports.viewAssignmentHistory = async (req, res) => {
  if (req.user.role !== 'superadmin') {
    return res.status(403).json({ message: 'Unauthorized access' });
  }

  const { lead_id } = req.params;

  try {
    const [rows] = await pool.query(`
      SELECT la.*, u.username
      FROM lead_assignments la
      JOIN users u ON la.user_id = u.id
      WHERE la.lead_id = ?
      ORDER BY la.assigned_at DESC
    `, [lead_id]);

    res.json(rows);
  } catch (error) {
    console.error('Error fetching assignment history:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
