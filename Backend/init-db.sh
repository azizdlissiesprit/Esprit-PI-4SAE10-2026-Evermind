#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    DROP DATABASE IF EXISTS "cognitive_assessment";
    CREATE DATABASE "Alert";
    CREATE DATABASE "User";
    CREATE DATABASE "Patient";
    CREATE DATABASE "Conversation";
    CREATE DATABASE "SensorSimulator";
    CREATE DATABASE "autonomy";
    CREATE DATABASE "cognitive_assessment";
    CREATE DATABASE "Intervention";
    CREATE DATABASE "Product";
    CREATE DATABASE "Profile";
    CREATE DATABASE "alzheimer_stock";
    CREATE DATABASE "agendamedical";
    CREATE DATABASE "Chatbot";
    CREATE DATABASE "loginlog";
EOSQL
