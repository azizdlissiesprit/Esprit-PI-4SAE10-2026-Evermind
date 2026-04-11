# Test complet du CRUD avec PostgreSQL
Write-Host "=== Test complet CRUD avec PostgreSQL ==="

# 1. Test POST - Création
Write-Host "`n1. Création d'un rendez-vous:"
$body = @{
    patientNom = "Martin"
    patientPrenom = "Sophie"
    type = "CONSULTATION"
    statut = "CONFIRME"
    dateHeure = "2026-04-12T14:30"
    dureeMinutes = 45
    notes = "Test CRUD PostgreSQL - Création"
} | ConvertTo-Json -Depth 10

try {
    $postResponse = Invoke-WebRequest -Uri 'http://localhost:8080/api/rendezvous' -Method Post -ContentType 'application/json' -Body $body -ErrorAction Stop
    $createdRDV = $postResponse.Content | ConvertFrom-Json
    Write-Host "✅ POST Success: ID=$($createdRDV.id), GoogleEventId=$($createdRDV.googleEventId)"
    $rdvId = $createdRDV.id
} catch {
    Write-Host "❌ POST Error: $($_.Exception.Message)"
    exit
}

# 2. Test GET - Récupération par ID
Write-Host "`n2. Récupération par ID ($rdvId):"
try {
    $getByIdResponse = Invoke-WebRequest -Uri "http://localhost:8080/api/rendezvous/$rdvId" -Method Get -ErrorAction Stop
    Write-Host "✅ GET by ID Success: $($getByIdResponse.Content)"
} catch {
    Write-Host "❌ GET by ID Error: $($_.Exception.Message)"
}

# 3. Test PUT - Mise à jour
Write-Host "`n3. Mise à jour du rendez-vous ($rdvId):"
$updateBody = @{
    patientNom = "Martin"
    patientPrenom = "Sophie"
    type = "SUIVI"
    statut = "CONFIRME"
    dateHeure = "2026-04-12T15:00"
    dureeMinutes = 30
    notes = "Test CRUD PostgreSQL - Mise à jour"
} | ConvertTo-Json -Depth 10

try {
    $putResponse = Invoke-WebRequest -Uri "http://localhost:8080/api/rendezvous/$rdvId" -Method Put -ContentType 'application/json' -Body $updateBody -ErrorAction Stop
    Write-Host "✅ PUT Success: $($putResponse.Content)"
} catch {
    Write-Host "❌ PUT Error: $($_.Exception.Message)"
}

# 4. Test GET all - Vérification
Write-Host "`n4. Récupération de tous les rendez-vous:"
try {
    $getAllResponse = Invoke-WebRequest -Uri 'http://localhost:8080/api/rendezvous' -Method Get -ErrorAction Stop
    Write-Host "✅ GET all Success: $($getAllResponse.Content)"
} catch {
    Write-Host "❌ GET all Error: $($_.Exception.Message)"
}

# 5. Test STATS
Write-Host "`n5. Statistiques:"
try {
    $statsResponse = Invoke-WebRequest -Uri 'http://localhost:8080/api/rendezvous/stats' -Method Get -ErrorAction Stop
    Write-Host "✅ STATS Success: $($statsResponse.Content)"
} catch {
    Write-Host "❌ STATS Error: $($_.Exception.Message)"
}

# 6. Test SEARCH
Write-Host "`n6. Recherche (Martin):"
try {
    $searchResponse = Invoke-WebRequest -Uri 'http://localhost:8080/api/rendezvous/search?term=Martin' -Method Get -ErrorAction Stop
    Write-Host "✅ SEARCH Success: $($searchResponse.Content)"
} catch {
    Write-Host "❌ SEARCH Error: $($_.Exception.Message)"
}

# 7. Test DELETE - Suppression
Write-Host "`n7. Suppression du rendez-vous ($rdvId):"
try {
    $deleteResponse = Invoke-WebRequest -Uri "http://localhost:8080/api/rendezvous/$rdvId" -Method Delete -ErrorAction Stop
    Write-Host "✅ DELETE Success: Rendez-vous supprimé"
} catch {
    Write-Host "❌ DELETE Error: $($_.Exception.Message)"
}

# 8. Vérification finale
Write-Host "`n8. Vérification finale (GET all):"
try {
    $finalResponse = Invoke-WebRequest -Uri 'http://localhost:8080/api/rendezvous' -Method Get -ErrorAction Stop
    Write-Host "✅ Final GET Success: $($finalResponse.Content)"
} catch {
    Write-Host "❌ Final GET Error: $($_.Exception.Message)"
}

Write-Host "`n=== Test CRUD PostgreSQL terminé ==="
