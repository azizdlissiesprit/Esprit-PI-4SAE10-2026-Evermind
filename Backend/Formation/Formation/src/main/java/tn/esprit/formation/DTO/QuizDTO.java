package tn.esprit.formation.DTO;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizDTO {
    private Long id;
    private String titre;
    private Integer seuilReussite;
    private Long moduleId;
    private String moduleTitre;
    private String moduleType;
    private Integer moduledureeEstimee;
    private Integer questionCount;
}
