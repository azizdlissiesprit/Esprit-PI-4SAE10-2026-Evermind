package tn.esprit.formation.Controller;

import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.formation.DTO.QuizDTO;
import tn.esprit.formation.Entity.Module;
import tn.esprit.formation.Entity.Quiz;
import tn.esprit.formation.Service.IModuleService;
import tn.esprit.formation.Service.IQuizService;
import tn.esprit.formation.Service.QuizServiceImpl;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/formation/quiz")
@AllArgsConstructor
@CrossOrigin(origins = "*")
public class QuizController {

    private final IQuizService service;
    private final QuizServiceImpl quizServiceImpl;
    private final IModuleService moduleService;

    @GetMapping
    public List<QuizDTO> getAll() {
        return quizServiceImpl.getAllAsDTO();
    }

    @GetMapping("/module/{moduleId}")
    public List<QuizDTO> getByModuleId(@PathVariable Long moduleId) {
        return service.getByModuleId(moduleId).stream()
                .map(quizServiceImpl::convertToDTO)
                .toList();
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
