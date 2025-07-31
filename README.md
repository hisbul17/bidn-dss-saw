# Employee Decision Support System (DSS)

A comprehensive web application for employee performance evaluation and decision-making support, built with React, Express.js, and MySQL.

## 🚀 Features

### 🔐 Authentication & Role Management
- **Multi-role system**: Administrator, Manager, Supervisor, Employee
- **Session-based authentication** (no JWT complexity)
- **Role-based access control** with department restrictions
- **Secure password hashing** with bcrypt

### 📊 Dashboard & Analytics
- **Real-time performance metrics** and statistics
- **Top performers leaderboard** with rankings
- **Department comparison** and analytics
- **Interactive charts** and visualizations

### 🧮 Evaluation System
- **Weighted scoring algorithm** (SAW method)
- **Multi-criteria evaluation** with customizable weights
- **1-5 scale scoring** with intuitive UI
- **Department-based access control** for managers
- **Quarterly and annual evaluation periods**

### 📈 Decision Support
- **Automated ranking calculation** (overall and department-wise)
- **Best employee identification** per period
- **Performance trend analysis**
- **Comprehensive scoring methodology**

### 📋 Reports & Export
- **Detailed evaluation reports** with rankings
- **Department performance comparison**
- **Printable PDF-ready reports**
- **Export functionality** for data analysis

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Express.js + Node.js
- **Database**: MySQL 8.0+
- **Authentication**: Express Sessions + bcrypt
- **UI Components**: Lucide React icons
- **Styling**: Tailwind CSS with custom design system

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- MySQL 8.0+ server running locally
- Git

### 1. Clone Repository
```bash
git clone <repository-url>
cd employee-dss
```

### 2. Database Setup

#### Install MySQL (if not already installed)
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install mysql-server

# macOS (using Homebrew)
brew install mysql
brew services start mysql

# Windows: Download from https://dev.mysql.com/downloads/mysql/
```

#### Create Database and User
```bash
# Login to MySQL as root
mysql -u root -p

# Create database and user
CREATE DATABASE employee_dss;
CREATE USER 'dss_user'@'localhost' IDENTIFIED BY 'dss_password';
GRANT ALL PRIVILEGES ON employee_dss.* TO 'dss_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### Import Database Schema
```bash
# Import schema and seed data
mysql -u dss_user -p employee_dss < server/database/schema.sql
mysql -u dss_user -p employee_dss < server/database/seed.sql
```

### 3. Backend Setup
```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env

# Edit .env file with your database credentials
DB_HOST=localhost
DB_USER=dss_user
DB_PASSWORD=dss_password
DB_NAME=employee_dss
SESSION_SECRET=your-secret-key-here
PORT=5000
```

### 4. Frontend Setup
```bash
# Navigate to project root
cd ..

# Install dependencies
npm install
```

## 🚀 Running the Application

### Development Mode

#### 1. Start Backend Server
```bash
cd server
npm run dev
# Server runs on http://localhost:5000
```

#### 2. Start Frontend (in new terminal)
```bash
npm run dev
# Frontend runs on http://localhost:5173
```

### Production Build

#### 1. Build Frontend
```bash
npm run build
```

#### 2. Start Production Server
```bash
cd server
npm start
```

## 👥 Demo Accounts

The system comes with pre-configured demo accounts:

| Username | Password | Role | Department |
|----------|----------|------|------------|
| `admin` | `password` | Administrator | System |
| `hr_manager` | `password` | Manager | Human Resources |
| `it_manager` | `password` | Manager | Information Technology |
| `marketing_manager` | `password` | Manager | Marketing |
| `finance_manager` | `password` | Manager | Finance |
| `supervisor` | `password` | Supervisor | All Departments |

## 🎯 Usage Guide

### 1. Login
- Access the application at `http://localhost:5173`
- Use any demo account or create new users
- Role-based dashboard will load automatically

### 2. Employee Management
- **Administrators/Supervisors**: View all employees across departments
- **Managers**: View only employees in their department
- Click on employees to view detailed performance data

### 3. Conducting Evaluations
- Navigate to **Evaluations** tab
- Select an employee to evaluate
- Choose evaluation period (quarterly/annual)
- Rate each criterion on 1-5 scale
- Add optional comments for detailed feedback
- Submit evaluation (automatically calculates weighted scores)

### 4. Viewing Results
- **Dashboard**: Overview of performance metrics
- **Reports**: Detailed evaluation reports with rankings
- **Rankings**: Department and overall performance comparisons

### 5. Decision Support
- System automatically identifies best performers
- Rankings updated in real-time after evaluations
- Export reports for management decisions

## 🔧 Configuration

### Evaluation Criteria
Default criteria with weights:
- **Work Quality** (25%)
- **Productivity** (20%)
- **Communication** (15%)
- **Teamwork** (15%)
- **Initiative** (10%)
- **Punctuality** (10%)
- **Leadership** (5%)

### Scoring Method
- **Simple Additive Weighting (SAW)** algorithm
- Weighted score = Σ(score × weight) / Σ(weights)
- Rankings calculated automatically
- Best performers identified per department and overall

## 🔒 Security Features

- **Session-based authentication** with secure cookies
- **Password hashing** using bcrypt
- **Role-based access control** (RBAC)
- **Department-level data isolation** for managers
- **SQL injection protection** with parameterized queries
- **XSS protection** with input sanitization

## 📊 Database Schema

### Key Tables
- **users**: Authentication and role management
- **employees**: Employee information and department assignment
- **criteria**: Evaluation criteria with weights
- **evaluations**: Individual criterion scores and comments
- **employee_scores**: Calculated weighted scores and rankings
- **evaluation_periods**: Quarterly/annual evaluation cycles

## 🎨 Design System

### Colors
- **Primary**: Blue (#3B82F6)
- **Success**: Green (#10B981)
- **Warning**: Amber (#F59E0B)
- **Error**: Red (#EF4444)
- **Neutral**: Gray scale

### Typography
- **Headings**: Inter font family, bold weights
- **Body**: Inter font family, regular weight
- **Code**: Monospace font family

## 🚀 Deployment

### Local Production Server
```bash
# Build frontend
npm run build

# Start production server
cd server
NODE_ENV=production npm start
```

### Docker Deployment (Optional)
```bash
# Build Docker image
docker build -t employee-dss .

# Run with Docker Compose
docker-compose up -d
```

## 🔍 Troubleshooting

### Common Issues

#### Database Connection Failed
```bash
# Check MySQL service status
sudo systemctl status mysql

# Restart MySQL service
sudo systemctl restart mysql

# Verify database exists
mysql -u dss_user -p -e "SHOW DATABASES;"
```

#### Port Already in Use
```bash
# Find process using port 5000
lsof -i :5000

# Kill process
kill -9 <PID>
```

#### Permission Denied
```bash
# Fix file permissions
chmod +x server/server.js
```

## 📝 API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Employee Endpoints
- `GET /api/employees` - List employees (filtered by role)
- `GET /api/employees/:id` - Get employee details

### Evaluation Endpoints
- `GET /api/evaluations/criteria` - Get evaluation criteria
- `GET /api/evaluations/periods` - Get evaluation periods
- `POST /api/evaluations/submit` - Submit employee evaluation

### Report Endpoints
- `GET /api/reports/evaluation/:periodId` - Get evaluation report
- `GET /api/reports/departments/:periodId` - Get department comparison

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the API documentation

---

**Employee DSS** - Making performance evaluation and employee selection decisions data-driven and objective.