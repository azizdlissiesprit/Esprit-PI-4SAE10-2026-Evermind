package tn.esprit.profile.Service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tn.esprit.profile.Client.UserServiceClient;
import tn.esprit.profile.Dto.ProfileResponse;
import tn.esprit.profile.Dto.UserVo;
import tn.esprit.profile.Entity.CaregiverProfile;
import tn.esprit.profile.Entity.DoctorProfile;
import tn.esprit.profile.Entity.GuardianProfile;
import tn.esprit.profile.Repository.CaregiverProfileRepository;
import tn.esprit.profile.Repository.DoctorProfileRepository;
import tn.esprit.profile.Repository.GuardianProfileRepository;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ProfileServiceImpl implements IProfileService {

    private final UserServiceClient userServiceClient;
    private final CaregiverProfileRepository caregiverRepo;
    private final DoctorProfileRepository doctorRepo;
    private final GuardianProfileRepository guardianRepo;

    public ProfileResponse getFullProfile(Long userId) {
        // 1. Fetch User Basic Info from User Service
        UserVo user = userServiceClient.getUserById(userId);

        Map<String, Object> details = new HashMap<>();

        // 2. Fetch Extended Profile based on Role
        switch (user.getUserType()) {
            case "AIDANT" -> {
                CaregiverProfile profile = caregiverRepo.findById(userId)
                        .orElse(CaregiverProfile.builder().userId(userId).build()); // Return empty if new
                details.put("title", profile.getProfessionalTitle());
                details.put("affiliation", profile.getAffiliation());
                details.put("languages", profile.getLanguages());
                details.put("stats_hours", profile.getHoursLogged());
            }
            case "MEDECIN" -> {
                DoctorProfile profile = doctorRepo.findById(userId)
                        .orElse(DoctorProfile.builder().userId(userId).build());
                details.put("specialty", profile.getSpecialty());
                details.put("hospital", profile.getHospitalAffiliation());
                details.put("license", profile.getLicenseNumber());
            }
            case "RESPONSABLE" -> {
                GuardianProfile profile = guardianRepo.findById(userId)
                        .orElse(GuardianProfile.builder().userId(userId).build());
                details.put("relation", profile.getRelationToPatient());
                details.put("legalStatus", profile.getLegalStatus());
                details.put("address", profile.getAddress());
            }
        }

        // 3. Merge & Return
        return ProfileResponse.builder()
                .userId(user.getUserId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .phone(user.getPhoneNumber())
                .role(user.getUserType())
                .profileDetails(details)
                .build();
    }

    // You would also add update methods here (updateCaregiver, updateDoctor...)
}