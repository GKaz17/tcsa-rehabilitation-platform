param([string]$Email, [string]$Name)
$ErrorActionPreference = 'Stop'
if (!$Email) { $Email = Read-Host 'Staff email address' }
if (!$Name) { $Name = Read-Host 'Display name' }
Write-Host 'Choose a password of at least 12 characters. It will not be displayed.'
$securePassword = Read-Host 'Password' -AsSecureString
$secureConfirmation = Read-Host 'Confirm password' -AsSecureString
$passwordPtr = [IntPtr]::Zero
$confirmationPtr = [IntPtr]::Zero
try {
    $passwordPtr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
    $confirmationPtr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureConfirmation)
    $plainPassword = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($passwordPtr)
    $confirmation = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($confirmationPtr)
    if ($plainPassword -cne $confirmation) { throw 'Passwords do not match. Run the command again.' }
    $start = [Diagnostics.ProcessStartInfo]::new()
    $start.FileName = 'C:\xampp\php\php.exe'
    $start.Arguments = '"' + (Join-Path $PSScriptRoot 'create-staff.php') + '"'
    $start.UseShellExecute = $false
    $start.CreateNoWindow = $true
    $start.RedirectStandardInput = $true
    $start.StandardInputEncoding = [Text.UTF8Encoding]::new($false)
    $child = [Diagnostics.Process]::Start($start)
    $payload = @{ email = $Email; name = $Name; password = $plainPassword } | ConvertTo-Json -Compress
    $child.StandardInput.Write($payload)
    $child.StandardInput.Close()
    $payload = $plainPassword = $confirmation = $null
    $child.WaitForExit()
    $result = $child.ExitCode
    $child.Dispose()
    if ($result -ne 0) { throw 'Staff account was not created. See the message above.' }
} finally {
    if ($passwordPtr -ne [IntPtr]::Zero) { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($passwordPtr) }
    if ($confirmationPtr -ne [IntPtr]::Zero) { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($confirmationPtr) }
    $plainPassword = $confirmation = $payload = $null
    $securePassword.Dispose()
    $secureConfirmation.Dispose()
}
