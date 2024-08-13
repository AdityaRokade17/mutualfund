const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../models/db');

// User login
exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    if (rows.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
  } catch (err) {
    console.error("error : : : ", err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new subprofile
exports.createSubprofile = async (req, res) => {
  if (req.user.role !== 'superadmin') {
    return res.status(403).json({ message: 'Only superadmin can create subprofiles' });
  }

  const { username, password, min_investment, max_investment } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO users (username, password, role, min_investment, max_investment) VALUES (?, ?, ?, ?, ?)',
      [username, hashedPassword, 'subprofile', min_investment, max_investment]
    );
    res.status(201).json({ message: 'Subprofile created successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all subprofiles
// Get all subprofiles with active lead count
exports.getSubprofiles = async (req, res) => {
  if (req.user.role !== 'superadmin') {
    return res.status(403).json({ message: 'Only superadmin can view subprofiles' });
  }

  try {
    const [rows] = await pool.query(`
      SELECT u.id, u.username, u.min_investment, u.max_investment, 
      COUNT(la.id) AS active_leads_count
      FROM users u
      LEFT JOIN lead_assignments la ON u.id = la.user_id AND la.status = 'active'
      WHERE u.role = 'subprofile'
      GROUP BY u.id
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateSubprofile = async (req, res) => {
  if (req.user.role !== 'superadmin') {
    return res.status(403).json({ message: 'Only superadmin can update subprofiles' });
  }

  const { id } = req.params; // Extract id from URL parameters
  const { username, password } = req.body;

  try {
    // Check if the subprofile exists
    const [subprofile] = await pool.query('SELECT * FROM users WHERE id = ? AND role = "subprofile"', [id]);
    if (subprofile.length === 0) {
      return res.status(404).json({ message: 'Subprofile not found' });
    }

    // Prepare the update query
    let updateQuery = 'UPDATE users SET';
    const updateParams = [];

    if (username) {
      updateQuery += ' username = ?,';
      updateParams.push(username);
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateQuery += ' password = ?,';
      updateParams.push(hashedPassword);
    }

    // Remove the trailing comma and add the WHERE clause
    updateQuery = updateQuery.slice(0, -1) + ' WHERE id = ? AND role = "subprofile"';
    updateParams.push(id);

    // Execute the update query
    await pool.query(updateQuery, updateParams);

    res.json({ message: 'Subprofile updated successfully' });
  } catch (err) {
    console.error(err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Username already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

