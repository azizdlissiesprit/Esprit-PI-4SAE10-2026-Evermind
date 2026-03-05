package tn.esprit.formation.Service;

import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.esprit.formation.Entity.Module;
import tn.esprit.formation.Entity.ProgrammeFormation;
import tn.esprit.formation.Repository.ModuleRepository;
import tn.esprit.formation.Repository.ProgrammeFormationRepository;

import java.util.List;

@Service
@AllArgsConstructor
public class ModuleServiceImpl implements IModuleService {

    private final ModuleRepository repository;
    private final ProgrammeFormationRepository programmeRepository;

    @Override
    public Module add(Module m) {
        return repository.save(m);
    }

    @Override
    public Module update(Long id, Module m) {
        Module existing = repository.findById(id).orElseThrow();
        existing.setTitre(m.getTitre());
        existing.setType(m.getType());
        existing.setContenu(m.getContenu());
        existing.setDureeEstimee(m.getDureeEstimee());
        if (m.getProgrammeFormation() != null) {
            existing.setProgrammeFormation(m.getProgrammeFormation());
        }
        return repository.save(existing);
    }

    @Override
    public void delete(Long id) {
        repository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public Module getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Module non trouvé: " + id));
    }

    @Override
    public List<Module> getAll() {
        return repository.findAll();
    }

    @Override
    public List<Module> getByProgrammeId(Long programmeId) {
        return repository.findByProgrammeFormationId(programmeId);
    }

    @Override
    public List<Module> getByType(String type) {
        return repository.findByType(type);
    }
}
