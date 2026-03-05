package tn.esprit.formation.Service;

import tn.esprit.formation.Entity.Module;

import java.util.List;

public interface IModuleService {
    Module add(Module m);
    Module update(Long id, Module m);
    void delete(Long id);
    Module getById(Long id);
    List<Module> getAll();
    List<Module> getByProgrammeId(Long programmeId);
    List<Module> getByType(String type);
}
