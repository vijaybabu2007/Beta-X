package com.reguflow.ai.auth.dto;

import com.reguflow.ai.auth.entity.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class AuthDTOs {

    public static class LoginRequest {
        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        @NotBlank(message = "Password is required")
        private String password;

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class RegisterRequest {
        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        @NotBlank(message = "Password is required")
        private String password;

        @NotBlank(message = "Full name is required")
        private String fullName;

        private String phone;
        private String institutionName;
        private String aisheCode;

        @NotNull(message = "Role is required")
        private Role role;

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }

        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }

        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }

        public String getInstitutionName() { return institutionName; }
        public void setInstitutionName(String institutionName) { this.institutionName = institutionName; }

        public String getAisheCode() { return aisheCode; }
        public void setAisheCode(String aisheCode) { this.aisheCode = aisheCode; }

        public Role getRole() { return role; }
        public void setRole(Role role) { this.role = role; }
    }

    public static class AuthResponse {
        private String token;
        private String tokenType = "Bearer";
        private Long id;
        private String email;
        private String fullName;
        private Role role;
        private String institutionName;
        private String aisheCode;

        public AuthResponse(String token, Long id, String email, String fullName, Role role, String institutionName, String aisheCode) {
            this.token = token;
            this.id = id;
            this.email = email;
            this.fullName = fullName;
            this.role = role;
            this.institutionName = institutionName;
            this.aisheCode = aisheCode;
        }

        public String getToken() { return token; }
        public String getTokenType() { return tokenType; }
        public Long getId() { return id; }
        public String getEmail() { return email; }
        public String getFullName() { return fullName; }
        public Role getRole() { return role; }
        public String getInstitutionName() { return institutionName; }
        public String getAisheCode() { return aisheCode; }
    }
}
