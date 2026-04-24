package tn.esprit.user.Controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import tn.esprit.user.Config.JwtAuthFilter;
import tn.esprit.user.Config.JwtUtils;
import tn.esprit.user.Config.SecurityConfig;
import tn.esprit.user.DTO.LoginRequest;
import tn.esprit.user.Entity.User;
import tn.esprit.user.Entity.UserType;
import tn.esprit.user.Service.IUserService;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(UserController.class)
@Import({SecurityConfig.class, JwtAuthFilter.class})
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private IUserService userService;

    @MockBean
    private AuthenticationManager authenticationManager;

    @MockBean
    private JwtUtils jwtUtils;

    @MockBean
    private AuthenticationProvider authenticationProvider;

    @MockBean
    private UserDetailsService userDetailsService;

    @Test
    void retrieveAllUsersShouldRejectAnonymousRequests() throws Exception {
        mockMvc.perform(get("/user/retrieve-all-users"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = "ADMIN")
    void retrieveAllUsersShouldReturnDataForAuthenticatedRequests() throws Exception {
        when(userService.retrieveAllUsers()).thenReturn(List.of(
                User.builder().userId(1L).firstName("Jane").lastName("Doe").email("jane@example.com").userType(UserType.ADMIN).build()
        ));

        mockMvc.perform(get("/user/retrieve-all-users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].email").value("jane@example.com"));
    }

    @Test
    void addUserShouldBePublic() throws Exception {
        User savedUser = User.builder()
                .userId(10L)
                .firstName("Jane")
                .lastName("Doe")
                .email("jane@example.com")
                .passwordHash("hashed-password")
                .userType(UserType.ADMIN)
                .active(true)
                .build();

        when(userService.addUser(any(User.class))).thenReturn(savedUser);

        mockMvc.perform(post("/user/add-user")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "firstName": "Jane",
                                  "lastName": "Doe",
                                  "email": "jane@example.com",
                                  "passwordHash": "plain-password",
                                  "userType": "ADMIN",
                                  "active": true
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value(10))
                .andExpect(jsonPath("$.email").value("jane@example.com"));
    }

    @Test
    void loginShouldBePublicAndReturnTokenString() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setEmail("jane@example.com");
        request.setPassword("plain-password");

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(new UsernamePasswordAuthenticationToken("jane@example.com", "plain-password"));
        when(jwtUtils.generateToken(eq("jane@example.com"))).thenReturn("jwt-token");

        mockMvc.perform(post("/user/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(content().string("jwt-token"));
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = "ADMIN")
    void retrieveUserShouldReturnSingleUserForAuthenticatedRequests() throws Exception {
        when(userService.retrieveUser(7L)).thenReturn(
                User.builder()
                        .userId(7L)
                        .firstName("Ali")
                        .lastName("Ben Salah")
                        .email("ali@example.com")
                        .userType(UserType.MEDECIN)
                        .build()
        );

        mockMvc.perform(get("/user/retrieve-user/7"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("ali@example.com"))
                .andExpect(jsonPath("$.userType").value("MEDECIN"));
    }
}
