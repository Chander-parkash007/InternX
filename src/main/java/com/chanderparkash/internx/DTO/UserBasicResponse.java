package com.chanderparkash.internx.DTO;

import com.chanderparkash.internx.Entities.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserBasicResponse {
    private Long id;
    private String name;
    private String email;
    private String headline;
    private String profilePicture;
    private String role;
    private boolean isOnline;

    public static UserBasicResponse fromUser(User user) {
        UserBasicResponse response = new UserBasicResponse();
        response.setId(user.getId());
        response.setName(user.getName());
        response.setEmail(user.getEmail());
        response.setHeadline(user.getHeadline());
        response.setProfilePicture(user.getProfilePicture());
        response.setRole(user.getRole().name());
        response.setOnline(false); // Will be updated by WebSocket
        return response;
    }
}
