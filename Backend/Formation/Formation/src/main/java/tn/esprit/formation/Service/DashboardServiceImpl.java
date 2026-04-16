package tn.esprit.formation.Service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.esprit.formation.DTO.DashboardStatsDTO;
import tn.esprit.formation.Repository.InscriptionRepository;
import tn.esprit.formation.Repository.UserActivitySessionRepository;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements IDashboardService {

    private final InscriptionRepository inscriptionRepository;
    private final UserActivitySessionRepository activityRepository;

    @Override
    @Transactional(readOnly = true)
    public DashboardStatsDTO getGlobalStats() {
        LocalDateTime dateLimite = LocalDateTime.now().minusDays(30);
        
        Double successRate = inscriptionRepository.calculateGlobalSuccessRate();
        if (successRate == null) {
            successRate = 0.0;
        }

        return DashboardStatsDTO.builder()
                .topFormations(inscriptionRepository.findTopFormations(PageRequest.of(0, 5)))
                .tauxReussiteGlobal(successRate)
                .utilisateursActifs30Jours(activityRepository.countActiveUsersSince(dateLimite))
                .build();
    }
}
