package tn.esprit.formation.DTO;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VerifyCertificateResponse {
    private boolean valid;
    private String status;          // "ISSUED", "REVOKED", "NOT_FOUND"
    private boolean signatureMatch;

    // Certificate details (null when not found)
    private String certificateCode;
    private Long userId;
    private String quizTitle;
    private String moduleTitle;
    private String programmeTitle;
    private Integer score;
    private Integer total;
    private Integer percentage;
    private String issuedAt;
    private String digitalSignature;
}
