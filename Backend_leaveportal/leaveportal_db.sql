-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: leaveportal_db
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_logs` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `actor_id` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `action` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `target_table` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `target_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_logs`
--

LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;
INSERT INTO `audit_logs` VALUES ('155356f3-eeed-400b-a02c-ce1ad74ec486',NULL,'LEAVE_APPROVED','leave_requests','79d26371-ade0-4074-a239-bcb696aba8c6','2026-06-26 07:31:58.377'),('1bd3458f-c7bc-461e-a19e-456fcd0dac0a',NULL,'LEAVE_APPROVED','leave_requests','7a55e62d-f4ce-47c4-ba4a-7c4e3b7c34fd','2026-06-26 07:29:51.132'),('2a2c0e15-00a2-4fbc-99d7-ff8ae38c904e',NULL,'LEAVE_REJECTED','leave_requests','28822b38-5480-44d6-975e-40a5091b124f','2026-06-26 09:01:46.044'),('ac854f3e-a0b1-4a5f-b680-a7f6bb8cf648',NULL,'LEAVE_REJECTED','leave_requests','1bdb9d6c-4431-44fa-adb0-ce996dd52e33','2026-06-26 07:33:01.586'),('b8ef40e8-e13c-4e80-a3b7-7acbe48b2ef0',NULL,'LEAVE_APPROVED','leave_requests','0e0ea396-5924-441e-9750-0c638bf285f0','2026-06-25 13:47:19.732');
/*!40000 ALTER TABLE `audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `compoffgrant`
--

DROP TABLE IF EXISTS `compoffgrant`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `compoffgrant` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `employeeId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `daysGranted` double NOT NULL,
  `reason` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `grantedBy` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `grantedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `adminNote` text COLLATE utf8mb4_unicode_ci,
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'approved',
  PRIMARY KEY (`id`),
  KEY `CompOffGrant_employeeId_fkey` (`employeeId`),
  CONSTRAINT `CompOffGrant_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `profiles` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `compoffgrant`
--

LOCK TABLES `compoffgrant` WRITE;
/*!40000 ALTER TABLE `compoffgrant` DISABLE KEYS */;
INSERT INTO `compoffgrant` VALUES ('57fbb64d-a249-4b5c-a82c-67faabb8c391','12548e9e-762c-44dd-a8f1-8a30961636e2',1,'ijijijiji','bf8c0af1-d76a-4484-9145-503db146bf33','2026-07-03 07:53:56.183',NULL,'approved'),('954f33cf-6b47-4e81-9a3e-7d9ae340b522','12548e9e-762c-44dd-a8f1-8a30961636e2',1,'jiijijiji','bf8c0af1-d76a-4484-9145-503db146bf33','2026-07-03 07:49:55.310',NULL,'approved'),('9989468d-50f7-4996-af11-b81e0a13a030','12548e9e-762c-44dd-a8f1-8a30961636e2',1,'please','bf8c0af1-d76a-4484-9145-503db146bf33','2026-07-03 06:38:11.669','','approved');
/*!40000 ALTER TABLE `compoffgrant` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `departments`
--

DROP TABLE IF EXISTS `departments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `departments` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `head_id` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `departments_name_key` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `departments`
--

LOCK TABLES `departments` WRITE;
/*!40000 ALTER TABLE `departments` DISABLE KEYS */;
/*!40000 ALTER TABLE `departments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `holidays`
--

DROP TABLE IF EXISTS `holidays`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `holidays` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `date` datetime(3) NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `type` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'public',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `holidays_date_key` (`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `holidays`
--

LOCK TABLES `holidays` WRITE;
/*!40000 ALTER TABLE `holidays` DISABLE KEYS */;
/*!40000 ALTER TABLE `holidays` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `leave_requests`
--

DROP TABLE IF EXISTS `leave_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `leave_requests` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `employee_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `leave_type` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `start_date` datetime(3) NOT NULL,
  `end_date` datetime(3) NOT NULL,
  `total_days` double NOT NULL,
  `reason` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `approved_by` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `approved_at` datetime(3) DEFAULT NULL,
  `rejected_at` datetime(3) DEFAULT NULL,
  `withdrawal_requested_at` datetime(3) DEFAULT NULL,
  `withdrawn_at` datetime(3) DEFAULT NULL,
  `admin_note` text COLLATE utf8mb4_unicode_ci,
  `withdrawn_dates` json DEFAULT NULL,
  `paid_days` double DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `leave_requests_employee_id_fkey` (`employee_id`),
  KEY `leave_requests_approved_by_fkey` (`approved_by`),
  CONSTRAINT `leave_requests_approved_by_fkey` FOREIGN KEY (`approved_by`) REFERENCES `profiles` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `leave_requests_employee_id_fkey` FOREIGN KEY (`employee_id`) REFERENCES `profiles` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `leave_requests`
--

LOCK TABLES `leave_requests` WRITE;
/*!40000 ALTER TABLE `leave_requests` DISABLE KEYS */;
INSERT INTO `leave_requests` VALUES ('2492184a-3b47-4e38-b198-c0cdbde71dc2','12548e9e-762c-44dd-a8f1-8a30961636e2','Sick Leave (Unpaid - Probation)','2026-07-09 00:00:00.000','2026-07-09 00:00:00.000',1,'jijijijjiji','rejected',NULL,'2026-07-03 07:37:14.738','2026-07-03 07:46:28.644',NULL,'2026-07-03 07:46:28.628',NULL,NULL,'Probation Rule Theek Kiya: Ab probation mein hone ke bawajood agar aapke paas leave balance (jaise Comp-Off se) hai, toh system usko ignore nahi karega aur aapko \"Paid\" leave lene dega!',NULL,NULL),('29b7a195-33c4-4347-ac87-8ab3722092e7','12548e9e-762c-44dd-a8f1-8a30961636e2','Sick Leave (Paid)','2026-07-16 00:00:00.000','2026-07-16 00:00:00.000',0.5,'[Half-Day: Morning] wewws','rejected',NULL,'2026-07-03 09:11:39.301','2026-07-03 09:14:30.602',NULL,'2026-07-03 09:14:30.600',NULL,NULL,'qqqqqq',NULL,NULL),('4424f9ce-1f0a-4e3f-a4ea-d266a030e595','12548e9e-762c-44dd-a8f1-8a30961636e2','Sick Leave (Paid)','2026-07-22 00:00:00.000','2026-07-24 00:00:00.000',3,'kokokokoko','cancelled',NULL,'2026-07-03 08:49:09.973','2026-07-03 08:55:33.223',NULL,NULL,NULL,'2026-07-03 08:55:33.187',NULL,'null',NULL),('48c3d0e0-5ba4-4eb1-a5d1-93bdbfa638c8','12548e9e-762c-44dd-a8f1-8a30961636e2','Casual Leave (0.5 Paid, 0.5 Unpaid - Probation)','2026-07-15 00:00:00.000','2026-07-15 00:00:00.000',1,'swsww','rejected',NULL,'2026-07-03 09:12:08.724','2026-07-03 09:14:24.545',NULL,'2026-07-03 09:14:24.541',NULL,NULL,'qqqqq',NULL,NULL),('4a04c426-9fed-40d6-8f7d-36905fe88ec3','12548e9e-762c-44dd-a8f1-8a30961636e2','Casual Leave (Unpaid - Probation)','2026-07-09 00:00:00.000','2026-07-13 00:00:00.000',5,'jjjjjjjj','cancelled',NULL,'2026-07-01 13:46:13.159','2026-07-01 14:02:59.579',NULL,NULL,NULL,'2026-07-01 14:02:59.574',NULL,'null',NULL),('586df09b-93b4-4bdb-b31a-239e0bd16b7f','12548e9e-762c-44dd-a8f1-8a30961636e2','Sick Leave (3 Paid, 5 Unpaid - Probation)','2026-07-07 00:00:00.000','2026-07-16 00:00:00.000',3,'qwewqw','cancelled',NULL,'2026-07-03 09:15:13.230','2026-07-03 09:16:15.256',NULL,NULL,NULL,'2026-07-03 09:16:15.254',NULL,'null',NULL),('61eb5edc-ceed-488d-bc30-fd10feaee341','12548e9e-762c-44dd-a8f1-8a30961636e2','Sick Leave (Paid)','2026-07-21 00:00:00.000','2026-07-21 00:00:00.000',1,'lllllll','rejected',NULL,'2026-07-03 08:57:24.297','2026-07-03 09:08:10.507',NULL,'2026-07-03 09:08:10.503',NULL,NULL,'ppppppp',NULL,NULL),('6472a17e-74d9-45f9-9a1a-66466cdd7105','12548e9e-762c-44dd-a8f1-8a30961636e2','Casual Leave (Paid)','2026-07-07 00:00:00.000','2026-07-07 00:00:00.000',1,'qwqwq22','rejected',NULL,'2026-07-03 09:02:50.127','2026-07-03 09:08:01.897',NULL,'2026-07-03 09:08:01.889',NULL,NULL,'ooooooo',NULL,NULL),('68c165a2-129e-47b7-825e-4058d65b7681','12548e9e-762c-44dd-a8f1-8a30961636e2','Sick Leave (Paid)','2026-07-07 00:00:00.000','2026-07-07 00:00:00.000',1,'kokokoko','rejected',NULL,'2026-07-03 09:16:35.513','2026-07-03 10:43:44.923',NULL,'2026-07-03 10:43:44.920',NULL,NULL,'hgytt',NULL,NULL),('6eb460f3-e542-45de-a48f-4bb206c4a257','12548e9e-762c-44dd-a8f1-8a30961636e2','Sick Leave (Paid)','2026-07-06 00:00:00.000','2026-07-06 00:00:00.000',1,'uuiui','rejected',NULL,'2026-07-03 09:08:26.050','2026-07-03 09:14:45.959',NULL,'2026-07-03 09:14:45.929',NULL,NULL,'qqqqqqq',NULL,NULL),('7114475d-21fd-4652-b141-2bb91704b290','12548e9e-762c-44dd-a8f1-8a30961636e2','Sick Leave (Unpaid - Probation)','2026-07-24 00:00:00.000','2026-07-27 00:00:00.000',4,'sasaaaaaa','cancelled',NULL,'2026-07-01 13:57:22.931','2026-07-01 14:02:38.817',NULL,NULL,NULL,'2026-07-01 14:02:38.779',NULL,'null',NULL),('895b8d9d-36fd-42e6-8bda-c92bb73e68b0','12548e9e-762c-44dd-a8f1-8a30961636e2','Casual Leave (Paid)','2026-07-17 00:00:00.000','2026-07-21 00:00:00.000',3,'jijijijiji','cancelled',NULL,'2026-07-03 07:58:16.987','2026-07-03 08:48:35.092',NULL,NULL,NULL,'2026-07-03 08:48:35.081',NULL,'null',NULL),('8aeb1a9a-1223-4cb3-8efa-ab2c857bb32c','12548e9e-762c-44dd-a8f1-8a30961636e2','Sick Leave (Unpaid - Probation)','2026-07-16 00:00:00.000','2026-07-20 00:00:00.000',5,'huhuhuhu','rejected',NULL,'2026-07-01 13:13:40.846','2026-07-01 13:38:14.030',NULL,'2026-07-01 13:38:14.026',NULL,NULL,'kokokokoko',NULL,NULL),('ab3a6f4f-2ce9-460b-a929-97216c0d04b0','12548e9e-762c-44dd-a8f1-8a30961636e2','Sick Leave (Paid)','2026-07-24 00:00:00.000','2026-07-24 00:00:00.000',1,'pppppp','rejected',NULL,'2026-07-03 09:09:11.281','2026-07-03 09:14:40.831',NULL,'2026-07-03 09:14:40.826',NULL,NULL,'qqqqqq',NULL,NULL),('aca074e1-1041-4aec-906d-d4436b5f0e40','12548e9e-762c-44dd-a8f1-8a30961636e2','Sick Leave (Unpaid - Probation)','2026-07-23 00:00:00.000','2026-07-27 00:00:00.000',5,'lllllllll','rejected',NULL,'2026-07-01 12:50:09.235','2026-07-01 12:59:09.010',NULL,'2026-07-01 12:59:08.970',NULL,NULL,'jijiji',NULL,NULL),('b6cfcc4b-6ead-4eca-a75c-ec63ec73b7fd','12548e9e-762c-44dd-a8f1-8a30961636e2','Sick Leave (Unpaid - Probation)','2026-07-07 00:00:00.000','2026-07-07 00:00:00.000',1,'qiqiiqi','cancelled',NULL,'2026-07-01 13:41:50.542','2026-07-01 13:43:50.419',NULL,NULL,NULL,'2026-07-01 13:43:50.408',NULL,'null',NULL),('bba6c7b0-2d4f-4f00-87f1-35fb49b4ac6f','12548e9e-762c-44dd-a8f1-8a30961636e2','Casual Leave (Unpaid - Probation)','2026-07-09 00:00:00.000','2026-07-10 00:00:00.000',1,'aise hi ','rejected',NULL,'2026-07-01 11:46:38.245','2026-07-01 13:03:09.772',NULL,'2026-07-01 13:03:09.769',NULL,NULL,'aise hi ','[\"2026-07-10\"]',NULL),('dab1c2ad-1847-4f01-b99a-fc33e9899868','12548e9e-762c-44dd-a8f1-8a30961636e2','Casual Leave (Unpaid - Probation)','2026-07-10 00:00:00.000','2026-07-13 00:00:00.000',2,'opopopopo','approved',NULL,'2026-07-01 14:03:24.621','2026-07-01 14:04:30.803','2026-07-01 14:04:30.797',NULL,NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `leave_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `profiles`
--

DROP TABLE IF EXISTS `profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `profiles` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `full_name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'employee',
  `department_id` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `designation` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `employee_code` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date_of_joining` datetime(3) DEFAULT NULL,
  `total_leaves` int NOT NULL DEFAULT '0',
  `available_leaves` double NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '0',
  `verification_status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `is_deleted` tinyint(1) NOT NULL DEFAULT '0',
  `email_verified` tinyint(1) NOT NULL DEFAULT '0',
  `otp_code` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `otp_expires_at` datetime(3) DEFAULT NULL,
  `reset_token` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reset_token_expires_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `profiles_email_key` (`email`),
  UNIQUE KEY `profiles_employee_code_key` (`employee_code`),
  KEY `profiles_department_id_fkey` (`department_id`),
  CONSTRAINT `profiles_department_id_fkey` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `profiles`
--

LOCK TABLES `profiles` WRITE;
/*!40000 ALTER TABLE `profiles` DISABLE KEYS */;
INSERT INTO `profiles` VALUES ('12548e9e-762c-44dd-a8f1-8a30961636e2','Prem','premn7111@gmail.com','$2b$10$FwS/3sTwSxfcNeAOR8K5d.flHAO.FLuGjki49c7EUY.dNQ0O7ss3e','','employee',NULL,'Marketing',NULL,'2026-06-30 00:00:00.000',0,3,1,'approved','2026-06-30 11:55:06.923','2026-07-03 10:43:44.944',0,1,NULL,NULL,'850212','2026-06-29 13:49:26.939'),('37357d3a-0bde-4eac-8fc8-6356830afe44','Sweety Agarwal','sweetyagarwal3113@gmail.com','$2b$10$Lp0kX8YFENvDZUldkQ4O0uQqBM7A8KLOPfRP3fLLtBJ94mqpQto/i','','employee',NULL,'Full Stack Developer',NULL,NULL,0,0,1,'approved','2026-06-26 12:49:14.810','2026-07-02 11:26:45.994',0,1,NULL,NULL,NULL,NULL),('453aed27-08f8-4fd6-8a5b-792e9be0ad61','Vijay Kamlani','kamlani.vijay@gmail.com','$2b$10$f1IjlswWkODCrK37qbpCze0KLQHW23CwFxLjr1/0956qXN1OcGzX6',NULL,'employee',NULL,NULL,NULL,NULL,0,0,1,'approved','2026-07-06 11:49:13.021','2026-07-06 11:49:13.021',0,1,NULL,NULL,NULL,NULL),('71b4c6c4-ca0f-493e-9293-fde4e8caadf3','Prem ','praffulsharma@gmail.com','$2b$10$WxRPkF4FbKYzQkCUXUiQj.1C/MEUZX2cf89kdqYuzL9g4R2PRs162',NULL,'employee',NULL,NULL,NULL,NULL,0,0,0,'rejected','2026-06-29 13:15:35.173','2026-07-02 11:26:45.994',0,0,'763427','2026-06-29 13:25:35.166',NULL,NULL),('7ab70d5a-ac5d-4e9f-9b45-e4f2aede9958','Virendra','virendrapratapsingh2408@gmail.com','$2b$10$8wNokEpGhtsOETlgXAAT0.CIv0DbNTRNe8q.YBup7TMZ96Ej8dxCu','','employee',NULL,'Appian Developer',NULL,'2025-12-01 00:00:00.000',0,0,1,'approved','2026-06-26 13:55:37.622','2026-07-02 11:26:45.994',0,1,NULL,NULL,NULL,NULL),('997faf82-c69e-4b2a-b60e-2b15794e9564','Prem Nankani','2024bcamafsprem17028@poornima.edu.in','$2b$10$9GUfiCrPQ1XjfJCAtk.dMOvXhfVlYOZrx6UYM0zEU2Bncp/3ZcoDi',NULL,'hr',NULL,NULL,NULL,NULL,0,0,1,'approved','2026-06-30 08:05:51.530','2026-06-30 10:58:30.704',0,1,NULL,NULL,NULL,NULL),('b8187661-88bc-4f3f-8b7c-c12cacb81019','Kapil Sharma','qapil.sharma1702@gmail.com','$2b$10$cvec9po5eR6.VA0YztahHejdXIH0MpiX28fosBZrbOLFTAbeelzzu',NULL,'employee',NULL,NULL,NULL,NULL,0,0,1,'approved','2026-07-06 11:49:13.087','2026-07-06 11:49:13.087',0,1,NULL,NULL,NULL,NULL),('bf8c0af1-d76a-4484-9145-503db146bf33','Prem ','premnankani99@gmail.com','$2b$10$64586yJY0RUJwlBLd36JR.fnT81cYI9T9Buh1OEHLirJb7sQ0D9La',NULL,'admin',NULL,NULL,NULL,NULL,0,0,0,'rejected','2026-06-26 11:15:12.030','2026-06-30 10:58:30.704',0,1,NULL,NULL,NULL,NULL),('d1dde2a7-7bf0-4eae-a25f-1b36fb148d49','Harish Gyanani','gyanani.harish@gmail.com','$2b$10$/uVgT4RTul4JhZ7KGqcAX.VmV0u1qyC77ItDxWFiImeYjtlO.81gK',NULL,'employee',NULL,NULL,NULL,NULL,0,0,1,'approved','2026-07-06 11:49:12.952','2026-07-06 11:49:12.952',0,1,NULL,NULL,NULL,NULL),('f251311e-81db-49b7-9daa-4f0937ce48e8','Prerna Kanjani','kanjaniprerna1@gmail.com','$2b$10$WLMV1OJiviIZuw2c.nk4KuO4TNCflCxbpz2YiEWMv8VQm6JhQBqcy',NULL,'employee',NULL,NULL,NULL,NULL,0,0,1,'approved','2026-07-06 11:49:12.862','2026-07-06 11:49:12.862',0,1,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `profiles` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-07-06 17:25:17
