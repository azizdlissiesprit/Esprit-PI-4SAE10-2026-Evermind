package tn.esprit.user.Service;

import org.springframework.web.multipart.MultipartFile;
import tn.esprit.user.DTO.FaceServiceEnrollResponse;
import tn.esprit.user.DTO.FaceServiceVerifyResponse;
import tn.esprit.user.Entity.User;

public interface IFaceServiceClient {
    FaceServiceEnrollResponse enroll(User user, MultipartFile faceImage);
    FaceServiceVerifyResponse verify(User user, MultipartFile faceImage);
    void deleteFaceProfile(Long userId);
}
