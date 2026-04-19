package com.sliit.smartcampus;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class CampusNotificationSchemaMigration implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(CampusNotificationSchemaMigration.class);

    private final JdbcTemplate jdbcTemplate;

    public CampusNotificationSchemaMigration(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(ApplicationArguments args) {
        try {
            String dataType = jdbcTemplate.queryForObject(
                """
                SELECT DATA_TYPE
                FROM INFORMATION_SCHEMA.COLUMNS
                WHERE TABLE_SCHEMA = DATABASE()
                  AND TABLE_NAME = 'campus_notification'
                  AND COLUMN_NAME = 'type'
                """,
                String.class
            );

            if (dataType != null && "enum".equalsIgnoreCase(dataType.trim())) {
                jdbcTemplate.execute("ALTER TABLE campus_notification MODIFY COLUMN type VARCHAR(64) NOT NULL");
                log.info("Adjusted campus_notification.type column from ENUM to VARCHAR(64) for extensible notification types");
            }
        } catch (Exception ex) {
            // Keep startup resilient even if schema metadata is unavailable.
            log.warn("Could not verify or adjust campus_notification.type column type: {}", ex.getMessage());
        }
    }
}
