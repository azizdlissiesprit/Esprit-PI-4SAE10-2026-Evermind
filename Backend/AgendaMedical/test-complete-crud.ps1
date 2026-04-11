# Complete CRUD test
Write-Host "=== Testing Complete CRUD Operations ==="

# Test GET all
Write-Host "`n1. GET all appointments:"
try {
    $getResponse = Invoke-WebRequest -Uri 'http://localhost:8080/api/rendezvous' -Method Get
    Write-Host "Success: $($getResponse.Content)"
} catch {
    Write-Host "Error: $($_.Exception.Message)"
}

# Test GET by ID
Write-Host "`n2. GET appointment by ID (1):"
try {
    $getByIdResponse = Invoke-WebRequest -Uri 'http://localhost:8080/api/rendezvous/1' -Method Get
    Write-Host "Success: $($getByIdResponse.Content)"
} catch {
    Write-Host "Error: $($_.Exception.Message)"
}

# Test UPDATE
Write-Host "`n3. UPDATE appointment (ID: 1):"
$updateBody = @{
    patientNom = "Dupont"
    patientPrenom = "Jean-Marie"
    type = "SUIVI"
    statut = "CONFIRME"
    dateHeure = "2026-04-11T10:00"
    dureeMinutes = 45
    notes = "Consultation de suivi"
} | ConvertTo-Json -Depth 10

try {
    $putResponse = Invoke-WebRequest -Uri 'http://localhost:8080/api/rendezvous/1' -Method Put -ContentType 'application/json' -Body $updateBody
    Write-Host "Success: $($putResponse.Content)"
} catch {
    Write-Host "Error: $($_.Exception.Message)"
}

# Test STATS
Write-Host "`n4. GET statistics:"
try {
    $statsResponse = Invoke-WebRequest -Uri 'http://localhost:8080/api/rendezvous/stats' -Method Get
    Write-Host "Success: $($statsResponse.Content)"
} catch {
    Write-Host "Error: $($_.Exception.Message)"
}

# Test SEARCH
Write-Host "`n5. SEARCH appointments (term: 'Dupont'):"
try {
    $searchResponse = Invoke-WebRequest -Uri 'http://localhost:8080/api/rendezvous/search?term=Dupont' -Method Get
    Write-Host "Success: $($searchResponse.Content)"
} catch {
    Write-Host "Error: $($_.Exception.Message)"
}

Write-Host "`n=== CRUD Test Complete ==="
