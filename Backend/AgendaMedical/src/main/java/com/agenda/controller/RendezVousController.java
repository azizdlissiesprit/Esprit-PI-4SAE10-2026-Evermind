package com.agenda.controller;

import com.agenda.dto.RendezVousDTO;
import com.agenda.dto.RendezVousStats;
import com.agenda.service.RendezVousService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/rendezvous")
public class RendezVousController {

    private final RendezVousService rendezVousService;

    public RendezVousController(RendezVousService rendezVousService) {
        this.rendezVousService = rendezVousService;
    }

    @GetMapping
    public ResponseEntity<List<RendezVousDTO>> getAll() {
        return ResponseEntity.ok(rendezVousService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<RendezVousDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(rendezVousService.getById(id));
    }

    @GetMapping("/jour/{date}")
    public ResponseEntity<List<RendezVousDTO>> getByJour(
            @PathVariable
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate date) {
        return ResponseEntity.ok(rendezVousService.getByJour(date));
    }

    @GetMapping("/semaine/{date}")
    public ResponseEntity<List<RendezVousDTO>> getBySemaine(
            @PathVariable
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate date) {
        return ResponseEntity.ok(rendezVousService.getBySemaine(date));
    }

    @GetMapping("/stats")
    public ResponseEntity<RendezVousStats> getStats() {
        return ResponseEntity.ok(rendezVousService.getStats());
    }

    @GetMapping("/search")
    public ResponseEntity<List<RendezVousDTO>> search(@RequestParam String term) {
        return ResponseEntity.ok(rendezVousService.search(term));
    }

    @PostMapping
    public ResponseEntity<RendezVousDTO> create(@RequestBody RendezVousDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(rendezVousService.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<RendezVousDTO> update(@PathVariable Long id, @RequestBody RendezVousDTO dto) {
        return ResponseEntity.ok(rendezVousService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        rendezVousService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
