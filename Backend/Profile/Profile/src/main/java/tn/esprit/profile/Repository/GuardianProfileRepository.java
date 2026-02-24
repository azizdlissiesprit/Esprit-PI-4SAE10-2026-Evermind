package tn.esprit.profile.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.profile.Entity.CaregiverProfile;
import tn.esprit.profile.Entity.GuardianProfile;

public interface GuardianProfileRepository extends JpaRepository<GuardianProfile, Long> {
}
