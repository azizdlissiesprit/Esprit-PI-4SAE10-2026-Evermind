package tn.esprit.formation.Config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import tn.esprit.formation.Entity.Module;
import tn.esprit.formation.Entity.ProgrammeFormation;
import tn.esprit.formation.Repository.ModuleRepository;
import tn.esprit.formation.Repository.ProgrammeFormationRepository;

/**
 * Initialise les données de démo (formation Alzheimer) si la base est vide.
 */
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final ProgrammeFormationRepository programmeRepo;
    private final ModuleRepository moduleRepo;

    @Override
    @Transactional
    public void run(String... args) {
        if (programmeRepo.count() > 0) return;

        ProgrammeFormation p = ProgrammeFormation.builder()
                .titre("Qu'est-ce que l'Alzheimer ?")
                .theme("Santé cognitive")
                .description("Formation complète pour comprendre la maladie d'Alzheimer : définition, symptômes, stades, et accompagnement au quotidien.")
                .build();
        p = programmeRepo.save(p);

        createModule(p, "Définition et origine de la maladie", "Video", 12, "La maladie d'Alzheimer est une maladie neurodégénérative...");
        createModule(p, "Les symptômes et les signes d'alerte", "Article", 15, "Les premiers signes de la maladie...");
        createModule(p, "Les stades de la maladie", "Article", 10, "L'Alzheimer évolue généralement en plusieurs stades...");
        createModule(p, "Vivre avec et accompagner au quotidien", "Article", 12, "Accompagner une personne atteinte d'Alzheimer...");
        p.getModules().forEach(moduleRepo::save);
    }

    private void createModule(ProgrammeFormation p, String titre, String type, int duree, String contenu) {
        Module m = Module.builder()
                .titre(titre)
                .type(type)
                .dureeEstimee(duree)
                .contenu(contenu)
                .programmeFormation(p)
                .build();
        p.getModules().add(m);
    }
}
