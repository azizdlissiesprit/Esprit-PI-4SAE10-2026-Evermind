package tn.esprit.formation.Controller;

import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.formation.Entity.Module;
import tn.esprit.formation.Entity.Quiz;
import tn.esprit.formation.Service.IModuleService;
import tn.esprit.formation.Service.IQuizService;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/formation/quiz")
@AllArgsConstructor
@CrossOrigin(origins = "*")
public class QuizController {

    private final IQuizService service;
    private final IModuleService moduleService;

    @GetMapping
    public List<Quiz> getAll() {
        return service.getAll();
    }

    @GetMapping("/module/{moduleId}")
    public ResponseEntity<Quiz> getByModuleId(@PathVariable Long moduleId) {
        Optional<Quiz> q = service.getByModuleId(moduleId);
        return q.map(ResponseEntity::ok).orElseGet(() ->
            ResponseEntity.ok(Quiz.builder()
                .id(0L)
                .titre("Quiz")
                .seuilReussite(70)
                .build()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Quiz> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PostMapping
    public Quiz create(@RequestBody Map<String, Object> body) {
        Module module = moduleService.getById(Long.valueOf(body.get("moduleId").toString()));
        Quiz q = new Quiz();
        q.setTitre((String) body.get("titre"));
        q.setSeuilReussite(body.get("seuilReussite") != null ? ((Number) body.get("seuilReussite")).intValue() : 70);
        q.setModule(module);
        return service.add(q);
    }

    @PutMapping("/{id}")
    public Quiz update(@PathVariable Long id, @RequestBody Quiz q) {
        return service.update(id, q);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
