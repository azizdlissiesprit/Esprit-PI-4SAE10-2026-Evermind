package tn.esprit.profile.Controller;

import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.profile.Dto.ProfileResponse;
import tn.esprit.profile.Service.IProfileService;
import tn.esprit.profile.Service.IProfileService;

@RestController
@RequestMapping("/profile")
@AllArgsConstructor

public class ProfileController {

    private final IProfileService profileService;

    @GetMapping("/{userId}")
    public ResponseEntity<ProfileResponse> getProfile(@PathVariable Long userId) {
        // In a real microservice with Gateway, the ID comes from the Header "X-User-Id"
        // For simple testing, we pass it in the URL
        return ResponseEntity.ok(profileService.getFullProfile(userId));
    }
}