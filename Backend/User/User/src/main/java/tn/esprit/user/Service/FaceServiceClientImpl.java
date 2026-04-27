package tn.esprit.user.Service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import tn.esprit.user.DTO.FaceServiceEnrollResponse;
import tn.esprit.user.DTO.FaceServiceVerifyResponse;
import tn.esprit.user.Entity.User;

import java.io.IOException;

@Service
public class FaceServiceClientImpl implements IFaceServiceClient {

    private static final Logger log = LoggerFactory.getLogger(FaceServiceClientImpl.class);

    private final RestTemplate restTemplate;
    private final String faceServiceBaseUrl;

    public FaceServiceClientImpl(
            RestTemplate restTemplate,
            @Value("${app.face.service-url:http://localhost:8000}") String faceServiceBaseUrl
    ) {
        this.restTemplate = restTemplate;
        this.faceServiceBaseUrl = faceServiceBaseUrl;
        log.info("[FaceClient] Initialized with baseUrl={}", faceServiceBaseUrl);
    }

    @Override
    public FaceServiceEnrollResponse enroll(User user, MultipartFile faceImage) {
        String url = faceServiceBaseUrl + "/face/enroll";
        log.info("[FaceClient] ENROLL - userId={}, email={}, imageSize={}, url={}",
                user.getUserId(), user.getEmail(),
                faceImage != null ? faceImage.getSize() : "NULL", url);

        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(buildEnrollBody(user, faceImage), buildHeaders());
        try {
            ResponseEntity<FaceServiceEnrollResponse> response = restTemplate.postForEntity(
                    url, requestEntity, FaceServiceEnrollResponse.class
            );
            log.info("[FaceClient] ENROLL - response status={}, body={}", response.getStatusCode(), response.getBody());
            FaceServiceEnrollResponse body = response.getBody();
            if (body == null || !body.isSuccess()) {
                log.error("[FaceClient] ENROLL - body is null or not success: {}", body);
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Face enrollment failed");
            }
            return body;
        } catch (HttpStatusCodeException exception) {
            log.error("[FaceClient] ENROLL - HTTP error status={}, body={}", exception.getStatusCode(), exception.getResponseBodyAsString());
            throw new ResponseStatusException(
                    HttpStatus.valueOf(exception.getStatusCode().value()),
                    extractMessage(exception, "Face enrollment failed")
            );
        } catch (ResourceAccessException exception) {
            log.error("[FaceClient] ENROLL - Face service UNREACHABLE at {} - {}", url, exception.getMessage());
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Face service is unavailable at " + url);
        }
    }

    @Override
    public FaceServiceVerifyResponse verify(User user, MultipartFile faceImage) {
        String url = faceServiceBaseUrl + "/face/verify";
        log.info("[FaceClient] VERIFY - userId={}, imageSize={}, url={}",
                user.getUserId(),
                faceImage != null ? faceImage.getSize() : "NULL", url);

        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(buildVerifyBody(user, faceImage), buildHeaders());
        try {
            ResponseEntity<FaceServiceVerifyResponse> response = restTemplate.postForEntity(
                    url, requestEntity, FaceServiceVerifyResponse.class
            );
            log.info("[FaceClient] VERIFY - response status={}, body={}", response.getStatusCode(), response.getBody());
            FaceServiceVerifyResponse body = response.getBody();
            if (body == null || !body.isSuccess()) {
                log.error("[FaceClient] VERIFY - body is null or not success: {}", body);
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Face verification failed");
            }
            return body;
        } catch (HttpStatusCodeException exception) {
            log.error("[FaceClient] VERIFY - HTTP error status={}, body={}", exception.getStatusCode(), exception.getResponseBodyAsString());
            throw new ResponseStatusException(
                    HttpStatus.valueOf(exception.getStatusCode().value()),
                    extractMessage(exception, "Face verification failed")
            );
        } catch (ResourceAccessException exception) {
            log.error("[FaceClient] VERIFY - Face service UNREACHABLE at {} - {}", url, exception.getMessage());
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Face service is unavailable at " + url);
        }
    }

    @Override
    public void deleteFaceProfile(Long userId) {
        try {
            restTemplate.delete(faceServiceBaseUrl + "/face/{userId}", userId);
        } catch (HttpStatusCodeException ignored) {
            // Face profile cleanup should not mask the original user-service error path.
        }
    }

    private HttpHeaders buildHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);
        return headers;
    }

    private MultiValueMap<String, Object> buildEnrollBody(User user, MultipartFile faceImage) {
        LinkedMultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("user_id", String.valueOf(user.getUserId()));
        body.add("email", user.getEmail());
        body.add("image", asResource(faceImage));
        return body;
    }

    private MultiValueMap<String, Object> buildVerifyBody(User user, MultipartFile faceImage) {
        LinkedMultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("user_id", String.valueOf(user.getUserId()));
        body.add("image", asResource(faceImage));
        return body;
    }

    private ByteArrayResource asResource(MultipartFile multipartFile) {
        try {
            return new ByteArrayResource(multipartFile.getBytes()) {
                @Override
                public String getFilename() {
                    return multipartFile.getOriginalFilename();
                }
            };
        } catch (IOException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid face image");
        }
    }

    private String extractMessage(HttpStatusCodeException exception, String fallback) {
        String responseBody = exception.getResponseBodyAsString();
        if (responseBody != null && !responseBody.isBlank()) {
            return responseBody;
        }
        return fallback;
    }
}
