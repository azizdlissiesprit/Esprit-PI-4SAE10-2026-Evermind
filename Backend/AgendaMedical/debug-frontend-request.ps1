# Debug script to test the exact format the frontend sends
Write-Host "=== DEBUG FRONTEND REQUEST FORMAT ===" -ForegroundColor Yellow

# Test with the exact format the frontend might send
$testBody = @{
    patientNom = "Test"
    patientPrenom = "Debug"
    type = "CONSULTATION"
    statut = "CONFIRME"
    dateHeure = "2026-04-13T10:00"
    dureeMinutes = 30
    notes = "bn"
} | ConvertTo-Json

Write-Host "Sending request with body:" -ForegroundColor Cyan
Write-Host $testBody

try {
    $result = Invoke-RestMethod -Uri 'http://localhost:8080/api/rendezvous' -Method Post -Body $testBody -ContentType 'application/json'
    Write-Host "SUCCESS: Created appointment" -ForegroundColor Green
    Write-Host "ID: $($result.id)"
    Write-Host "Patient: $($result.patientPrenom) $($result.patientNom)"
}
catch {
    Write-Host "ERROR: $_" -ForegroundColor Red
    Write-Host "Status Code: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    Write-Host "Response: $($_.Exception.Response.GetResponseStream())" -ForegroundColor Red
}

# Test with different date format
Write-Host "`n=== Testing with different date format ===" -ForegroundColor Yellow

$testBody2 = @{
    patientNom = "Test"
    patientPrenom = "Debug2"
    type = "CONSULTATION"
    statut = "CONFIRME"
    dateHeure = "2026-04-13T10:00:00"
    dureeMinutes = 30
    notes = "bn"
} | ConvertTo-Json

try {
    $result2 = Invoke-RestMethod -Uri 'http://localhost:8080/api/rendezvous' -Method Post -Body $testBody2 -ContentType 'application/json'
    Write-Host "SUCCESS: Created appointment with full date format" -ForegroundColor Green
}
catch {
    Write-Host "ERROR with full date format: $_" -ForegroundColor Red
}
