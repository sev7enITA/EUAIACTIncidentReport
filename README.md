# EU AI Act Incident Reporting Platform

A comprehensive web-based platform for reporting AI system incidents in compliance with **EU AI Act Article 73**. This MVP (Minimum Viable Product) is designed for sharing with the European Commission and regulatory authorities.

## Features

### 🏛️ Regulatory Compliance
- Full compliance with EU AI Act Article 73 requirements
- Complete incident report form with all 85+ required fields
- Proper data categorization and classification
- Audit trail and documentation

### 🌐 Web Application
- Responsive design for all devices
- Multi-step form with progress tracking
- Real-time validation and error handling
- Draft saving and resumption capability
- Print-friendly reports

### 📊 Management Dashboard
- Incident overview and search
- Status tracking and updates
- Statistical reporting
- Authority access controls

### 🗄️ Database Backend
- Complete MySQL schema
- RESTful API endpoints
- Data security and encryption
- Backup and recovery procedures

## Quick Start

1. **Deploy Database**
   ```bash
   mysql -u root -p < ai_incident_database_schema.sql
   ```

2. **Configure Web Server**
   - Upload HTML, CSS, JS files
   - Configure PHP backend
   - Set proper permissions

3. **Access Platform**
   - Open index.html in web browser
   - Start reporting incidents
   - Use authority dashboard for management

## File Structure

```
├── index.html              # Main web application
├── style.css               # Application styling
├── app.js                  # Frontend JavaScript
├── config.php              # Database configuration
├── api.php                 # REST API endpoints
├── ai_incident_database_schema.sql    # Database schema
├── deployment-guide.md     # Deployment instructions
└── README.md              # This file
```

## System Requirements

- **Web Server:** Apache/Nginx
- **Database:** MySQL 8.0+
- **PHP:** 8.0+
- **Browser:** Modern browsers with JavaScript

## Documentation

See `deployment-guide.md` for complete installation and configuration instructions.

## Copyright

© 2025 Fabrizio Degni. All rights reserved.

Created for EU AI Act Article 73 compliance and incident reporting requirements.
