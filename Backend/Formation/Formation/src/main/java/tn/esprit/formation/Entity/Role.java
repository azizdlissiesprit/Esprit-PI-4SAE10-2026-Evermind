package tn.esprit.formation.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "roles")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Role {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, unique = true)
    private ERole name;

    @Column(length = 500)
    private String description;

    public enum ERole {
        ROLE_ADMIN("Administrateur - Accès complet"),
        ROLE_AIDANT("Aidant - Accès aux formations et quiz");

        private final String description;

        ERole(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }
}
