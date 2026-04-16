package tn.esprit.formation.Service;

import tn.esprit.formation.Entity.Ressource;

import java.util.List;

public interface IRessourceService {
    Ressource add(Ressource r);
    Ressource update(Long id, Ressource r);
    void delete(Long id);
    Ressource getById(Long id);
    List<Ressource> getAll();
    List<Ressource> getByModuleId(Long moduleId);
}
