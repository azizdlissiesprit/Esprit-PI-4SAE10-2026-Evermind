package tn.esprit.formation.Service;

import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.esprit.formation.Entity.ProgrammeFormation;
import tn.esprit.formation.Repository.ProgrammeFormationRepository;

import java.util.List;

@Service
@AllArgsConstructor
public class ProgrammeFormationServiceImpl implements IProgrammeFormationService {

    private final ProgrammeFormationRepository repository;

    @Override
    public ProgrammeFormation add(ProgrammeFormation p) {
        return repository.save(p);
    }

    @Override
    public ProgrammeFormation update(Long id, ProgrammeFormation p) {
        ProgrammeFormation existing = repository.findById(id).orElseThrow();
        existing.setTitre(p.getTitre());
        existing.setDescription(p.getDescription());
        existing.setTheme(p.getTheme());
        return repository.save(existing);
    }

    @Override
    public void delete(Long id) {
        repository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public ProgrammeFormation getById(Long id) {
        return repository.findById(id).orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Programme non trouvé: " + id));
    }

    @Override
    public List<ProgrammeFormation> getAll() {
        return repository.findAll();
    }

    @Override
    public List<ProgrammeFormation> getByTheme(String theme) {
        return repository.findByTheme(theme);
    }
}
