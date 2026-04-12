$body = @{
    patientNom = "Test"
    patientPrenom = "User"
    type = "TELECONSULTATION"
    statut = "CONFIRME"
    dateHeure = "2026-04-12T11:00:00"
    dureeMinutes = 45
    notes = "Updated appointment - teleconsultation"
} | ConvertTo-Json

Invoke-RestMethod -Uri 'http://localhost:8080/api/rendezvous/3' -Method Put -Body $body -ContentType 'application/json'
