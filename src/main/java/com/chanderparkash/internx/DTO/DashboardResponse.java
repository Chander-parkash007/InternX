package com.chanderparkash.internx.DTO;

import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.Data;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class DashboardResponse {

    private Integer totalApplications;
    private Integer acceptedApplicatons;
    private Integer pendingApplications;
    private Integer rejectedApplications;
    private Integer totalSubmissions;
    private Double averageRating;
    private Integer totalTaskPosted;
    private Integer totalApplicationsReceived;
    private Integer totalTaskCompleted;
    private Integer totalTaskOpened;
    private Integer totalTaskInProgress;
    private Integer totalTaskCancelled;
}
