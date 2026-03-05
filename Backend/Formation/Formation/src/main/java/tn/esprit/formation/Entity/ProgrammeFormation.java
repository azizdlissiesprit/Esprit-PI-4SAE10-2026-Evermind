package tn.esprit.formation.Entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "programmes_formation")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProgrammeFormation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String titre;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String theme; // Ex: Alzheimer, Gestion des fugues, Prévention des chutes, Communication avec le patient

    private LocalDate dateCreation;

    @OneToMany(mappedBy = "programmeFormation", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    @Builder.Default
    private List<Module> modules = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        if (dateCreation == null) {
            dateCreation = LocalDate.now();
        }
    }
}
