package tn.esprit.profile.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.profile.Entity.DoctorProfile;

public interface DoctorProfileRepository extends JpaRepository<DoctorProfile, Long> {
}
