package com.mediconnect.service;

import com.mediconnect.dto.bot.BotResponse;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
public class MediConnectBotService {

    public BotResponse respond(String message) {
        String text = message.toLowerCase(Locale.ROOT);
        List<String> redFlags = findRedFlags(text);
        List<String> selfCare = new ArrayList<>();
        List<String> prescriptionNotes = new ArrayList<>();

        if (containsAny(text, "fever", "temperature", "cold", "cough", "sore throat")) {
            selfCare.add("Rest, drink fluids, and monitor temperature.");
            selfCare.add("Steam inhalation or saline gargles may help congestion or throat irritation.");
            prescriptionNotes.add("Ask a clinician whether paracetamol/acetaminophen is appropriate for fever or body ache.");
            prescriptionNotes.add("Avoid antibiotics unless a doctor confirms a bacterial infection.");
        }
        if (containsAny(text, "headache", "migraine")) {
            selfCare.add("Rest in a quiet room, hydrate, and avoid bright screens if symptoms worsen with light.");
            prescriptionNotes.add("Tell the doctor about headache location, duration, triggers, vomiting, vision changes, and any pain medicine already taken.");
        }
        if (containsAny(text, "stomach", "diarrhea", "vomit", "nausea", "acidity")) {
            selfCare.add("Take small sips of oral rehydration solution or water.");
            selfCare.add("Eat light foods and avoid alcohol, oily foods, and very spicy meals until better.");
            prescriptionNotes.add("Ask a clinician before using anti-diarrheal medicine, especially with fever or blood in stool.");
        }
        if (containsAny(text, "rash", "itch", "allergy")) {
            selfCare.add("Avoid new cosmetics, foods, or medicines that may have triggered the reaction.");
            selfCare.add("Keep the area clean and avoid scratching.");
            prescriptionNotes.add("Share photos and mention swelling, breathing difficulty, new medicines, and allergy history.");
        }
        if (containsAny(text, "diabetes", "bp", "blood pressure", "hypertension", "thyroid")) {
            selfCare.add("Keep taking prescribed long-term medicines unless your doctor tells you to stop.");
            prescriptionNotes.add("Share recent readings, current medicine names, doses, missed doses, and side effects.");
        }
        if (selfCare.isEmpty()) {
            selfCare.add("Share your age, symptoms, duration, severity, allergies, pregnancy status if relevant, and current medicines with a doctor.");
            prescriptionNotes.add("A clinician can convert these details into a safe prescription after reviewing your history.");
        }

        String answer = redFlags.isEmpty()
            ? "I can help you prepare for a consultation and suggest general self-care. Based on what you wrote, here are safe next steps."
            : "Some symptoms may need urgent medical attention. Please do not wait for a routine consultation if any red flag applies.";

        return BotResponse.builder()
            .answer(answer)
            .redFlags(redFlags)
            .selfCare(selfCare)
            .prescriptionNotes(prescriptionNotes)
            .disclaimer("MediConnect Bot provides general health information only. It cannot diagnose, prescribe medicine, or replace a licensed doctor.")
            .build();
    }

    private List<String> findRedFlags(String text) {
        List<String> redFlags = new ArrayList<>();
        if (containsAny(text, "chest pain", "breathless", "shortness of breath", "severe bleeding")) {
            redFlags.add("Chest pain, breathing trouble, or severe bleeding needs emergency care.");
        }
        if (containsAny(text, "unconscious", "seizure", "stroke", "face drooping", "weakness one side")) {
            redFlags.add("Fainting, seizure, stroke signs, or one-sided weakness needs emergency care.");
        }
        if (containsAny(text, "suicide", "self harm", "kill myself")) {
            redFlags.add("Self-harm thoughts need immediate support from local emergency services or a crisis helpline.");
        }
        if (containsAny(text, "pregnant", "baby", "infant") && containsAny(text, "fever", "bleeding", "pain")) {
            redFlags.add("Pregnancy or infant symptoms with fever, bleeding, or severe pain should be reviewed urgently.");
        }
        return redFlags;
    }

    private boolean containsAny(String text, String... needles) {
        for (String needle : needles) {
            if (text.contains(needle)) {
                return true;
            }
        }
        return false;
    }
}
