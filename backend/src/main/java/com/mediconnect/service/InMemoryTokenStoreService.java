package com.mediconnect.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

import java.util.concurrent.*;

/**
 * In-memory token store for development (no Redis required).
 * Tokens auto-expire using a scheduled executor.
 */
@Slf4j
@Service
@Profile("dev")
public class InMemoryTokenStoreService implements TokenStoreService {

    private final ConcurrentHashMap<String, String> store = new ConcurrentHashMap<>();
    private final ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor(r -> {
        Thread t = new Thread(r, "token-expiry");
        t.setDaemon(true);
        return t;
    });

    @Override
    public void set(String key, String value, long timeout, TimeUnit unit) {
        store.put(key, value);
        scheduler.schedule(() -> {
            store.remove(key);
            log.debug("Token expired: {}", key);
        }, timeout, unit);
    }

    @Override
    public String get(String key) {
        return store.get(key);
    }

    @Override
    public void delete(String key) {
        store.remove(key);
    }
}
