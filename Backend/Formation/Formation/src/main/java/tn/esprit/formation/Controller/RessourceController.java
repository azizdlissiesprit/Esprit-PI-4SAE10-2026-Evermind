package tn.esprit.formation.Controller;

import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.formation.Entity.Module;
import tn.esprit.formation.Entity.Ressource;
import tn.esprit.formation.Service.IModuleService;
import tn.esprit.formation.Service.IRessourceService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/formation/ressources")
@AllArgsConstructor
@CrossOrigin(origins = "*")
public class RessourceController {

    private final IRessourceService service;
    private final IModuleService moduleService;

    @GetMapping
    public List<Ressource> getAll() {
        return service.getAll();
    }

    @GetMapping("/module/{moduleId}")
    public List<Ressource> getByModuleId(@PathVariable Long moduleId) {
        return service.getByModuleId(moduleId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Ressource> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PostMapping
    public Ressource create(@RequestBody Map<String, Object> body) {
        Module module = moduleService.getById(Long.valueOf(body.get("moduleId").toString()));
        Ressource r = new Ressource();
        r.setUrl((String) body.get("url"));
        r.setTypeFichier((String) body.get("typeFichier"));
        r.setTaille(body.get("taille") != null ? ((Number) body.get("taille")).intValue() : null);
        r.setModule(module);
        return service.add(r);
    }

    @PutMapping("/{id}")
    public Ressource update(@PathVariable Long id, @RequestBody Ressource r) {
        return service.update(id, r);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
