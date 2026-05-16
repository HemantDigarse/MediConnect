package com.mediconnect.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminStatsResponse {
    private long       totalUsers;
    private long       totalPatients;
    private long       totalDoctors;
    private long       totalAppointments;
    private BigDecimal totalRevenue;
    private long       pendingAppointments;
    private long       completedAppointments;
}
