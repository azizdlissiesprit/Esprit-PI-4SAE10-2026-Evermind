package tn.esprit.chatbot.Config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

import javax.sql.DataSource;
import java.util.HashMap;
import java.util.Map;

/**
 * Creates read-only JDBC connections to ALL EverMind databases.
 * These are used by the chatbot to query data across microservices.
 */
@Configuration
public class DatabaseConfig {

    @Value("${chatbot.db.host}")
    private String dbHost;

    @Value("${chatbot.db.port}")
    private String dbPort;

    @Value("${chatbot.db.username}")
    private String dbUsername;

    @Value("${chatbot.db.password}")
    private String dbPassword;

    @Value("${chatbot.db.names}")
    private String[] dbNames;

    /**
     * Map of database name -> JdbcTemplate for querying each microservice's DB.
     * All connections are read-only.
     */
    @Bean
    public Map<String, JdbcTemplate> queryJdbcTemplates() {
        Map<String, JdbcTemplate> templates = new HashMap<>();

        for (String dbName : dbNames) {
            String url = String.format("jdbc:postgresql://%s:%s/%s", dbHost, dbPort, dbName.trim());

            DataSource ds = DataSourceBuilder.create()
                    .url(url)
                    .username(dbUsername)
                    .password(dbPassword)
                    .driverClassName("org.postgresql.Driver")
                    .build();

            JdbcTemplate template = new JdbcTemplate(ds);
            template.setQueryTimeout(5); // 5-second timeout
            templates.put(dbName.trim(), template);
        }

        return templates;
    }
}
