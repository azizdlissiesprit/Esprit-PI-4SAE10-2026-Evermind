package tn.esprit.formation.Controller;

import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.formation.Entity.Module;
import tn.esprit.formation.Entity.ProgrammeFormation;
import tn.esprit.formation.Service.IModuleService;
import tn.esprit.formation.Service.IProgrammeFormationService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/formation/modules")
@AllArgsConstructor
@CrossOrigin(origins = "*")
public class ModuleController {

    private final IModuleService service;
    private final IProgrammeFormationService programmeService;

    @GetMapping
    public List<Module> getAll() {
        return service.getAll();
    }

    @GetMapping("/programme/{programmeId}")
    public List<Module> getByProgrammeId(@PathVariable Long programmeId) {
        return service.getByProgrammeId(programmeId);
    }

    @GetMapping("/type/{type}")
    public List<Module> getByType(@PathVariable String type) {
        return service.getByType(type);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Module> getById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(service.getById(id));
        } catch (jakarta.persistence.EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public Module create(@RequestBody Map<String, Object> body) {
        ProgrammeFormation programme = programmeService.getById(Long.valueOf(body.get("programmeId").toString()));
        Module m = new Module();
        m.setTitre((String) body.get("titre"));
        m.setType((String) body.get("type"));
        m.setContenu((String) body.get("contenu"));
        m.setDureeEstimee(body.get("dureeEstimee") != null ? ((Number) body.get("dureeEstimee")).intValue() : null);
        m.setProgrammeFormation(programme);
        return service.add(m);
    }

    @PutMapping("/{id}")
    public Module update(@PathVariable Long id, @RequestBody Module m) {
        return service.update(id, m);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
