package com.chanderparkash.internx.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import javax.sql.DataSource;

@Configuration
@Profile("prod")
public class DatabaseConfig {

    @Value("${DATABASE_URL}")
    private String databaseUrl;

    @Bean
    public DataSource dataSource() {
        // Render provides postgres:// but Spring needs jdbc:postgresql://
        String jdbcUrl = databaseUrl
                .replace("postgres://", "jdbc:postgresql://")
                .replace("postgresql://", "jdbc:postgresql://");

        // Extract credentials from URL if present
        // Format: jdbc:postgresql://user:password@host:port/database
        return DataSourceBuilder.create()
                .url(jdbcUrl)
                .driverClassName("org.postgresql.Driver")
                .build();
    }
}
