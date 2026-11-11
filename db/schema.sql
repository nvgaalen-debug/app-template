-- Basisschema voor de template. Veilig om opnieuw uit te voeren.

IF OBJECT_ID('dbo.settings', 'U') IS NULL
CREATE TABLE dbo.settings (
    [key]      NVARCHAR(100)  NOT NULL PRIMARY KEY,
    value      NVARCHAR(MAX)  NULL,
    updated_at DATETIME2      NOT NULL DEFAULT SYSUTCDATETIME()
);

IF OBJECT_ID('dbo.items', 'U') IS NULL
CREATE TABLE dbo.items (
    id          INT IDENTITY(1,1) PRIMARY KEY,
    name        NVARCHAR(200)  NOT NULL,
    description NVARCHAR(1000) NULL,
    created_by  NVARCHAR(256)  NULL,
    created_at  DATETIME2      NOT NULL DEFAULT SYSUTCDATETIME()
);

-- Startinstellingen (alleen toevoegen als ze nog niet bestaan)
IF NOT EXISTS (SELECT 1 FROM dbo.settings WHERE [key] = 'app_name')
INSERT INTO dbo.settings ([key], value) VALUES ('app_name', 'Mijn app');
