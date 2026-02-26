package tn.esprit.autonomy.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import tn.esprit.autonomy.entity.AutonomyAssessment;

import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailNotificationService {

    private final JavaMailSender mailSender;

    @Value("${app.notification.email}")
    private String notificationEmail;

    public void sendNewAutonomyAssessmentNotification(AutonomyAssessment assessment) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(notificationEmail);
            message.setSubject("🏥 Nouvelle Évaluation d'Autonomie Ajoutée - Patient #" + assessment.getPatientId());
            message.setText(buildAutonomyAssessmentEmailContent(assessment));
            
            mailSender.send(message);
            log.info("Email notification sent for new autonomy assessment: {}", assessment.getId());
        } catch (Exception e) {
            log.error("Failed to send email notification for autonomy assessment: {}", assessment.getId(), e);
        }
    }

    private String buildAutonomyAssessmentEmailContent(AutonomyAssessment assessment) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
        
        StringBuilder content = new StringBuilder();
        content.append("🏥 NOTIFICATION DE NOUVELLE ÉVALUATION D'AUTONOMIE\n\n");
        content.append("Cher responsable,\n\n");
        content.append("Une nouvelle évaluation d'autonomie a été ajoutée au système:\n\n");
        
        content.append("📋 INFORMATIONS DE L'ÉVALUATION:\n");
        content.append("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
        content.append("🆔 ID de l'évaluation: ").append(assessment.getId()).append("\n");
        content.append("👤 ID du Patient: #").append(assessment.getPatientId()).append("\n");
        content.append("📅 Date: ").append(assessment.getDate()).append("\n");
        content.append("👨‍⚕️ Évaluateur: ").append(assessment.getEvaluator()).append("\n");
        content.append("🏆 Score Total: ").append(assessment.getTotalScore()).append("/25\n\n");
        
        content.append("📊 DÉTAILS DES SCORES PAR DOMAINE:\n");
        content.append("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
        content.append("🚿 Hygiène personnelle: ").append(assessment.getScores().getHygiene()).append("/5\n");
        content.append("🍽️ Alimentation: ").append(assessment.getScores().getFeeding()).append("/5\n");
        content.append("👕 Habillage: ").append(assessment.getScores().getDressing()).append("/5\n");
        content.append("🚶 Mobilité: ").append(assessment.getScores().getMobility()).append("/5\n");
        content.append("💬 Communication: ").append(assessment.getScores().getCommunication()).append("/5\n\n");
        
        content.append("📝 NIVEAU D'ASSISTANCE:\n");
        content.append("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
        content.append("🔧 ").append(assessment.getAssistanceLevel()).append("\n\n");
        
        if (assessment.getObservations() != null && !assessment.getObservations().trim().isEmpty()) {
            content.append("📋 OBSERVATIONS CLINIQUES:\n");
            content.append("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
            content.append(assessment.getObservations()).append("\n\n");
        }
        
        content.append("📊 ANALYSE DES TENDANCES:\n");
        content.append("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
        content.append("📈 Tendance: ").append(getTrendEmoji(assessment.getTrend().name())).append(" ").append(assessment.getTrend().name().toUpperCase()).append("\n");
        if (assessment.getTrendPoints() != null) {
            content.append("📊 Points de tendance: ").append(assessment.getTrendPoints() > 0 ? "+" : "").append(assessment.getTrendPoints()).append(" points\n");
        }
        content.append("\n");
        
        content.append("🔗 ACTIONS RECOMMANDÉES:\n");
        content.append("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
        content.append("• Consulter le tableau de bord du patient pour plus de détails\n");
        content.append("• Analyser l'évolution des scores par rapport aux évaluations précédentes\n");
        content.append("• Planifier des interventions si nécessaire\n");
        content.append("• Coordonner avec l'équipe soignante\n\n");
        
        content.append("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
        content.append("Cet email a été généré automatiquement par le système EverMind.\n");
        content.append("Pour toute question technique, veuillez contacter l'administrateur système.\n");
        
        return content.toString();
    }

    private String getTrendEmoji(String trend) {
        switch (trend.toLowerCase()) {
            case "up": return "📈";
            case "down": return "📉";
            case "stable": return "➡️";
            default: return "📊";
        }
    }
}
