# Validates the draft using the installed XAMPP engine in bootstrap mode.
# No connection, login, service, network listener or existing data directory.
param([string]$ServerBinary = 'C:\xampp\mysql\bin\mysqld.exe', [switch]$UseRunningMySql)

$ErrorActionPreference = 'Stop'
$databaseRoot = Split-Path $PSScriptRoot -Parent
$schema = Get-Content -LiteralPath (Join-Path $databaseRoot 'drafts/001_animal_management.sql') -Raw -Encoding utf8
$validCases = Get-Content -LiteralPath (Join-Path $PSScriptRoot 'schema-valid.sql') -Raw -Encoding utf8
$serverPath = (Resolve-Path -LiteralPath $ServerBinary).Path
$serverBase = Split-Path (Split-Path $serverPath -Parent) -Parent
$temporaryRoot = [IO.Path]::GetFullPath([IO.Path]::GetTempPath()).TrimEnd('\')
$scratchName = 'tcsa-schema-check-' + [Guid]::NewGuid().ToString('N')
$scratchPath = [IO.Path]::GetFullPath((Join-Path $temporaryRoot $scratchName))
$process = $null
$runningDatabase = 'tcsa_schema_check_' + [Guid]::NewGuid().ToString('N')
$runningCreated = $false

function Invoke-BootstrapCheck([string]$Sql, [string]$Name, [int]$ExpectedError = 0) {
    if ($UseRunningMySql) {
        $payload = @{ action = $(if ($script:runningCreated) { 'query' } else { 'setup' });
            database = $runningDatabase;
            sql = $Sql.Replace('CREATE DATABASE tcsa_schema_validation;', '').Replace('USE tcsa_schema_validation;', '') } | ConvertTo-Json -Compress
        $response = $payload | & 'C:\xampp\php\php.exe' (Join-Path $PSScriptRoot 'schema-query.php')
        if ($LASTEXITCODE -ne 0) { throw "$Name could not run against local MySQL." }
        $result = $response | ConvertFrom-Json
        if ($result.created) { $script:runningCreated = $true }
        if ($result.error -ne $ExpectedError) { throw "$Name reported SQL error $($result.error), expected $ExpectedError." }
        Write-Output "PASS: $Name"
        return
    }
    $start = [Diagnostics.ProcessStartInfo]::new()
    $start.FileName = $serverPath
    $start.UseShellExecute = $false
    $start.CreateNoWindow = $true
    $start.RedirectStandardInput = $true
    $start.RedirectStandardOutput = $true
    $start.RedirectStandardError = $true
    $start.StandardInputEncoding = [Text.UTF8Encoding]::new($false)
    foreach ($argument in @('--no-defaults', '--bootstrap', '--skip-networking', '--console',
        "--basedir=$serverBase", "--datadir=$scratchPath", "--tmpdir=$scratchPath",
        '--innodb-buffer-pool-size=32M', '--innodb-log-file-size=8M')) {
        $start.ArgumentList.Add($argument)
    }
    $script:process = [Diagnostics.Process]::Start($start)
    $output = $script:process.StandardOutput.ReadToEndAsync()
    $errors = $script:process.StandardError.ReadToEndAsync()
    try {
        $script:process.StandardInput.WriteLine($Sql)
        $script:process.StandardInput.Close()
    } catch {
        # Preserve the engine's diagnostic if it exits before accepting input.
        $script:process.WaitForExit()
        $startupDetails = $output.GetAwaiter().GetResult() + $errors.GetAwaiter().GetResult()
        throw "${Name}: engine stopped before reading SQL. $startupDetails"
    }
    if (!$script:process.WaitForExit(30000)) {
        $script:process.Kill()
        $script:process.WaitForExit()
        throw "Timed out: $Name"
    }
    $diagnostics = $output.GetAwaiter().GetResult() + $errors.GetAwaiter().GetResult()
    $exitCode = $script:process.ExitCode
    $script:process.Dispose()
    $script:process = $null
    if ($ExpectedError -eq 0) {
        if ($exitCode -ne 0) { throw "$Name failed: $diagnostics" }
    } elseif ($exitCode -eq 0 -or $diagnostics -notmatch "\b$ExpectedError\b") {
        throw "$Name did not report expected SQL error ${ExpectedError}: $diagnostics"
    }
    Write-Output "PASS: $Name"
}

try {
    New-Item -ItemType Directory -Path $scratchPath | Out-Null
    Invoke-BootstrapCheck ("CREATE DATABASE tcsa_schema_validation;`nUSE tcsa_schema_validation;`n" + $schema + "`n" + $validCases) 'schema, intake, Unicode, readmission, history ordering and rollback'

    $invalidCases = @(
        @{ Name = 'duplicate public record'; Error = 1062; Sql = "INSERT INTO animals (record_code, name, species) VALUES ('TCSA-TEST-001', 'Duplicate', 'Cape tortoise');" },
        @{ Name = 'blank animal name'; Error = 4025; Sql = "INSERT INTO animals (record_code, name, species) VALUES ('TCSA-BLANK', '   ', 'Cape tortoise');" },
        @{ Name = 'name length limit'; Error = 1406; Sql = "INSERT INTO animals (record_code, name, species) VALUES ('TCSA-LONG', REPEAT('x', 81), 'Cape tortoise');" },
        @{ Name = 'orphan admission'; Error = 1452; Sql = "INSERT INTO admissions (animal_id, admitted_on, status_code, location, carer_name, reason) VALUES (999, '2026-10-01', 'in_treatment', 'Room A', 'Test carer', 'Observation.');" },
        @{ Name = 'unknown care status'; Error = 1452; Sql = "INSERT INTO admissions (animal_id, admitted_on, status_code, location, carer_name, reason) VALUES (2, '2026-10-01', 'unknown', 'Room A', 'Test carer', 'Observation.');" },
        @{ Name = 'second active admission'; Error = 1062; Sql = "INSERT INTO admissions (animal_id, admitted_on, status_code, location, carer_name, reason) VALUES (1, '2026-10-07', 'in_treatment', 'Room A', 'Test carer', 'Observation.');" },
        @{ Name = 'invalid calendar date'; Error = 1292; Sql = "INSERT INTO admissions (animal_id, admitted_on, status_code, location, carer_name, reason) VALUES (2, '2026-02-30', 'in_treatment', 'Room A', 'Test carer', 'Observation.');" },
        @{ Name = 'release before admission'; Error = 4025; Sql = "UPDATE admissions SET released_on = '2026-08-01' WHERE id = 1;" },
        @{ Name = 'release date on an active case'; Error = 4025; Sql = "UPDATE admissions SET released_on = '2026-10-07' WHERE id = 2;" },
        @{ Name = 'orphan history entry'; Error = 1452; Sql = "INSERT INTO case_history_entries (admission_id, entry_date, note) VALUES (999, '2026-10-07', 'Observation.');" },
        @{ Name = 'blank history note'; Error = 4025; Sql = "INSERT INTO case_history_entries (admission_id, entry_date, note) VALUES (2, '2026-10-07', '   ');" },
        @{ Name = 'history note length limit'; Error = 1406; Sql = "INSERT INTO case_history_entries (admission_id, entry_date, note) VALUES (2, '2026-10-07', REPEAT('x', 1001));" },
        @{ Name = 'animal deletion preserves linked cases'; Error = 1451; Sql = 'DELETE FROM animals WHERE id = 1;' },
        @{ Name = 'case deletion preserves linked history'; Error = 1451; Sql = 'DELETE FROM admissions WHERE id = 1;' }
    )
    foreach ($case in $invalidCases) {
        Invoke-BootstrapCheck ("USE tcsa_schema_validation;`nSET NAMES utf8mb4;`nSET SESSION sql_mode = 'STRICT_TRANS_TABLES,NO_ZERO_DATE,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';`n" + $case.Sql) $case.Name $case.Error
    }
    Write-Output 'All 15 schema checks passed. No application database was changed.'
} finally {
    if ($UseRunningMySql -and $script:runningCreated) {
        if ($runningDatabase -notmatch '^tcsa_schema_check_[a-f0-9]{32}$') { throw 'Unexpected test database name.' }
        $cleanup = @{ action = 'cleanup'; database = $runningDatabase } | ConvertTo-Json -Compress
        $response = $cleanup | & 'C:\xampp\php\php.exe' (Join-Path $PSScriptRoot 'schema-query.php')
        if ($LASTEXITCODE -ne 0 -or ($response | ConvertFrom-Json).error -ne 0) { throw 'The disposable schema-check database could not be removed.' }
    }
    if ($null -ne $script:process) {
        if (!$script:process.HasExited) { $script:process.Kill(); $script:process.WaitForExit() }
        $script:process.Dispose()
        $script:process = $null
    }
    # Verify the absolute target before any recursive cleanup.
    $resolvedScratch = [IO.Path]::GetFullPath($scratchPath)
    if ((Split-Path $resolvedScratch -Parent) -ne $temporaryRoot -or
        (Split-Path $resolvedScratch -Leaf) -ne $scratchName -or
        $scratchName -notmatch '^tcsa-schema-check-[a-f0-9]{32}$') {
        throw 'Refusing cleanup of an unexpected directory.'
    }
    if (Test-Path -LiteralPath $resolvedScratch) {
        Remove-Item -LiteralPath $resolvedScratch -Recurse -Force
    }
}
