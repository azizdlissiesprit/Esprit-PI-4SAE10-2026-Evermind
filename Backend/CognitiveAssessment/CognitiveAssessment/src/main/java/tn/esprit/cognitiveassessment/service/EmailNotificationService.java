package tn.esprit.cognitiveassessment.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import tn.esprit.cognitiveassessment.entity.CognitiveAssessment;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailNotificationService {

    private final JavaMailSender mailSender;

    @Value("${app.notification.email}")
    private String notificationEmail;

    public void sendNewCognitiveAssessmentNotification(CognitiveAssessment assessment) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(notificationEmail);
            message.setSubject("🧠 Nouvelle Évaluation Cognitive Ajoutée - Patient #" + assessment.getPatientId());
            message.setText(buildCognitiveAssessmentEmailContent(assessment));
            
            mailSender.send(message);
            log.info("Email notification sent for new cognitive assessment: {}", assessment.getId());
        } catch (Exception e) {
            log.error("Failed to send email notification for cognitive assessment: {}", assessment.getId(), e);
        }
    }

    private String buildCognitiveAssessmentEmailContent(CognitiveAssessment assessment) {
        StringBuilder content = new StringBuilder();
        content.append("🧠 NOTIFICATION DE NOUVELLE ÉVALUATION COGNITIVE\n\n");
        content.append("Cher responsable,\n\n");
        content.append("Une nouvelle évaluation cognitive a été ajoutée au système:\n\n");
        
        content.append("📋 INFORMATIONS DE L'ÉVALUATION:\n");
        content.append("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
        content.append("🆔 ID de l'évaluation: ").append(assessment.getId()).append("\n");
        content.append("👤 ID du Patient: #").append(assessment.getPatientId()).append("\n");
        content.append("📅 Date: ").append(assessment.getDate()).append("\n");
        content.append("👨‍⚕️ Évaluateur: ").append(assessment.getEvaluator()).append("\n");
        content.append("🏷️ Type: ").append(getTypeLabel(assessment.getType().getValue())).append("\n\n");
        
        content.append("📊 SCORES COGNITIFS:\n");
        content.append("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
        content.append("🧠 MMSE (Mini-Mental State Examination): ").append(assessment.getMmseScore()).append("/30\n");
        content.append("🧩 MoCA (Montreal Cognitive Assessment): ").append(assessment.getMoocaScore()).append("/30\n\n");
        
        content.append("📈 SCORES PAR DOMAINE COGNITIF:\n");
        content.append("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
        content.append("🧠 Mémoire: ").append(assessment.getScores().getMemory()).append("/10\n");
        content.append("🧭 Orientation spatio-temporelle: ").append(assessment.getScores().getOrientation()).append("/10\n");
        content.append("💬 Langage: ").append(assessment.getScores().getLanguage()).append("/10\n");
        content.append("⚡ Fonctions exécutives: ").append(assessment.getScores().getExecutiveFunctions()).append("/10\n\n");
        
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
        
        content.append("🎯 INTERPRÉTATION DES SCORES:\n");
        content.append("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
        content.append("📊 MMSE: ").append(getMMSEInterpretation(assessment.getMmseScore())).append("\n");
        content.append("🧩 MoCA: ").append(getMoCAInterpretation(assessment.getMoocaScore())).append("\n\n");
        
        content.append("🔗 ACTIONS RECOMMANDÉES:\n");
        content.append("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
        content.append("• Consulter le tableau de bord cognitif du patient\n");
        content.append("• Analyser l'évolution par rapport aux évaluations précédentes\n");
        content.append("• Envisager une consultation spécialisée si nécessaire\n");
        content.append("• Planifier des interventions cognitives adaptées\n");
        content.append("• Coordonner avec l'équipe neurologique\n\n");
        
        content.append("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
        content.append("Cet email a été généré automatiquement par le système EverMind.\n");
        content.append("Pour toute question technique, veuillez contacter l'administrateur système.\n");
        
        return content.toString();
    }

    private String getTypeLabel(String type) {
        switch (type.toLowerCase()) {
            case "initial": return "Évaluation Initiale";
            case "complete": return "Évaluation Complète";
            case "follow-up": return "Évaluation de Suivi";
            default: return type;
        }
    }

    private String getMMSEInterpretation(int score) {
        if (score >= 24) return "Normal (24-30)";
        else if (score >= 18) return "Trouble cognitif léger (18-23)";
        else if (score >= 10) return "Trouble cognitif modéré (10-17)";
        else return "Trouble cognitif sévère (0-9)";
    }

    private String getMoCAInterpretation(int score) {
        if (score >= 26) return "Normal (26-30)";
        else if (score >= 22) return "Trouble cognitif léger (22-25)";
        else if (score >= 17) return "Trouble cognitif modéré (17-21)";
        else return "Trouble cognitif sévère (0-16)";
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
