package com.mediconnect.service;

import java.util.concurrent.TimeUnit;

/**
 * Abstraction for token storage (OTP, refresh tokens, reset tokens).
 * Allows Redis in production and in-memory in dev.
 */
public interface TokenStoreService {
    void set(String key, String value, long timeout, TimeUnit unit);
    String get(String key);
    void delete(String key);
}
