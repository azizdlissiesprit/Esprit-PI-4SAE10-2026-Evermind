package tn.esprit.conversation.Entities;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "conversations")
@Data
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor

public class Conversation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long conversationId;

    // Referenced by ID since Patients are likely in a different service
    private Long patientId;

    private String titre;

    private LocalDateTime dateCreation;

    private boolean actif;
}