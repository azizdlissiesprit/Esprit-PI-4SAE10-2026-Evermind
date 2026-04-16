package tn.esprit.profile.training.web;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import tn.esprit.profile.training.entity.TrainingModule;
import tn.esprit.profile.training.entity.TrainingProgram;
import tn.esprit.profile.training.repository.TrainingModuleRepository;
import tn.esprit.profile.training.repository.TrainingProgramRepository;
import tn.esprit.profile.training.web.dto.TrainingModuleDto;
import tn.esprit.profile.training.web.dto.UpsertTrainingModuleRequest;

import java.util.List;

@RestController
@RequestMapping("/training/modules")
@RequiredArgsConstructor
public class TrainingModuleController {
    private final TrainingModuleRepository moduleRepository;
    private final TrainingProgramRepository programRepository;

    @GetMapping
    public List<TrainingModuleDto> list(@RequestParam(required = false) Long programId) {
        List<TrainingModule> modules = (programId == null)
                ? moduleRepository.findAll()
                : moduleRepository.findByProgram_IdOrderByIdAsc(programId);
        return modules.stream().map(this::toDto).toList();
    }

    @GetMapping("/{id}")
    public TrainingModuleDto get(@PathVariable Long id) {
        TrainingModule module = moduleRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Module not found"));
        return toDto(module);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TrainingModuleDto create(@RequestBody UpsertTrainingModuleRequest req) {
        TrainingProgram program = programRepository.findById(req.programId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Program not found"));
        TrainingModule module = TrainingModule.builder()
                .program(program)
                .title(req.title())
                .type(req.type())
                .content(req.content())
                .estimatedDuration(req.estimatedDuration())
                .build();
        return toDto(moduleRepository.save(module));
    }

    @PutMapping("/{id}")
    public TrainingModuleDto update(@PathVariable Long id, @RequestBody UpsertTrainingModuleRequest req) {
        TrainingModule module = moduleRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Module not found"));
        if (req.programId() != null && !req.programId().equals(module.getProgram().getId())) {
            TrainingProgram program = programRepository.findById(req.programId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Program not found"));
            module.setProgram(program);
        }
        module.setTitle(req.title());
        module.setType(req.type());
        module.setContent(req.content());
        module.setEstimatedDuration(req.estimatedDuration());
        return toDto(moduleRepository.save(module));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        if (!moduleRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Module not found");
        }
        moduleRepository.deleteById(id);
    }

    private TrainingModuleDto toDto(TrainingModule m) {
        return new TrainingModuleDto(
                m.getId(),
                m.getProgram() != null ? m.getProgram().getId() : null,
                m.getTitle(),
                m.getType(),
                m.getContent(),
                m.getEstimatedDuration()
        );
    }
}

