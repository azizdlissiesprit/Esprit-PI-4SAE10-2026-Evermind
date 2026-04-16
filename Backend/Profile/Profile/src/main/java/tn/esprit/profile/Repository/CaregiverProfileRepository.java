package tn.esprit.profile.Repository;
import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.profile.Entity.CaregiverProfile;

public interface CaregiverProfileRepository extends JpaRepository<CaregiverProfile, Long> {}
// Repeat for DoctorProfileRepository and GuardianProfileRepository