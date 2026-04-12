$body = @{
    patientNom = "Test"
    patientPrenom = "User"
    type = "CONSULTATION"
    statut = "CONFIRME"
    dateHeure = "2026-04-12T10:00:00"
    dureeMinutes = 30
    notes = "Test appointment creation"
} | ConvertTo-Json

Invoke-RestMethod -Uri 'http://localhost:8080/api/rendezvous' -Method Post -Body $body -ContentType 'application/json'
