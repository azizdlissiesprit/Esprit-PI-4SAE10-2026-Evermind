package tn.esprit.formation.Config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

import java.util.List;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class QuizModuleConstraintFixer {

    private final JdbcTemplate jdbcTemplate;

    @Bean
    ApplicationRunner dropLegacyUniqueConstraintOnQuizModule() {
        return args -> {
            // Legacy schema may still enforce one quiz per module via a unique constraint on module_id.
            final String query = """
                    SELECT c.conname
                    FROM pg_constraint c
                    JOIN pg_class t ON c.conrelid = t.oid
                    JOIN pg_namespace n ON n.oid = t.relnamespace
                    WHERE t.relname = 'quiz'
                      AND n.nspname = current_schema()
                      AND c.contype = 'u'
                      AND EXISTS (
                        SELECT 1
                        FROM unnest(c.conkey) AS colnum
                        JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = colnum
                        WHERE a.attname = 'module_id'
                      )
                    """;

            List<String> constraints = jdbcTemplate.queryForList(query, String.class);
            if (constraints.isEmpty()) {
                return;
            }

            for (String constraintName : constraints) {
                String sql = "ALTER TABLE quiz DROP CONSTRAINT IF EXISTS \"" + constraintName + "\"";
                jdbcTemplate.execute(sql);
                log.info("Dropped legacy unique constraint on quiz.module_id: {}", constraintName);
            }
        };
    }
}
