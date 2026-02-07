package tn.esprit.conversation.Entities;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "conversations")
@Data
public class Conversation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer conversationId;

    // Referenced by ID since Patients are likely in a different service
    private Integer patientId;

    private String titre;

    private LocalDateTime dateCreation;

    private boolean actif;
}