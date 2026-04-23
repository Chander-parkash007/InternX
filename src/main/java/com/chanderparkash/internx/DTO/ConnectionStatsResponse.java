package com.chanderparkash.internx.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConnectionStatsResponse {
    private long followers;
    private long following;
    private long pending;
}
