package tn.esprit.user.Controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.web.servlet.MockMvc;
import tn.esprit.user.Config.JwtAuthFilter;
import tn.esprit.user.Config.JwtUtils;
import tn.esprit.user.Config.SecurityConfig;
import tn.esprit.user.DTO.AuthenticationResponse;
import tn.esprit.user.DTO.LoginRequest;
import tn.esprit.user.DTO.RegisterRequest;
import tn.esprit.user.Entity.UserType;
import tn.esprit.user.Service.IAuthenticationService;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthenticationController.class)
@Import({SecurityConfig.class, JwtAuthFilter.class})
class AuthenticationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private IAuthenticationService authenticationService;

    @MockBean
    private AuthenticationProvider authenticationProvider;

    @MockBean
    private JwtUtils jwtUtils;

    @MockBean
    private UserDetailsService userDetailsService;

    @Test
    void registerShouldBePublicAndReturnResponseBody() throws Exception {
        RegisterRequest request = RegisterRequest.builder()
                .firstName("Jane")
                .lastName("Doe")
                .email("jane@example.com")
                .password("plain-password")
                .phoneNumber("12345678")
                .userType(UserType.ADMIN)
                .build();

        AuthenticationResponse response = AuthenticationResponse.builder()
                .token(null)
                .firstName("Jane")
                .lastName("Doe")
                .email("jane@example.com")
                .role(UserType.ADMIN)
                .build();

        when(authenticationService.register(any(RegisterRequest.class))).thenReturn(response);

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("jane@example.com"))
                .andExpect(jsonPath("$.role").value("ADMIN"));
    }

    @Test
    void loginShouldBePublicAndReturnJwtPayload() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setEmail("jane@example.com");
        request.setPassword("plain-password");

        AuthenticationResponse response = AuthenticationResponse.builder()
                .token("jwt-token")
                .firstName("Jane")
                .lastName("Doe")
                .email("jane@example.com")
                .role(UserType.ADMIN)
                .build();

        when(authenticationService.authenticate(any(LoginRequest.class))).thenReturn(response);

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("jwt-token"))
                .andExpect(jsonPath("$.email").value("jane@example.com"));
    }

    @Test
    void forgotPasswordShouldReturnSuccessMessage() throws Exception {
        doNothing().when(authenticationService).forgotPassword(any());

        mockMvc.perform(post("/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"jane@example.com"}
                                """))
                .andExpect(status().isOk())
                .andExpect(content().string("Password reset email sent successfully"));
    }

    @Test
    void resetPasswordShouldReturnSuccessMessage() throws Exception {
        doNothing().when(authenticationService).resetPassword(any());

        mockMvc.perform(post("/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"token":"reset-token","newPassword":"new-password"}
                                """))
                .andExpect(status().isOk())
                .andExpect(content().string("Password reset successfully"));
    }

    @Test
    void verifyShouldReturnSuccessWhenCodeIsValid() throws Exception {
        when(authenticationService.verifyUser(eq("valid-code"))).thenReturn(true);

        mockMvc.perform(get("/auth/verify").param("code", "valid-code"))
                .andExpect(status().isOk())
                .andExpect(content().string("Account verified successfully"));
    }

    @Test
    void verifyShouldReturnBadRequestWhenCodeIsInvalid() throws Exception {
        when(authenticationService.verifyUser(eq("invalid-code"))).thenReturn(false);

        mockMvc.perform(get("/auth/verify").param("code", "invalid-code"))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Invalid verification code"));
    }
}
