package tn.esprit.formation.Entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "certificates")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Certificate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String certificateCode;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String quizTitle;

    @Column(nullable = false)
    private String moduleTitle;

    private String programmeTitle;

    @Column(nullable = false)
    private Integer score;

    @Column(nullable = false)
    private Integer total;

    @Column(nullable = false)
    private Integer percentage;

    @Column(nullable = false)
    private LocalDateTime issuedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private CertificateStatus status = CertificateStatus.ISSUED;

    @Column(nullable = false, length = 512)
    private String digitalSignature;

    @Column(nullable = false)
    private Long tentativeId;

    @PrePersist
    protected void onCreate() {
        if (issuedAt == null) {
            issuedAt = LocalDateTime.now();
        }
        if (status == null) {
            status = CertificateStatus.ISSUED;
        }
    }
}
