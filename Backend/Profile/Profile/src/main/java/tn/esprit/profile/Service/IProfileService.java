package tn.esprit.profile.Service;

import tn.esprit.profile.Dto.ProfileResponse;

public interface IProfileService {

    public ProfileResponse getFullProfile(Long userId);
}
