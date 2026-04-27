package tn.esprit.conversation.DTO;

public class UserDTO {
    private Long userId;
    private String firstName;
    private String lastName;
    private String email;
    private String userType;

    public UserDTO() {}

    public UserDTO(Long userId, String firstName, String lastName, String email, String userType) {
        this.userId = userId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.userType = userType;
    }

    public static UserDTOBuilder builder() {
        return new UserDTOBuilder();
    }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getUserType() { return userType; }
    public void setUserType(String userType) { this.userType = userType; }

    public static class UserDTOBuilder {
        private Long userId;
        private String firstName;
        private String lastName;
        private String email;
        private String userType;

        public UserDTOBuilder userId(Long userId) { this.userId = userId; return this; }
        public UserDTOBuilder firstName(String firstName) { this.firstName = firstName; return this; }
        public UserDTOBuilder lastName(String lastName) { this.lastName = lastName; return this; }
        public UserDTOBuilder email(String email) { this.email = email; return this; }
        public UserDTOBuilder userType(String userType) { this.userType = userType; return this; }
        public UserDTO build() { return new UserDTO(userId, firstName, lastName, email, userType); }
    }
}
