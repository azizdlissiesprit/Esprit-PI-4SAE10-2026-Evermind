package tn.esprit.chatbot.Service;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Reads and caches the schema (tables + columns) of every EverMind database
 * on startup. The cached schema is injected into the LLM prompt so it knows
 * exactly what tables and columns exist.
 */
@Service
@Slf4j
public class DatabaseSchemaService {

    private final Map<String, JdbcTemplate> queryJdbcTemplates;

    /** Cached schema: db name -> list of "table.column (type)" */
    private final Map<String, List<TableSchema>> schemaCache = new ConcurrentHashMap<>();

    /** Pre-built prompt fragment describing the full schema */
    private volatile String schemaPromptFragment = "";

    public DatabaseSchemaService(Map<String, JdbcTemplate> queryJdbcTemplates) {
        this.queryJdbcTemplates = queryJdbcTemplates;
    }

    @PostConstruct
    public void introspectAllSchemas() {
        log.info("=== Chatbot: Introspecting database schemas ===");

        StringBuilder promptBuilder = new StringBuilder();
        promptBuilder.append("You have access to the following PostgreSQL databases and their tables:\n\n");

        for (Map.Entry<String, JdbcTemplate> entry : queryJdbcTemplates.entrySet()) {
            String dbName = entry.getKey();
            JdbcTemplate jdbc = entry.getValue();

            try {
                List<TableSchema> tables = introspectDatabase(jdbc, dbName);
                schemaCache.put(dbName, tables);

                promptBuilder.append("DATABASE: ").append(dbName).append("\n");
                for (TableSchema table : tables) {
                    promptBuilder.append("  TABLE: ").append(table.tableName).append("\n");
                    for (ColumnInfo col : table.columns) {
                        promptBuilder.append("    - ").append(col.columnName)
                                .append(" (").append(col.dataType).append(")")
                                .append(col.isPrimaryKey ? " PRIMARY KEY" : "")
                                .append(col.isNullable ? "" : " NOT NULL")
                                .append("\n");
                    }
                }
                promptBuilder.append("\n");

                log.info("Introspected database '{}': {} tables found", dbName, tables.size());
            } catch (Exception e) {
                log.warn("Failed to introspect database '{}': {}", dbName, e.getMessage());
                promptBuilder.append("DATABASE: ").append(dbName).append(" (unavailable)\n\n");
            }
        }

        schemaPromptFragment = promptBuilder.toString();
        log.info("=== Schema introspection complete. {} databases cached ===", schemaCache.size());
    }

    private List<TableSchema> introspectDatabase(JdbcTemplate jdbc, String dbName) {
        // Get all user tables (exclude system schemas)
        String tableSql = """
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
              AND table_type = 'BASE TABLE'
            ORDER BY table_name
            """;

        List<String> tableNames = jdbc.queryForList(tableSql, String.class);
        List<TableSchema> tables = new ArrayList<>();

        for (String tableName : tableNames) {
            // Get columns for this table
            String colSql = """
                SELECT c.column_name, c.data_type, c.is_nullable,
                       CASE WHEN tc.constraint_type = 'PRIMARY KEY' THEN true ELSE false END as is_pk
                FROM information_schema.columns c
                LEFT JOIN information_schema.key_column_usage kcu 
                    ON c.table_name = kcu.table_name AND c.column_name = kcu.column_name
                LEFT JOIN information_schema.table_constraints tc 
                    ON kcu.constraint_name = tc.constraint_name AND tc.constraint_type = 'PRIMARY KEY'
                WHERE c.table_schema = 'public' AND c.table_name = ?
                ORDER BY c.ordinal_position
                """;

            List<ColumnInfo> columns = jdbc.query(colSql, (rs, rowNum) -> new ColumnInfo(
                    rs.getString("column_name"),
                    rs.getString("data_type"),
                    "YES".equals(rs.getString("is_nullable")),
                    rs.getBoolean("is_pk")
            ), tableName);

            tables.add(new TableSchema(tableName, columns));
        }

        return tables;
    }

    /**
     * Returns the full schema description formatted for use in LLM prompts.
     */
    public String getSchemaPromptFragment() {
        return schemaPromptFragment;
    }

    /**
     * Returns a list of all available database names.
     */
    public Set<String> getAvailableDatabases() {
        return schemaCache.keySet();
    }

    /**
     * Refreshes the schema cache (can be called if tables change).
     */
    public void refreshSchemas() {
        schemaCache.clear();
        introspectAllSchemas();
    }

    // --- Inner record types ---

    public record TableSchema(String tableName, List<ColumnInfo> columns) {}

    public record ColumnInfo(String columnName, String dataType, boolean isNullable, boolean isPrimaryKey) {}
}
