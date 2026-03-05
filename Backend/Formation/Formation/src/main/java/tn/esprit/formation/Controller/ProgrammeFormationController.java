package tn.esprit.formation.Controller;

import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.formation.Entity.ProgrammeFormation;
import tn.esprit.formation.Service.IProgrammeFormationService;

import java.util.List;

@RestController
@RequestMapping("/formation/programmes")
@AllArgsConstructor
@CrossOrigin(origins = "*")
public class ProgrammeFormationController {

    private final IProgrammeFormationService service;

    @GetMapping
    public List<ProgrammeFormation> getAll() {
        return service.getAll();
    }

    @GetMapping("/theme/{theme}")
    public List<ProgrammeFormation> getByTheme(@PathVariable String theme) {
        return service.getByTheme(theme);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProgrammeFormation> getById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(service.getById(id));
        } catch (jakarta.persistence.EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ProgrammeFormation create(@RequestBody ProgrammeFormation p) {
        return service.add(p);
    }

    @PutMapping("/{id}")
    public ProgrammeFormation update(@PathVariable Long id, @RequestBody ProgrammeFormation p) {
        return service.update(id, p);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
