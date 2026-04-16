package tn.esprit.formation.Service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import tn.esprit.formation.DTO.VerifyCertificateResponse;
import tn.esprit.formation.Entity.*;
import tn.esprit.formation.Entity.Module;
import tn.esprit.formation.Repository.CertificateRepository;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Slf4j
public class CertificateService {

    private final CertificateRepository certificateRepository;
    private final String signingSecret;

    public CertificateService(
            CertificateRepository certificateRepository,
            @Value("${certificate.signing.secret}") String signingSecret) {
        this.certificateRepository = certificateRepository;
        this.signingSecret = signingSecret;
    }

    /**
     * Issue a signed certificate for a passed quiz tentative.
     */
    public Certificate issueCertificate(QuizTentative tentative, Quiz quiz, Module module, ProgrammeFormation programme) {
        // Check if certificate already exists for this tentative
        Optional<Certificate> existing = certificateRepository.findByTentativeId(tentative.getId());
        if (existing.isPresent()) {
            return existing.get();
        }

        String code = generateCertificateCode();
        LocalDateTime issuedAt = LocalDateTime.now();
        int percentage = tentative.getTotal() > 0
                ? Math.round((float) tentative.getScore() / tentative.getTotal() * 100)
                : 0;

        String dataToSign = buildSignatureData(
                code,
                tentative.getUserId(),
                quiz.getTitre(),
                tentative.getScore(),
                tentative.getTotal(),
                issuedAt
        );
        String signature = computeHmacSha256(dataToSign);

        Certificate certificate = Certificate.builder()
                .certificateCode(code)
                .userId(tentative.getUserId())
                .quizTitle(quiz.getTitre())
                .moduleTitle(module.getTitre())
                .programmeTitle(programme != null ? programme.getTitre() : null)
                .score(tentative.getScore())
                .total(tentative.getTotal())
                .percentage(percentage)
                .issuedAt(issuedAt)
                .status(CertificateStatus.ISSUED)
                .digitalSignature(signature)
                .tentativeId(tentative.getId())
                .build();

        return certificateRepository.save(certificate);
    }

    /**
     * Public verification: checks that certificate exists and signature is valid.
     */
    public VerifyCertificateResponse verifyCertificate(String code) {
        Optional<Certificate> opt = certificateRepository.findByCertificateCode(code);

        if (opt.isEmpty()) {
            return VerifyCertificateResponse.builder()
                    .valid(false)
                    .status("NOT_FOUND")
                    .signatureMatch(false)
                    .build();
        }

        Certificate cert = opt.get();

        // Recompute signature and compare
        String dataToSign = buildSignatureData(
                cert.getCertificateCode(),
                cert.getUserId(),
                cert.getQuizTitle(),
                cert.getScore(),
                cert.getTotal(),
                cert.getIssuedAt()
        );
        String expectedSignature = computeHmacSha256(dataToSign);
        boolean sigMatch = expectedSignature.equals(cert.getDigitalSignature());

        boolean isValid = sigMatch && cert.getStatus() == CertificateStatus.ISSUED;

        return VerifyCertificateResponse.builder()
                .valid(isValid)
                .status(cert.getStatus().name())
                .signatureMatch(sigMatch)
                .certificateCode(cert.getCertificateCode())
                .userId(cert.getUserId())
                .quizTitle(cert.getQuizTitle())
                .moduleTitle(cert.getModuleTitle())
                .programmeTitle(cert.getProgrammeTitle())
                .score(cert.getScore())
                .total(cert.getTotal())
                .percentage(cert.getPercentage())
                .issuedAt(cert.getIssuedAt().toString())
                .digitalSignature(cert.getDigitalSignature())
                .build();
    }

    public Certificate getCertificateByCode(String code) {
        return certificateRepository.findByCertificateCode(code)
                .orElseThrow(() -> new RuntimeException("Certificate not found: " + code));
    }

    public List<Certificate> getCertificatesByUser(Long userId) {
        return certificateRepository.findByUserId(userId);
    }

    public Certificate revokeCertificate(String code) {
        Certificate cert = getCertificateByCode(code);
        cert.setStatus(CertificateStatus.REVOKED);
        return certificateRepository.save(cert);
    }

    // ── Private helpers ──

    private String generateCertificateCode() {
        String uuid = UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
        int year = LocalDateTime.now().getYear();
        return "CERT-" + year + "-" + uuid;
    }

    private String buildSignatureData(String code, Long userId, String quizTitle, Integer score, Integer total, LocalDateTime issuedAt) {
        return code + "|" + userId + "|" + quizTitle + "|" + score + "|" + total + "|" + issuedAt.toString();
    }

    private String computeHmacSha256(String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec keySpec = new SecretKeySpec(signingSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(keySpec);
            byte[] rawHmac = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return bytesToHex(rawHmac);
        } catch (Exception e) {
            throw new RuntimeException("Failed to compute HMAC-SHA256", e);
        }
    }

    private static String bytesToHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder(bytes.length * 2);
        for (byte b : bytes) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }
}
