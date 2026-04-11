# Test PostgreSQL CRUD
Write-Host "=== Testing PostgreSQL CRUD ==="

# Test POST
$body = @{
    patientNom = "Dupont"
    patientPrenom = "Jean"
    type = "CONSULTATION"
    statut = "CONFIRME"
    dateHeure = "2026-04-11T10:00"
    dureeMinutes = 30
    notes = "Premier RDV avec PostgreSQL"
} | ConvertTo-Json -Depth 10

try {
    $postResponse = Invoke-WebRequest -Uri 'http://localhost:8080/api/rendezvous' -Method Post -ContentType 'application/json' -Body $body -ErrorAction Stop
    Write-Host "POST Success: $($postResponse.Content)"
} catch {
    Write-Host "POST Error: $($_.Exception.Message)"
}

# Test GET
try {
    $getResponse = Invoke-WebRequest -Uri 'http://localhost:8080/api/rendezvous' -Method Get
    Write-Host "GET Success: $($getResponse.Content)"
} catch {
    Write-Host "GET Error: $($_.Exception.Message)"
}
