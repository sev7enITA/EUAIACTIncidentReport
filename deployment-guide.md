# EU AI Act Incident Reporting Platform - Deployment Guide

## Overview
This platform enables organizations to report AI system incidents in compliance with EU AI Act Article 73. The system includes a complete web application with database backend for collecting, managing, and tracking incident reports.

**Created for:** Fabrizio Degni  
**Version:** 1.0.0  
**Date:** September 2025  

## System Requirements

### Web Server
- Apache 2.4+ or Nginx 1.18+
- PHP 8.0 or higher
- MySQL 8.0 or MariaDB 10.5+
- SSL certificate (recommended for production)

### PHP Extensions Required
- PDO MySQL
- JSON
- mbstring
- openssl
- curl

### Client Requirements
- Modern web browser (Chrome 90+, Firefox 88+, Safari 14+)
- JavaScript enabled
- Local storage support

## Installation Steps

### 1. Database Setup

```bash
# Create database and import schema
mysql -u root -p < ai_incident_database_schema.sql

# Verify installation
mysql -u root -p -e "USE ai_incident_reporting; SHOW TABLES;"
```

### 2. File Deployment

```bash
# Upload web application files
scp -r index.html style.css app.js your-server:/var/www/html/

# Upload PHP backend
scp config.php api.php your-server:/var/www/html/api/
```

### 3. Configuration

#### Database Configuration (config.php)
```php
define('DB_HOST', 'your-database-host');
define('DB_NAME', 'ai_incident_reporting');
define('DB_USER', 'ai_incident_app');
define('DB_PASS', 'your-secure-password');
```

#### Web Server Configuration

**Apache (.htaccess)**
```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^api/(.*)$ api/api.php [QSA,L]

# Security headers
Header always set X-Content-Type-Options nosniff
Header always set X-Frame-Options DENY
Header always set X-XSS-Protection "1; mode=block"
Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
```

**Nginx**
```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    root /var/www/html;
    index index.html;

    # SSL configuration
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;

    # API routing
    location /api/ {
        try_files $uri $uri/ /api/api.php?$query_string;
    }

    # Security headers
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";
}
```

### 4. File Permissions

```bash
# Set proper permissions
chown -R www-data:www-data /var/www/html
chmod 755 /var/www/html
chmod 644 /var/www/html/*.html
chmod 644 /var/www/html/*.css  
chmod 644 /var/www/html/*.js
chmod 750 /var/www/html/api
chmod 640 /var/www/html/api/*.php
```

## Security Considerations

### Database Security
- Use strong passwords for database users
- Limit database user privileges
- Enable MySQL binary logging
- Regular database backups

### Application Security
- Enable HTTPS/SSL
- Implement rate limiting
- Regular security updates
- Input validation and sanitization
- SQL injection protection via prepared statements

### Data Protection
- GDPR compliance measures
- Data encryption at rest
- Audit trail logging
- Access control mechanisms

## API Documentation

### Endpoints

#### Get Incidents
```
GET /api/incidents
Parameters:
- page: Page number (default: 1)
- limit: Items per page (default: 25)
- status: Filter by status
- classification: Filter by classification

Response:
{
  "incidents": [...],
  "pagination": {...}
}
```

#### Create Incident
```
POST /api/incident
Body: JSON with incident data

Response:
{
  "incident_id": "INC-2025-000001",
  "message": "Incident created successfully"
}
```

#### Update Incident
```
PUT /api/incident/{incident_id}
Body: JSON with updated data

Response:
{
  "message": "Incident updated successfully"
}
```

#### Submit Incident
```
POST /api/submit
Body: {"incident_id": "INC-2025-000001"}

Response:
{
  "message": "Incident submitted successfully"
}
```

#### Get Statistics
```
GET /api/statistics

Response:
{
  "overall": {...},
  "by_classification": [...]
}
```

## Monitoring and Maintenance

### Log Files
- Web server access logs
- Web server error logs
- PHP error logs
- MySQL slow query log
- Application audit trail

### Regular Maintenance
- Database optimization
- Log rotation
- Security updates
- Backup verification
- Performance monitoring

### Backup Strategy
```bash
# Daily database backup
mysqldump --single-transaction ai_incident_reporting > backup_$(date +%Y%m%d).sql

# Weekly full backup
tar -czf backup_$(date +%Y%m%d).tar.gz /var/www/html
```

## Troubleshooting

### Common Issues

#### Database Connection Failed
- Check database credentials in config.php
- Verify MySQL service is running
- Check firewall settings

#### Permission Denied Errors
```bash
# Fix file permissions
chown -R www-data:www-data /var/www/html
```

#### API Not Working
- Check web server configuration
- Verify PHP extensions
- Review error logs

### Debug Mode
Enable debug mode in config.php for development:
```php
error_reporting(E_ALL);
ini_set('display_errors', 1);
```

## Performance Optimization

### Database
- Regular OPTIMIZE TABLE commands
- Proper indexing
- Query optimization
- Connection pooling

### Web Application
- Enable gzip compression
- Browser caching headers
- CDN for static assets
- Minification of CSS/JS

## Support and Contact

For technical support or questions:
- Email: admin@fabriziodegni.com
- Documentation: This deployment guide
- Database Schema: ai_incident_database_schema.sql

## License and Copyright

© 2025 Fabrizio Degni. All rights reserved.

This platform is designed for compliance with EU AI Act Article 73 requirements for incident reporting of high-risk AI systems.
