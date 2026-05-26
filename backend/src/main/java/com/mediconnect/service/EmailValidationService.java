package com.mediconnect.service;

import com.mediconnect.dto.auth.EmailValidationResponse;
import com.mediconnect.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import javax.naming.NamingException;
import javax.naming.directory.InitialDirContext;
import java.util.Hashtable;
import java.util.Locale;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class EmailValidationService {

    private static final Pattern EMAIL_PATTERN = Pattern.compile(
        "^[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}$",
        Pattern.CASE_INSENSITIVE
    );

    private final UserRepository userRepository;

    public EmailValidationResponse validate(String rawEmail) {
        String email = normalize(rawEmail);
        boolean validFormat = email != null && EMAIL_PATTERN.matcher(email).matches();
        boolean domainReachable = validFormat && hasMailDomain(email.substring(email.indexOf('@') + 1));
        boolean available = validFormat && !userRepository.existsByEmail(email);

        String message;
        if (!validFormat) {
            message = "Enter a valid email address.";
        } else if (!domainReachable) {
            message = "Email domain does not appear to accept mail.";
        } else if (!available) {
            message = "Email is already registered.";
        } else {
            message = "Email looks good.";
        }

        return EmailValidationResponse.builder()
            .email(email)
            .validFormat(validFormat)
            .domainReachable(domainReachable)
            .available(available)
            .message(message)
            .build();
    }

    public String normalize(String rawEmail) {
        return rawEmail == null ? null : rawEmail.trim().toLowerCase(Locale.ROOT);
    }

    private boolean hasMailDomain(String domain) {
        Hashtable<String, String> env = new Hashtable<>();
        env.put("java.naming.factory.initial", "com.sun.jndi.dns.DnsContextFactory");

        try {
            var attrs = new InitialDirContext(env).getAttributes(domain, new String[] { "MX" });
            var mx = attrs.get("MX");
            if (mx != null && mx.size() > 0) {
                return true;
            }

            attrs = new InitialDirContext(env).getAttributes(domain, new String[] { "A" });
            var a = attrs.get("A");
            return a != null && a.size() > 0;
        } catch (NamingException ex) {
            return false;
        }
    }
}
