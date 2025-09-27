# EU AI Act Incident Reporting Platform

A comprehensive web-based platform for reporting AI system incidents in compliance with **EU AI Act Article 73**. This MVP (Minimum Viable Product) is designed for sharing with the European Commission and regulatory authorities.


The EU AI Act is a landmark regulation for trustworthy AI, but its practical implementation hinges on efficient processes. One of the first challenges? The reporting of serious AI incidents.

The official template is a PDF form. While it standardises the required information—from administrative details and AI system categorisation to provider root cause analysis —relying on a static document format creates significant bottlenecks:
- *Data silos*: Each report is an isolated file, making it incredibly difficult for market surveillance authorities to aggregate data, spot trends, or perform cross-incident analysis.
- *Administrative burden*: Manual data entry into PDFs is slow and prone to errors. Imagine teams copying information from dozens of these forms into a central spreadsheet for analysis.
- *Lack of validation*: A PDF cannot enforce data formats, such as the required YYYY-MM-DD for dates , or provide dropdowns for classifications like "Harm to a person's health" or "Disruption of the operation of critical infrastructure". This leads to inconsistent and poor-quality data.

There is a better way. We need to move from documents to data.

The proposal is an open-source platform that transforms this reporting process. It turns the static form into a dynamic, web-based tool with a SQL database backend.
The benefits are immediate:

- *Streamlined reporting*: A clean, user-friendly interface for providers and deployers to submit incident reports.
- *Centralised database*: All incident data is captured in a structured, queryable format, enabling real-time analytics for regulators.
- *Improved data quality*: Built-in validation ensures that information is consistent and accurate from the start.
- *Actionable insights: Authorities can easily analyse incident causes, track corrective actions, and make informed decisions to protect citizens.

This is a proof-of-concept for how we can bridge the gap between regulation and effective, technology-driven implementation.


# AI Act: Commission issues draft guidance and reporting template on serious AI incidents, and seeks stakeholders': 
https://digital-strategy.ec.europa.eu/en/consultations/ai-act-commission-issues-draft-guidance-and-reporting-template-serious-ai-incidents-and-seeks

## Features

### Regulatory compliance
- Full compliance with EU AI Act Article 73 requirements
- Complete incident report form with all 85+ required fields
- Proper data categorization and classification
- Audit trail and documentation

### Web application
- Responsive design for all devices
- Multi-step form with progress tracking
- Real-time validation and error handling
- Draft saving and resumption capability
- Print-friendly reports

### Management dashboard
- Incident overview and search
- Status tracking and updates
- Statistical reporting
- Authority access controls

### Database backend
- Complete MySQL schema
- RESTful API endpoints (tbd)
- Data security and encryption (tbd)
- Backup and recovery procedures (tbd)

## Quick Start

1. **Deploy database**
   ```bash
   mysql -u root -p < ai_incident_database_schema.sql
   ```

2. **Configure Web server**
   - Upload HTML, CSS, JS files
   - Configure PHP backend
   - Set proper permissions

3. **Access platform**
   - Open index.html in web browser
   - Start reporting incidents
   - Use authority dashboard for management

## File structure

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

## System requirements

- **Web Server:** Apache/Nginx
- **Database:** MySQL 8.0+
- **PHP:** 8.0+
- **Browser:** Modern browsers with JavaScript

## Documentation

See `deployment-guide.md` for complete installation and configuration instructions.

## Copyright

© 2025 Fabrizio Degni. All rights reserved.

Created for EU AI Act Article 73 compliance and incident reporting requirements.
