package tn.esprit.profile.training.web;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import tn.esprit.profile.training.entity.TrainingModule;
import tn.esprit.profile.training.entity.TrainingResource;
import tn.esprit.profile.training.repository.TrainingModuleRepository;
import tn.esprit.profile.training.repository.TrainingResourceRepository;
import tn.esprit.profile.training.web.dto.TrainingResourceDto;
import tn.esprit.profile.training.web.dto.UpsertTrainingResourceRequest;

import java.util.List;

@RestController
@RequestMapping("/training/resources")
@RequiredArgsConstructor
public class TrainingResourceController {
    private final TrainingResourceRepository resourceRepository;
    private final TrainingModuleRepository moduleRepository;

    @GetMapping
    public List<TrainingResourceDto> list(@RequestParam(required = false) Long moduleId) {
        List<TrainingResource> resources = (moduleId == null)
                ? resourceRepository.findAll()
                : resourceRepository.findByModule_IdOrderByIdAsc(moduleId);
        return resources.stream().map(this::toDto).toList();
    }

    @GetMapping("/{id}")
    public TrainingResourceDto get(@PathVariable Long id) {
        TrainingResource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Resource not found"));
        return toDto(resource);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TrainingResourceDto create(@RequestBody UpsertTrainingResourceRequest req) {
        TrainingModule module = moduleRepository.findById(req.moduleId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Module not found"));
        TrainingResource resource = TrainingResource.builder()
                .module(module)
                .url(req.url())
                .fileType(req.fileType())
                .size(req.size())
                .build();
        return toDto(resourceRepository.save(resource));
    }

    @PutMapping("/{id}")
    public TrainingResourceDto update(@PathVariable Long id, @RequestBody UpsertTrainingResourceRequest req) {
        TrainingResource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Resource not found"));
        if (req.moduleId() != null && !req.moduleId().equals(resource.getModule().getId())) {
            TrainingModule module = moduleRepository.findById(req.moduleId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Module not found"));
            resource.setModule(module);
        }
        resource.setUrl(req.url());
        resource.setFileType(req.fileType());
        resource.setSize(req.size());
        return toDto(resourceRepository.save(resource));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        if (!resourceRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Resource not found");
        }
        resourceRepository.deleteById(id);
    }

    private TrainingResourceDto toDto(TrainingResource r) {
        return new TrainingResourceDto(
                r.getId(),
                r.getModule() != null ? r.getModule().getId() : null,
                r.getUrl(),
                r.getFileType(),
                r.getSize()
        );
    }
}

