package com.example.reclamation.presence.dto;

import com.example.reclamation.presence.PresenceStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PresenceStatisticsResponse {
    private String userId;
    private String userFirstName;
    private String userLastName;
    private Map<PresenceStatus, Long> statusCounts;
    private Long totalDays;
    private Double attendancePercentage;
    private Long presentDays;
    private Long absentDays;
    private Long lateDays;
    private Long leaveDays;
}
