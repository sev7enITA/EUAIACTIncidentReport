
-- EU AI Act Incident Reporting Platform Database Schema
-- Created for Fabrizio Degni
-- Compatible with MySQL 8.0+

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION';

-- Database Creation
DROP DATABASE IF EXISTS `ai_incident_reporting`;
CREATE DATABASE `ai_incident_reporting` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `ai_incident_reporting`;

-- =====================================================
-- MAIN TABLES
-- =====================================================

-- Main incidents table
CREATE TABLE `incidents` (
  `incident_id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `reference_number` VARCHAR(100),
  `status` ENUM('draft', 'submitted', 'under_review', 'closed') DEFAULT 'draft',
  `date_created` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `date_submitted` TIMESTAMP NULL,
  `date_last_modified` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by_ip` VARCHAR(45),
  `version` INT DEFAULT 1,
  INDEX `idx_status` (`status`),
  INDEX `idx_date_created` (`date_created`),
  INDEX `idx_reference_number` (`reference_number`)
) ENGINE=InnoDB;

-- Administrative information
CREATE TABLE `administrative_info` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `incident_id` VARCHAR(50) NOT NULL,
  `market_surveillance_authority_name` VARCHAR(255),
  `authority_reference_number` VARCHAR(100),
  `date_report_submission` DATE,
  `date_incident_from` DATE,
  `date_incident_to` DATE,
  `date_time_detection` DATETIME,
  `manufacturer_awareness_date` DATE,
  `report_type` ENUM('Initial', 'Follow up', 'Combined initial and final', 'Final (Reportable incident)', 'Final (Non-reportable incident)'),
  `expected_next_report_date` DATE,
  `incident_classification` SET('Death', 'Harm to a person\'s health', 'Disruption of the management of critical infrastructure', 'Disruption of the operation of critical infrastructure', 'Infringement of obligations under Union law intended to protect fundamental rights', 'Harm to property', 'Harm to environment', 'All other reportable incidents'),
  `submitter_type` ENUM('Provider', 'Deployer', 'Authorised representative', 'Other'),
  `other_submitter_description` TEXT,
  `incident_already_reported_to` TEXT,
  `under_regulation_law` TEXT,
  FOREIGN KEY (`incident_id`) REFERENCES `incidents`(`incident_id`) ON DELETE CASCADE,
  INDEX `idx_incident_id` (`incident_id`),
  INDEX `idx_report_type` (`report_type`),
  INDEX `idx_incident_classification` (`incident_classification`)
) ENGINE=InnoDB;

-- Contact information (reusable for different contact types)
CREATE TABLE `contacts` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `incident_id` VARCHAR(50) NOT NULL,
  `contact_type` ENUM('provider', 'authorized_representative', 'submitter', 'initial_reporter') NOT NULL,
  `organization_name` VARCHAR(255),
  `first_name` VARCHAR(100),
  `last_name` VARCHAR(100),
  `email` VARCHAR(255),
  `phone` VARCHAR(50),
  `country` VARCHAR(100),
  `street` VARCHAR(255),
  `street_number` VARCHAR(20),
  `address_complement` VARCHAR(255),
  `po_box` VARCHAR(50),
  `city_name` VARCHAR(100),
  `postal_code` VARCHAR(20),
  FOREIGN KEY (`incident_id`) REFERENCES `incidents`(`incident_id`) ON DELETE CASCADE,
  INDEX `idx_incident_contact` (`incident_id`, `contact_type`),
  INDEX `idx_email` (`email`)
) ENGINE=InnoDB;

-- AI System information
CREATE TABLE `ai_system_info` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `incident_id` VARCHAR(50) NOT NULL,
  `eu_database_registration_id` VARCHAR(100),
  `system_name` VARCHAR(255),
  `system_description` TEXT,
  `nomenclature_text` TEXT,
  `model` VARCHAR(255),
  `catalogue_reference_number` VARCHAR(100),
  `serial_number` VARCHAR(100),
  `lot_batch_number` VARCHAR(100),
  `software_version` VARCHAR(100),
  `firmware_version` VARCHAR(100),
  FOREIGN KEY (`incident_id`) REFERENCES `incidents`(`incident_id`) ON DELETE CASCADE,
  INDEX `idx_incident_id` (`incident_id`),
  INDEX `idx_eu_database_id` (`eu_database_registration_id`)
) ENGINE=InnoDB;

-- Incident details
CREATE TABLE `incident_details` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `incident_id` VARCHAR(50) NOT NULL,
  `comprehensive_description` TEXT NOT NULL,
  `estimated_users_affected` INT,
  `operator_type` ENUM('Professional user', 'Other'),
  `operator_description` TEXT,
  `remedial_actions_taken` TEXT,
  FOREIGN KEY (`incident_id`) REFERENCES `incidents`(`incident_id`) ON DELETE CASCADE,
  INDEX `idx_incident_id` (`incident_id`)
) ENGINE=InnoDB;

-- Provider analysis
CREATE TABLE `provider_analysis` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `incident_id` VARCHAR(50) NOT NULL,
  `preliminary_results_conclusions` TEXT,
  `initial_actions_implemented` TEXT,
  `further_investigations_intended` TEXT,
  `root_causes_evaluation` TEXT,
  `rationale_non_reportable` TEXT,
  `risk_assessment_reviewed` BOOLEAN,
  `rationale_no_review` TEXT,
  `risk_assessment_adequate` BOOLEAN,
  `assessment_results` TEXT,
  FOREIGN KEY (`incident_id`) REFERENCES `incidents`(`incident_id`) ON DELETE CASCADE,
  INDEX `idx_incident_id` (`incident_id`)
) ENGINE=InnoDB;

-- General comments
CREATE TABLE `general_comments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `incident_id` VARCHAR(50) NOT NULL,
  `comments` TEXT,
  `information_correct_affirmation` BOOLEAN DEFAULT FALSE,
  `submission_date` DATE,
  FOREIGN KEY (`incident_id`) REFERENCES `incidents`(`incident_id`) ON DELETE CASCADE,
  INDEX `idx_incident_id` (`incident_id`)
) ENGINE=InnoDB;

-- Authority actions and notes
CREATE TABLE `authority_actions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `incident_id` VARCHAR(50) NOT NULL,
  `action_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `authority_name` VARCHAR(255),
  `action_type` ENUM('status_change', 'investigation_note', 'corrective_action', 'follow_up_request'),
  `action_description` TEXT,
  `status_changed_to` ENUM('submitted', 'under_review', 'closed'),
  `created_by` VARCHAR(100),
  FOREIGN KEY (`incident_id`) REFERENCES `incidents`(`incident_id`) ON DELETE CASCADE,
  INDEX `idx_incident_id` (`incident_id`),
  INDEX `idx_action_date` (`action_date`)
) ENGINE=InnoDB;

-- Audit trail
CREATE TABLE `audit_trail` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `incident_id` VARCHAR(50) NOT NULL,
  `action_timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `action_type` ENUM('create', 'update', 'submit', 'status_change', 'delete'),
  `field_changed` VARCHAR(100),
  `old_value` TEXT,
  `new_value` TEXT,
  `user_ip` VARCHAR(45),
  `user_agent` TEXT,
  FOREIGN KEY (`incident_id`) REFERENCES `incidents`(`incident_id`) ON DELETE CASCADE,
  INDEX `idx_incident_id` (`incident_id`),
  INDEX `idx_action_timestamp` (`action_timestamp`)
) ENGINE=InnoDB;

-- =====================================================
-- SAMPLE DATA INSERTION
-- =====================================================

-- Sample incident
INSERT INTO `incidents` (`incident_id`, `reference_number`, `status`, `created_by_ip`) VALUES
('INC-2025-001', 'EU-MSA-2025-001', 'submitted', '192.168.1.1');

-- Sample administrative info
INSERT INTO `administrative_info` (`incident_id`, `market_surveillance_authority_name`, `date_report_submission`, `date_incident_from`, `report_type`, `incident_classification`, `submitter_type`) VALUES
('INC-2025-001', 'Italian Market Surveillance Authority', '2025-01-15', '2025-01-10', 'Initial', 'Harm to a person\'s health', 'Provider');

-- Sample contact (provider)
INSERT INTO `contacts` (`incident_id`, `contact_type`, `organization_name`, `first_name`, `last_name`, `email`, `phone`, `country`, `street`, `city_name`, `postal_code`) VALUES
('INC-2025-001', 'provider', 'AI Solutions Inc.', 'John', 'Doe', 'john.doe@aisolutions.com', '+39-06-12345678', 'Italy', 'Via Roma', 'Rome', '00100');

-- Sample AI system info
INSERT INTO `ai_system_info` (`incident_id`, `system_name`, `system_description`, `model`, `software_version`) VALUES
('INC-2025-001', 'MedicalDiagnosisAI v2.1', 'AI system for medical image analysis and diagnosis recommendation', 'MDA-2024-V2', '2.1.5');

-- Sample incident details
INSERT INTO `incident_details` (`incident_id`, `comprehensive_description`, `estimated_users_affected`, `operator_type`) VALUES
('INC-2025-001', 'AI system provided incorrect analysis of X-ray image leading to misdiagnosis', 1, 'Professional user');

-- =====================================================
-- VIEWS FOR REPORTING
-- =====================================================

-- Comprehensive incident view
CREATE VIEW `incident_full_view` AS
SELECT 
  i.incident_id,
  i.reference_number,
  i.status,
  i.date_created,
  i.date_submitted,
  ai.market_surveillance_authority_name,
  ai.date_report_submission,
  ai.date_incident_from,
  ai.report_type,
  ai.incident_classification,
  ai.submitter_type,
  ais.system_name,
  ais.system_description,
  id.comprehensive_description,
  id.estimated_users_affected,
  pc.organization_name as provider_name,
  pc.email as provider_email
FROM `incidents` i
LEFT JOIN `administrative_info` ai ON i.incident_id = ai.incident_id
LEFT JOIN `ai_system_info` ais ON i.incident_id = ais.incident_id
LEFT JOIN `incident_details` id ON i.incident_id = id.incident_id
LEFT JOIN `contacts` pc ON i.incident_id = pc.incident_id AND pc.contact_type = 'provider';

-- Statistics view
CREATE VIEW `incident_statistics` AS
SELECT 
  COUNT(*) as total_incidents,
  COUNT(CASE WHEN status = 'submitted' THEN 1 END) as submitted_count,
  COUNT(CASE WHEN status = 'under_review' THEN 1 END) as under_review_count,
  COUNT(CASE WHEN status = 'closed' THEN 1 END) as closed_count,
  COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_count,
  AVG(DATEDIFF(COALESCE(date_submitted, NOW()), date_created)) as avg_days_to_submit
FROM `incidents`;

-- =====================================================
-- STORED PROCEDURES
-- =====================================================

DELIMITER //

-- Procedure to create new incident
CREATE PROCEDURE `CreateNewIncident`(
  IN p_incident_id VARCHAR(50),
  IN p_status ENUM('draft', 'submitted', 'under_review', 'closed'),
  IN p_ip_address VARCHAR(45)
)
BEGIN
  INSERT INTO `incidents` (`incident_id`, `status`, `created_by_ip`) 
  VALUES (p_incident_id, p_status, p_ip_address);

  -- Log audit trail
  INSERT INTO `audit_trail` (`incident_id`, `action_type`, `user_ip`) 
  VALUES (p_incident_id, 'create', p_ip_address);
END//

-- Procedure to submit incident
CREATE PROCEDURE `SubmitIncident`(
  IN p_incident_id VARCHAR(50),
  IN p_ip_address VARCHAR(45)
)
BEGIN
  UPDATE `incidents` 
  SET `status` = 'submitted', `date_submitted` = NOW() 
  WHERE `incident_id` = p_incident_id;

  -- Log audit trail
  INSERT INTO `audit_trail` (`incident_id`, `action_type`, `new_value`, `user_ip`) 
  VALUES (p_incident_id, 'submit', 'submitted', p_ip_address);
END//

-- Procedure to get incident statistics by month
CREATE PROCEDURE `GetMonthlyStatistics`(
  IN p_year INT,
  IN p_month INT
)
BEGIN
  SELECT 
    DATE(date_created) as incident_date,
    COUNT(*) as incidents_count,
    incident_classification
  FROM `incidents` i
  JOIN `administrative_info` ai ON i.incident_id = ai.incident_id
  WHERE YEAR(date_created) = p_year AND MONTH(date_created) = p_month
  GROUP BY DATE(date_created), incident_classification
  ORDER BY incident_date;
END//

DELIMITER ;

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX `idx_incidents_created_status` ON `incidents` (`date_created`, `status`);
CREATE INDEX `idx_admin_info_dates` ON `administrative_info` (`date_incident_from`, `date_report_submission`);
CREATE INDEX `idx_contacts_email_country` ON `contacts` (`email`, `country`);
CREATE FULLTEXT INDEX `idx_incident_description` ON `incident_details` (`comprehensive_description`);
CREATE FULLTEXT INDEX `idx_system_description` ON `ai_system_info` (`system_description`);

-- =====================================================
-- TRIGGER FOR AUTOMATIC REFERENCE NUMBERS
-- =====================================================

DELIMITER //

CREATE TRIGGER `generate_reference_number` 
BEFORE INSERT ON `incidents`
FOR EACH ROW
BEGIN
  IF NEW.reference_number IS NULL THEN
    SET NEW.reference_number = CONCAT('AI-ACT-', YEAR(NOW()), '-', LPAD((SELECT COUNT(*) + 1 FROM `incidents` WHERE YEAR(date_created) = YEAR(NOW())), 6, '0'));
  END IF;
END//

DELIMITER ;

-- =====================================================
-- USER AND PERMISSIONS SETUP
-- =====================================================

-- Create application user
CREATE USER 'ai_incident_app'@'%' IDENTIFIED BY 'SecurePassword123!';
GRANT SELECT, INSERT, UPDATE ON `ai_incident_reporting`.* TO 'ai_incident_app'@'%';

-- Create authority user
CREATE USER 'authority_user'@'%' IDENTIFIED BY 'AuthorityPass456!';
GRANT SELECT, INSERT, UPDATE, DELETE ON `ai_incident_reporting`.* TO 'authority_user'@'%';

-- Create read-only reporting user
CREATE USER 'reporting_user'@'%' IDENTIFIED BY 'ReportingPass789!';
GRANT SELECT ON `ai_incident_reporting`.* TO 'reporting_user'@'%';

FLUSH PRIVILEGES;

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

SELECT 'Database schema created successfully! Ready for AI Act incident reporting.' as Status;
