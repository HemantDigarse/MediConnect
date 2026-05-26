package com.mediconnect.dto.bot;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class BotResponse {
    private String answer;
    private List<String> redFlags;
    private List<String> selfCare;
    private List<String> prescriptionNotes;
    private String disclaimer;
}
