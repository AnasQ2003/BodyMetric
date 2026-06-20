-- ============================================================
--  BodyMetric — SQL Server Database Setup Script
--  Run this in SSMS or sqlcmd against your SQL Server instance
-- ============================================================

USE master;
GO

-- ── Create database if it doesn't exist ──────────────────────
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'BodyMetricDB')
BEGIN
    CREATE DATABASE BodyMetricDB;
    PRINT '✅ BodyMetricDB created.';
END
GO

USE BodyMetricDB;
GO

-- ============================================================
--  TABLE: Users (Profiles)
-- ============================================================
IF OBJECT_ID('dbo.Users', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Users (
        id             INT IDENTITY(1,1) PRIMARY KEY,
        name           NVARCHAR(100)   NOT NULL,
        email          NVARCHAR(255)   NOT NULL UNIQUE,
        password_hash  NVARCHAR(255)   NOT NULL,   -- bcrypt hash
        age            INT             NOT NULL DEFAULT 25,
        gender         NVARCHAR(10)    NOT NULL DEFAULT 'male',
        height         FLOAT           NOT NULL DEFAULT 172.0, -- in cm
        weight         FLOAT           NOT NULL DEFAULT 68.0,  -- in kg
        goal           NVARCHAR(20)    NOT NULL DEFAULT 'maintain', -- 'lose' | 'maintain' | 'gain'
        target_weight  FLOAT           NOT NULL DEFAULT 68.0,
        activity_level NVARCHAR(20)    NOT NULL DEFAULT 'moderate', -- 'low' | 'moderate' | 'high'
        avatar_hue     INT             NOT NULL DEFAULT 295,
        onboarded      BIT             NOT NULL DEFAULT 0,
        created_at     DATETIME2       NOT NULL DEFAULT GETDATE(),
        updated_at     DATETIME2       NOT NULL DEFAULT GETDATE()
    );
    PRINT '✅ Table Users created.';
END
GO

-- ============================================================
--  TABLE: BmiEntries (Weight History logs)
-- ============================================================
IF OBJECT_ID('dbo.BmiEntries', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.BmiEntries (
        id          NVARCHAR(50)    PRIMARY KEY,   -- client-side UUID
        user_id     INT             NOT NULL REFERENCES dbo.Users(id) ON DELETE CASCADE,
        date        NVARCHAR(50)    NOT NULL,      -- ISO string
        weight      FLOAT           NOT NULL,
        height      FLOAT           NOT NULL,
        age         INT             NOT NULL,
        gender      NVARCHAR(10)    NOT NULL,
        bmi         FLOAT           NOT NULL,
        category    NVARCHAR(50)    NOT NULL,
        created_at  DATETIME2       NOT NULL DEFAULT GETDATE()
    );
    PRINT '✅ Table BmiEntries created.';
END
GO

-- ============================================================
--  TABLE: Activities (Exercise log)
-- ============================================================
IF OBJECT_ID('dbo.Activities', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Activities (
        id          NVARCHAR(50)    PRIMARY KEY,   -- client-side UUID
        user_id     INT             NOT NULL REFERENCES dbo.Users(id) ON DELETE CASCADE,
        date        NVARCHAR(50)    NOT NULL,      -- ISO string
        type        NVARCHAR(100)   NOT NULL,      -- e.g. 'Running', 'Cycling'
        minutes     INT             NOT NULL,
        calories    INT             NOT NULL,
        created_at  DATETIME2       NOT NULL DEFAULT GETDATE()
    );
    PRINT '✅ Table Activities created.';
END
GO

-- ============================================================
--  TABLE: Notifications
-- ============================================================
IF OBJECT_ID('dbo.Notifications', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Notifications (
        id         NVARCHAR(50)    PRIMARY KEY,   -- client-side UUID
        user_id    INT             NOT NULL REFERENCES dbo.Users(id) ON DELETE CASCADE,
        date       NVARCHAR(50)    NOT NULL,      -- ISO string
        title      NVARCHAR(200)   NOT NULL,
        body       NVARCHAR(500)   NOT NULL,
        kind       NVARCHAR(50)    NOT NULL,      -- 'tip' | 'goal' | 'reminder' | 'achievement'
        route      NVARCHAR(200)   NOT NULL,
        read       BIT             NOT NULL DEFAULT 0,
        created_at DATETIME2       NOT NULL DEFAULT GETDATE()
    );
    PRINT '✅ Table Notifications created.';
END
GO

-- ============================================================
--  SEED: First user — Anas (email: anas@example.com, password: anas123)
--  Bcrypt hash of 'anas123' (10 rounds):
--    $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHi
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM dbo.Users WHERE email = 'anas@example.com')
BEGIN
    INSERT INTO dbo.Users
        (name, email, password_hash, age, gender, height, weight, goal, target_weight, activity_level, avatar_hue, onboarded)
    VALUES
        (
            'Anas',
            'anas@example.com',
            '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHi',
            25,
            'male',
            172.0,
            68.0,
            'maintain',
            68.0,
            'moderate',
            295,
            1
        );
    PRINT '✅ Seed user Anas inserted (email: anas@example.com, password: anas123).';
END
GO

-- ============================================================
--  SEED: Default logs & weight history for Anas
-- ============================================================
DECLARE @anasId INT = (SELECT id FROM dbo.Users WHERE email = 'anas@example.com');
IF @anasId IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.BmiEntries WHERE user_id = @anasId)
BEGIN
    INSERT INTO dbo.BmiEntries (id, user_id, date, weight, height, age, gender, bmi, category) VALUES
    ('e1', @anasId, '2026-06-18T10:00:00.000Z', 70.5, 172.0, 25, 'male', 23.8, 'Healthy'),
    ('e2', @anasId, '2026-06-19T10:00:00.000Z', 69.2, 172.0, 25, 'male', 23.4, 'Healthy'),
    ('e3', @anasId, '2026-06-20T10:00:00.000Z', 68.0, 172.0, 25, 'male', 23.0, 'Healthy');
    PRINT '✅ Seed BMI entries for Anas inserted.';
END
GO

-- ============================================================
--  SEED: Default activities for Anas
-- ============================================================
DECLARE @anasId2 INT = (SELECT id FROM dbo.Users WHERE email = 'anas@example.com');
IF @anasId2 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.Activities WHERE user_id = @anasId2)
BEGIN
    INSERT INTO dbo.Activities (id, user_id, date, type, minutes, calories) VALUES
    ('act1', @anasId2, '2026-06-18T11:00:00.000Z', 'Running', 30, 320),
    ('act2', @anasId2, '2026-06-19T15:30:00.000Z', 'Cycling', 45, 410),
    ('act3', @anasId2, '2026-06-20T08:00:00.000Z', 'Swimming', 20, 250);
    PRINT '✅ Seed activities for Anas inserted.';
END
GO

-- ============================================================
--  SEED: Default notifications for Anas
-- ============================================================
DECLARE @anasId3 INT = (SELECT id FROM dbo.Users WHERE email = 'anas@example.com');
IF @anasId3 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.Notifications WHERE user_id = @anasId3)
BEGIN
    INSERT INTO dbo.Notifications (id, user_id, date, title, body, kind, route, read) VALUES
    ('n1', @anasId3, '2026-06-20T12:00:00.000Z', 'Welcome to BMI Pulse 🎉', 'Tap to log your first measurement.', 'reminder', '/home', 0),
    ('n2', @anasId3, '2026-06-20T11:00:00.000Z', 'Daily tip ready', 'Hydrate — 2L of water boosts metabolism.', 'tip', '/tips', 0),
    ('n3', @anasId3, '2026-06-19T12:00:00.000Z', 'Goal progress', 'You''re 18% closer to your target. Keep going!', 'goal', '/goals', 1);
    PRINT '✅ Seed notifications for Anas inserted.';
END
GO

-- ============================================================
--  VERIFY
-- ============================================================
SELECT 'Users'         AS [Table], COUNT(*) AS [Rows] FROM dbo.Users         UNION ALL
SELECT 'BmiEntries',                COUNT(*)            FROM dbo.BmiEntries    UNION ALL
SELECT 'Activities',                COUNT(*)            FROM dbo.Activities    UNION ALL
SELECT 'Notifications',            COUNT(*)            FROM dbo.Notifications;
GO

PRINT '🎉 BodyMetricDB setup complete!';
GO
