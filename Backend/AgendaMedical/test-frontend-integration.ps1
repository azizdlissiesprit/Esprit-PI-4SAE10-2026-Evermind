# Frontend Integration Test - Create sample data for frontend testing
Write-Host "=== CREATING SAMPLE DATA FOR FRONTEND TESTING ===" -ForegroundColor Green

$baseUrl = "http://localhost:8080/api/rendezvous"

# Create multiple sample appointments for different days and types
$sampleAppointments = @(
    @{
        patientNom = "Martin"
        patientPrenom = "Sophie"
        type = "CONSULTATION"
        statut = "CONFIRME"
        dateHeure = "2026-04-13T09:00:00"
        dureeMinutes = 30
        notes = "Consultation initiale"
    },
    @{
        patientNom = "Bernard"
        patientPrenom = "Pierre"
        type = "TELECONSULTATION"
        statut = "CONFIRME"
        dateHeure = "2026-04-13T10:30:00"
        dureeMinutes = 45
        notes = "Téléconsultation suivi"
    },
    @{
        patientNom = "Dubois"
        patientPrenom = "Marie"
        type = "BILAN"
        statut = "EN_ATTENTE"
        dateHeure = "2026-04-14T11:00:00"
        dureeMinutes = 60
        notes = "Bilan cognitif complet"
    },
    @{
        patientNom = "Petit"
        patientPrenom = "Jean"
        type = "SUIVI"
        statut = "CONFIRME"
        dateHeure = "2026-04-14T14:00:00"
        dureeMinutes = 30
        notes = "Suivi mensuel"
    },
    @{
        patientNom = "Robert"
        patientPrenom = "Claire"
        type = "EVALUATION"
        statut = "ANNULE"
        dateHeure = "2026-04-15T10:00:00"
        dureeMinutes = 45
        notes = "Évaluation annulée par patient"
    }
)

foreach ($appointment in $sampleAppointments) {
    $body = $appointment | ConvertTo-Json
    try {
        $result = Invoke-RestMethod -Uri $baseUrl -Method Post -Body $body -ContentType "application/json"
        Write-Host "Created: $($result.patientPrenom) $($result.patientNom) - $($result.type)" -ForegroundColor Green
    }
    catch {
        Write-Host "Failed to create appointment: $_" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Sample data created. Frontend should now show multiple appointments." -ForegroundColor Yellow
Write-Host "Navigate to http://localhost:64487 to test the frontend." -ForegroundColor Yellow
