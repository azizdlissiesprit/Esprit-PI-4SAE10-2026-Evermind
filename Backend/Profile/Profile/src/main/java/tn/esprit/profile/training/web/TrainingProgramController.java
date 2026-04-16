package tn.esprit.profile.training.web;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import tn.esprit.profile.training.entity.TrainingProgram;
import tn.esprit.profile.training.repository.TrainingProgramRepository;
import tn.esprit.profile.training.web.dto.TrainingProgramDto;
import tn.esprit.profile.training.web.dto.UpsertTrainingProgramRequest;

import java.util.List;

@RestController
@RequestMapping("/training/programs")
@RequiredArgsConstructor
public class TrainingProgramController {
    private final TrainingProgramRepository programRepository;

    @GetMapping
    public List<TrainingProgramDto> list() {
        return programRepository.findAll().stream().map(this::toDto).toList();
    }

    @GetMapping("/{id}")
    public TrainingProgramDto get(@PathVariable Long id) {
        TrainingProgram program = programRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Program not found"));
        return toDto(program);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TrainingProgramDto create(@RequestBody UpsertTrainingProgramRequest req) {
        TrainingProgram program = TrainingProgram.builder()
                .title(req.title())
                .description(req.description())
                .theme(req.theme())
                .build();
        return toDto(programRepository.save(program));
    }

    @PutMapping("/{id}")
    public TrainingProgramDto update(@PathVariable Long id, @RequestBody UpsertTrainingProgramRequest req) {
        TrainingProgram program = programRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Program not found"));
        program.setTitle(req.title());
        program.setDescription(req.description());
        program.setTheme(req.theme());
        return toDto(programRepository.save(program));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        if (!programRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Program not found");
        }
        programRepository.deleteById(id);
    }

    private TrainingProgramDto toDto(TrainingProgram p) {
        return new TrainingProgramDto(p.getId(), p.getTitle(), p.getDescription(), p.getTheme(), p.getCreatedAt());
    }
}

