package com.auth_service.auth_service.entity;

import com.auth_service.auth_service.enums.Role;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.io.Serializable;

@Entity
@Table(name = "users")
public class User implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    @Column(unique = true)
    @Email(message = "Invalid Email")
    private String email;

    @NotBlank(message = "Name Required")
    private String name;

    @Enumerated(EnumType.STRING)
    private Role role;

    public User() {
    }

    public User(String password,
                String email,
                String name,
                Role role) {
        this.password = password;
        this.email = email;
        this.name = name;
        this.role = role;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }
}