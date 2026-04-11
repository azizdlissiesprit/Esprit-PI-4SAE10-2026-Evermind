# Test script for CRUD API
Write-Host "Testing GET endpoint..."
try {
    $getResponse = Invoke-WebRequest -Uri 'http://localhost:8080/api/rendezvous' -Method Get
    Write-Host "GET Response: $($getResponse.Content)"
} catch {
    Write-Host "GET Error: $($_.Exception.Message)"
}

Write-Host "`nTesting POST endpoint..."
$body = @{
    patientNom = "Dupont"
    patientPrenom = "Jean"
    type = "CONSULTATION"
    statut = "CONFIRME"
    dateHeure = "2026-04-11T10:00"
    dureeMinutes = 30
    notes = "Première consultation"
} | ConvertTo-Json -Depth 10

try {
    $postResponse = Invoke-WebRequest -Uri 'http://localhost:8080/api/rendezvous' -Method Post -ContentType 'application/json' -Body $body
    Write-Host "POST Response: $($postResponse.Content)"
} catch {
    Write-Host "POST Error: $($_.Exception.Message)"
    Write-Host "Response body: $($body)"
}
