package tn.esprit.formation.Controller;

import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.formation.DTO.VerifyCertificateResponse;
import tn.esprit.formation.Entity.Certificate;
import tn.esprit.formation.Service.CertificateService;

import java.util.List;

@RestController
@RequestMapping("/formation/certificates")
@AllArgsConstructor
@CrossOrigin(origins = "*")
public class CertificateController {

    private final CertificateService certificateService;

    /**
     * Public endpoint — verify a certificate's authenticity.
     * No authentication required.
     */
    @GetMapping("/verify/{code}")
    public ResponseEntity<VerifyCertificateResponse> verifyCertificate(@PathVariable String code) {
        VerifyCertificateResponse response = certificateService.verifyCertificate(code);
        return ResponseEntity.ok(response);
    }

    /**
     * Get a certificate by its unique code.
     */
    @GetMapping("/{code}")
    public ResponseEntity<Certificate> getCertificate(@PathVariable String code) {
        Certificate cert = certificateService.getCertificateByCode(code);
        return ResponseEntity.ok(cert);
    }

    /**
     * List all certificates for a given user.
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Certificate>> getUserCertificates(@PathVariable Long userId) {
        return ResponseEntity.ok(certificateService.getCertificatesByUser(userId));
    }

    /**
     * Revoke a certificate.
     */
    @PostMapping("/{code}/revoke")
    public ResponseEntity<Certificate> revokeCertificate(@PathVariable String code) {
        Certificate cert = certificateService.revokeCertificate(code);
        return ResponseEntity.ok(cert);
    }
}
