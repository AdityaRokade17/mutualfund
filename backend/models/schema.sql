CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('superadmin', 'subprofile') NOT NULL,
  min_investment DECIMAL(10, 2),
  max_investment DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE leads (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  date_of_birth DATE NOT NULL,
  whatsapp_mobile VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  city VARCHAR(100) NOT NULL,
  country VARCHAR(100) NOT NULL,
  investment_timeline VARCHAR(50) NOT NULL,
  investment_duration VARCHAR(50) NOT NULL,
  risk_understanding VARCHAR(50) NOT NULL,
  previous_mutual_fund_experience VARCHAR(5) NOT NULL,
  investment_type VARCHAR(50) NOT NULL,
  investment_amount DECIMAL(10, 2) NOT NULL,
  monthly_income DECIMAL(10, 2) NOT NULL,
  lic_premium DECIMAL(10, 2) NOT NULL,
  ideal_call_time VARCHAR(50) NOT NULL,
  interested_products TEXT NOT NULL,
  prefer_rahul_kulkarni VARCHAR(5) NOT NULL,
  is_nri VARCHAR(5) NOT NULL,
  specific_issues TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);