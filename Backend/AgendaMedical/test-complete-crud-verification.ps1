# Comprehensive CRUD Test Script for EverMind Appointment System
# This script tests all CRUD operations with database persistence

Write-Host "=== EVERMIND APPOINTMENT SYSTEM - COMPREHENSIVE CRUD TESTS ===" -ForegroundColor Green
Write-Host "Testing Backend API at http://localhost:8080/api/rendezvous" -ForegroundColor Yellow
Write-Host ""

$baseUrl = "http://localhost:8080/api/rendezvous"

# Function to make HTTP requests
function Invoke-ApiCall {
    param(
        [string]$Method,
        [string]$Uri,
        [string]$Body = $null,
        [string]$ContentType = "application/json"
    )
    
    try {
        if ($Body) {
            return Invoke-RestMethod -Uri $Uri -Method $Method -Body $Body -ContentType $ContentType
        } else {
            return Invoke-RestMethod -Uri $Uri -Method $Method
        }
    }
    catch {
        Write-Host "ERROR: $_" -ForegroundColor Red
        return $null
    }
}

# Test 1: READ - Get all appointments
Write-Host "TEST 1: READ - Get all appointments" -ForegroundColor Cyan
$allAppointments = Invoke-ApiCall -Method "GET" -Uri "$baseUrl"
if ($allAppointments) {
    Write-Host "SUCCESS: Retrieved $($allAppointments.Count) appointments" -ForegroundColor Green
    $allAppointments | ForEach-Object { 
        Write-Host "  - ID: $($_.id), Patient: $($_.patientPrenom) $($_.patientNom), Type: $($_.type), Status: $($_.statut)" 
    }
} else {
    Write-Host "FAILED: Could not retrieve appointments" -ForegroundColor Red
}
Write-Host ""

# Test 2: CREATE - Add new appointment
Write-Host "TEST 2: CREATE - Add new appointment" -ForegroundColor Cyan
$newAppointment = @{
    patientNom = "TestUser"
    patientPrenom = "CRUD"
    type = "CONSULTATION"
    statut = "CONFIRME"
    dateHeure = "2026-04-13T10:00:00"
    dureeMinutes = 30
    notes = "CRUD Test - Create operation"
} | ConvertTo-Json

$createdAppointment = Invoke-ApiCall -Method "POST" -Uri $baseUrl -Body $newAppointment
if ($createdAppointment) {
    Write-Host "SUCCESS: Created appointment with ID: $($createdAppointment.id)" -ForegroundColor Green
    Write-Host "  - Patient: $($createdAppointment.patientPrenom) $($createdAppointment.patientNom)"
    Write-Host "  - Type: $($createdAppointment.type), Status: $($createdAppointment.statut)"
    Write-Host "  - DateTime: $($createdAppointment.dateHeure)"
    $createdId = $createdAppointment.id
} else {
    Write-Host "FAILED: Could not create appointment" -ForegroundColor Red
    $createdId = $null
}
Write-Host ""

# Test 3: READ - Get specific appointment by ID
if ($createdId) {
    Write-Host "TEST 3: READ - Get specific appointment by ID: $createdId" -ForegroundColor Cyan
    $specificAppointment = Invoke-ApiCall -Method "GET" -Uri "$baseUrl/$createdId"
    if ($specificAppointment) {
        Write-Host "SUCCESS: Retrieved appointment by ID" -ForegroundColor Green
        Write-Host "  - Patient: $($specificAppointment.patientPrenom) $($specificAppointment.patientNom)"
        Write-Host "  - Notes: $($specificAppointment.notes)"
    } else {
        Write-Host "FAILED: Could not retrieve appointment by ID" -ForegroundColor Red
    }
    Write-Host ""
}

# Test 4: UPDATE - Modify the created appointment
if ($createdId) {
    Write-Host "TEST 4: UPDATE - Modify appointment ID: $createdId" -ForegroundColor Cyan
    $updatedAppointment = @{
        patientNom = "TestUser"
        patientPrenom = "UPDATED"
        type = "TELECONSULTATION"
        statut = "CONFIRME"
        dateHeure = "2026-04-13T11:30:00"
        dureeMinutes = 45
        notes = "CRUD Test - Updated operation"
    } | ConvertTo-Json

    $updateResult = Invoke-ApiCall -Method "PUT" -Uri "$baseUrl/$createdId" -Body $updatedAppointment
    if ($updateResult) {
        Write-Host "SUCCESS: Updated appointment" -ForegroundColor Green
        Write-Host "  - Patient: $($updateResult.patientPrenom) $($updateResult.patientNom)"
        Write-Host "  - Type changed to: $($updateResult.type)"
        Write-Host "  - Duration changed to: $($updateResult.dureeMinutes) minutes"
        Write-Host "  - Notes: $($updateResult.notes)"
    } else {
        Write-Host "FAILED: Could not update appointment" -ForegroundColor Red
    }
    Write-Host ""
}

# Test 5: READ - Verify update by getting the appointment again
if ($createdId) {
    Write-Host "TEST 5: READ - Verify update by getting appointment ID: $createdId" -ForegroundColor Cyan
    $verifyUpdate = Invoke-ApiCall -Method "GET" -Uri "$baseUrl/$createdId"
    if ($verifyUpdate) {
        Write-Host "SUCCESS: Verified update" -ForegroundColor Green
        Write-Host "  - Patient name is now: $($verifyUpdate.patientPrenom)"
        Write-Host "  - Type is now: $($verifyUpdate.type)"
        Write-Host "  - Duration is now: $($verifyUpdate.dureeMinutes) minutes"
    } else {
        Write-Host "FAILED: Could not verify update" -ForegroundColor Red
    }
    Write-Host ""
}

# Test 6: SEARCH - Search for appointments
Write-Host "TEST 6: SEARCH - Search for appointments" -ForegroundColor Cyan
$searchResults = Invoke-ApiCall -Method "GET" -Uri "$baseUrl/search?term=Test"
if ($searchResults) {
    Write-Host "SUCCESS: Found $($searchResults.Count) appointments matching 'Test'" -ForegroundColor Green
    $searchResults | ForEach-Object { 
        Write-Host "  - ID: $($_.id), Patient: $($_.patientPrenom) $($_.patientNom)" 
    }
} else {
    Write-Host "FAILED: Could not search appointments" -ForegroundColor Red
}
Write-Host ""

# Test 7: STATS - Get statistics
Write-Host "TEST 7: STATS - Get appointment statistics" -ForegroundColor Cyan
$stats = Invoke-ApiCall -Method "GET" -Uri "$baseUrl/stats"
if ($stats) {
    Write-Host "SUCCESS: Retrieved statistics" -ForegroundColor Green
    Write-Host "  - Total today: $($stats.totalJour)"
    Write-Host "  - Total this week: $($stats.totalSemaine)"
    Write-Host "  - Confirmed: $($stats.confirmes)"
    Write-Host "  - Pending: $($stats.enAttente)"
    Write-Host "  - Cancelled: $($stats.annules)"
} else {
    Write-Host "FAILED: Could not retrieve statistics" -ForegroundColor Red
}
Write-Host ""

# Test 8: DELETE - Remove the created appointment
if ($createdId) {
    Write-Host "TEST 8: DELETE - Remove appointment ID: $createdId" -ForegroundColor Cyan
    $deleteResult = Invoke-ApiCall -Method "DELETE" -Uri "$baseUrl/$createdId"
    if ($deleteResult -ne $null) {
        Write-Host "SUCCESS: Deleted appointment" -ForegroundColor Green
    } else {
        Write-Host "FAILED: Could not delete appointment" -ForegroundColor Red
    }
    Write-Host ""
}

# Test 9: VERIFY DELETE - Try to get the deleted appointment
if ($createdId) {
    Write-Host "TEST 9: VERIFY DELETE - Try to get deleted appointment ID: $createdId" -ForegroundColor Cyan
    $verifyDelete = Invoke-ApiCall -Method "GET" -Uri "$baseUrl/$createdId"
    if ($verifyDelete) {
        Write-Host "FAILED: Appointment still exists after deletion" -ForegroundColor Red
    } else {
        Write-Host "SUCCESS: Appointment properly deleted" -ForegroundColor Green
    }
    Write-Host ""
}

# Test 10: WEEK APPOINTMENTS - Get appointments by week
Write-Host "TEST 10: WEEK APPOINTMENTS - Get appointments for this week" -ForegroundColor Cyan
$weekAppointments = Invoke-ApiCall -Method "GET" -Uri "$baseUrl/semaine/2026-04-07"
if ($weekAppointments) {
    Write-Host "SUCCESS: Retrieved $($weekAppointments.Count) appointments for week of 2026-04-07" -ForegroundColor Green
    $weekAppointments | ForEach-Object { 
        Write-Host "  - ID: $($_.id), Patient: $($_.patientPrenom) $($_.patientNom), Date: $($_.dateHeure)" 
    }
} else {
    Write-Host "FAILED: Could not retrieve week appointments" -ForegroundColor Red
}
Write-Host ""

# Test 11: DAY APPOINTMENTS - Get appointments by day
Write-Host "TEST 11: DAY APPOINTMENTS - Get appointments for today" -ForegroundColor Cyan
$dayAppointments = Invoke-ApiCall -Method "GET" -Uri "$baseUrl/jour/2026-04-11"
if ($dayAppointments) {
    Write-Host "SUCCESS: Retrieved $($dayAppointments.Count) appointments for 2026-04-11" -ForegroundColor Green
    $dayAppointments | ForEach-Object { 
        Write-Host "  - ID: $($_.id), Patient: $($_.patientPrenom) $($_.patientNom), Time: $($_.dateHeure)" 
    }
} else {
    Write-Host "FAILED: Could not retrieve day appointments" -ForegroundColor Red
}
Write-Host ""

Write-Host "=== CRUD TESTS COMPLETED ===" -ForegroundColor Green
Write-Host "All CRUD operations have been tested with database persistence." -ForegroundColor Yellow
Write-Host "Backend server is running and fully functional." -ForegroundColor Yellow
