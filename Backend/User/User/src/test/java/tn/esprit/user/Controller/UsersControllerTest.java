package tn.esprit.user.Controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import tn.esprit.user.Config.JwtAuthFilter;
import tn.esprit.user.Config.JwtUtils;
import tn.esprit.user.Config.SecurityConfig;
import tn.esprit.user.DTO.UpdateUserRequest;
import tn.esprit.user.DTO.UserResponse;
import tn.esprit.user.DTO.UserStatsResponse;
import tn.esprit.user.Entity.UserType;
import tn.esprit.user.Service.IUserService;

import java.util.List;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(UsersController.class)
@Import({SecurityConfig.class, JwtAuthFilter.class})
class UsersControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private IUserService userService;

    @MockBean
    private AuthenticationProvider authenticationProvider;

    @MockBean
    private JwtUtils jwtUtils;

    @MockBean
    private UserDetailsService userDetailsService;

    @Test
    void usersEndpointsShouldRejectAnonymousRequests() throws Exception {
        mockMvc.perform(get("/users"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "admin@example.com", authorities = {"ADMIN"})
    void getUsersShouldReturnListForAdmin() throws Exception {
        when(userService.getUsers(null, null, null)).thenReturn(List.of(
                UserResponse.builder()
                        .userId(1L)
                        .email("jane@example.com")
                        .firstName("Jane")
                        .lastName("Doe")
                        .userType(UserType.ADMIN)
                        .active(true)
                        .build()
        ));

        mockMvc.perform(get("/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].email").value("jane@example.com"));
    }

    @Test
    @WithMockUser(username = "admin@example.com", authorities = {"ADMIN"})
    void getUserByIdShouldReturnUserForAdmin() throws Exception {
        when(userService.getUserById(5L)).thenReturn(
                UserResponse.builder()
                        .userId(5L)
                        .email("ali@example.com")
                        .userType(UserType.MEDECIN)
                        .active(true)
                        .build()
        );

        mockMvc.perform(get("/users/5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("ali@example.com"));
    }

    @Test
    @WithMockUser(username = "admin@example.com", authorities = {"ADMIN"})
    void updateUserShouldReturnUpdatedUserForAdmin() throws Exception {
        UpdateUserRequest request = UpdateUserRequest.builder()
                .firstName("New")
                .lastName("Name")
                .phoneNumber("999")
                .userType(UserType.RESPONSABLE)
                .build();

        when(userService.updateUser(eq(8L), eq(request))).thenReturn(
                UserResponse.builder()
                        .userId(8L)
                        .firstName("New")
                        .lastName("Name")
                        .phoneNumber("999")
                        .email("user@example.com")
                        .userType(UserType.RESPONSABLE)
                        .active(true)
                        .build()
        );

        mockMvc.perform(put("/users/8")
                        .contentType(APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userType").value("RESPONSABLE"));
    }

    @Test
    @WithMockUser(username = "admin@example.com", authorities = {"ADMIN"})
    void banAndUnbanShouldReturnUpdatedStatusForAdmin() throws Exception {
        when(userService.banUser(3L)).thenReturn(
                UserResponse.builder().userId(3L).active(false).build()
        );
        when(userService.unbanUser(3L)).thenReturn(
                UserResponse.builder().userId(3L).active(true).build()
        );

        mockMvc.perform(patch("/users/3/ban"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.active").value(false));

        mockMvc.perform(patch("/users/3/unban"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.active").value(true));
    }

    @Test
    @WithMockUser(username = "admin@example.com", authorities = {"ADMIN"})
    void deleteShouldReturnNoContentForAdmin() throws Exception {
        doNothing().when(userService).deleteUser(4L, "admin@example.com");

        mockMvc.perform(delete("/users/4"))
                .andExpect(status().isNoContent());
    }

    @Test
    @WithMockUser(username = "user@example.com", authorities = {"AIDANT"})
    void meShouldReturnCurrentUserForAuthenticatedUser() throws Exception {
        when(userService.getCurrentUser("user@example.com")).thenReturn(
                UserResponse.builder()
                        .userId(11L)
                        .email("user@example.com")
                        .userType(UserType.AIDANT)
                        .active(true)
                        .build()
        );

        mockMvc.perform(get("/users/me"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("user@example.com"));
    }

    @Test
    @WithMockUser(username = "admin@example.com", authorities = {"ADMIN"})
    void statsShouldReturnAggregatesForAdmin() throws Exception {
        when(userService.getUserStats()).thenReturn(
                UserStatsResponse.builder()
                        .totalUsers(10)
                        .activeUsers(7)
                        .bannedUsers(3)
                        .admins(1)
                        .aidants(4)
                        .medecins(3)
                        .responsables(2)
                        .build()
        );

        mockMvc.perform(get("/users/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalUsers").value(10))
                .andExpect(jsonPath("$.bannedUsers").value(3));
    }

    @Test
    @WithMockUser(username = "user@example.com", authorities = {"AIDANT"})
    void adminEndpointsShouldRejectNonAdminUsers() throws Exception {
        mockMvc.perform(get("/users"))
                .andExpect(status().isForbidden());
    }
}
