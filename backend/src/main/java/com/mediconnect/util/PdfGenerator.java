package com.mediconnect.util;

import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.*;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.mediconnect.entity.Consultation;
import com.mediconnect.entity.Prescription;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;

@Slf4j
@Component
public class PdfGenerator {

    private static final DeviceRgb TEAL = new DeviceRgb(15, 118, 110);
    private static final DeviceRgb LIGHT_TEAL = new DeviceRgb(240, 253, 250);

    public byte[] generatePrescriptionPdf(Prescription prescription, Consultation consultation) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try {
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf);

            // Header
            Paragraph header = new Paragraph("MediConnect")
                .setFontSize(28)
                .setBold()
                .setFontColor(TEAL)
                .setTextAlignment(TextAlignment.CENTER);
            document.add(header);

            document.add(new Paragraph("Telemedicine Platform — Official Prescription")
                .setFontSize(12)
                .setTextAlignment(TextAlignment.CENTER)
                .setFontColor(ColorConstants.GRAY));

            document.add(new LineSeparator(new com.itextpdf.kernel.pdf.canvas.draw.SolidLine()));
            document.add(new Paragraph("\n"));

            // Doctor Info
            String doctorName = consultation.getAppointment().getDoctor().getUser().getFullName();
            String specialty = consultation.getAppointment().getDoctor().getSpecialty();
            String patientName = consultation.getAppointment().getPatient().getFullName();

            document.add(new Paragraph("Dr. " + doctorName).setBold().setFontSize(14).setFontColor(TEAL));
            document.add(new Paragraph("Specialty: " + specialty).setFontSize(11));
            document.add(new Paragraph("\n"));

            // Patient Info box
            Table infoTable = new Table(UnitValue.createPercentArray(new float[]{1, 1})).useAllAvailableWidth();
            infoTable.addCell(buildCell("Patient: " + patientName, true));
            infoTable.addCell(buildCell("Date: " + (prescription.getIssuedAt() != null
                ? prescription.getIssuedAt().format(DateTimeFormatter.ofPattern("dd MMM yyyy")) : ""), true));
            document.add(infoTable);
            document.add(new Paragraph("\n"));

            // Diagnosis
            if (consultation.getDiagnosis() != null) {
                document.add(new Paragraph("Diagnosis").setBold().setFontSize(13).setFontColor(TEAL));
                document.add(new Paragraph(consultation.getDiagnosis()).setFontSize(11));
                document.add(new Paragraph("\n"));
            }

            // Medications
            document.add(new Paragraph("Medications").setBold().setFontSize(13).setFontColor(TEAL));
            document.add(new Paragraph(prescription.getMedications()).setFontSize(11));
            document.add(new Paragraph("\n"));

            document.add(new Paragraph("Dosage Instructions").setBold().setFontSize(13).setFontColor(TEAL));
            document.add(new Paragraph(prescription.getDosage()).setFontSize(11));

            if (prescription.getInstructions() != null) {
                document.add(new Paragraph("\nAdditional Instructions").setBold().setFontSize(13).setFontColor(TEAL));
                document.add(new Paragraph(prescription.getInstructions()).setFontSize(11));
            }

            // Footer
            document.add(new Paragraph("\n\n"));
            document.add(new LineSeparator(new com.itextpdf.kernel.pdf.canvas.draw.SolidLine()));
            document.add(new Paragraph("This prescription was issued via MediConnect Telemedicine Platform.")
                .setFontSize(9).setFontColor(ColorConstants.GRAY).setTextAlignment(TextAlignment.CENTER));

            document.close();
        } catch (Exception e) {
            log.error("PDF generation error: {}", e.getMessage());
            throw new RuntimeException("Failed to generate prescription PDF", e);
        }
        return baos.toByteArray();
    }

    private Cell buildCell(String content, boolean bold) {
        Paragraph p = new Paragraph(content).setFontSize(11);
        if (bold) p.setBold();
        return new Cell().add(p).setBackgroundColor(LIGHT_TEAL).setPadding(8);
    }
}
