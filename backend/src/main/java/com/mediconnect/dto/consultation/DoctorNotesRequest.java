package com.mediconnect.dto.consultation;

import lombok.Data;

@Data
public class DoctorNotesRequest {
    private String diagnosis;
    private String doctorNotes;
    private String chiefComplaint;
}
