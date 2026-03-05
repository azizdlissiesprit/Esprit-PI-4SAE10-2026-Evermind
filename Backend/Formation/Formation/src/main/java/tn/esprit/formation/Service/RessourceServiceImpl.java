package tn.esprit.formation.Service;

import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import tn.esprit.formation.Entity.Ressource;
import tn.esprit.formation.Repository.RessourceRepository;

import java.util.List;

@Service
@AllArgsConstructor
public class RessourceServiceImpl implements IRessourceService {

    private final RessourceRepository repository;

    @Override
    public Ressource add(Ressource r) {
        return repository.save(r);
    }

    @Override
    public Ressource update(Long id, Ressource r) {
        Ressource existing = repository.findById(id).orElseThrow();
        existing.setUrl(r.getUrl());
        existing.setTypeFichier(r.getTypeFichier());
        existing.setTaille(r.getTaille());
        if (r.getModule() != null) {
            existing.setModule(r.getModule());
        }
        return repository.save(existing);
    }

    @Override
    public void delete(Long id) {
        repository.deleteById(id);
    }

    @Override
    public Ressource getById(Long id) {
        return repository.findById(id).orElseThrow();
    }

    @Override
    public List<Ressource> getAll() {
        return repository.findAll();
    }

    @Override
    public List<Ressource> getByModuleId(Long moduleId) {
        return repository.findByModuleId(moduleId);
    }
}
