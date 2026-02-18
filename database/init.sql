-- =====================================================
-- Projet : Détection Maladie Alzheimer
-- Module : Gestion de Stock
-- Base de données : PostgreSQL
-- =====================================================

-- Création de la base de données
CREATE DATABASE alzheimer_stock
    WITH ENCODING 'UTF8'
    LC_COLLATE = 'fr_FR.UTF-8'
    LC_CTYPE = 'fr_FR.UTF-8';

-- Connexion à la base
\c alzheimer_stock;

-- Table des catégories
CREATE TABLE IF NOT EXISTS categories (
    id BIGSERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(500),
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des produits
CREATE TABLE IF NOT EXISTS produits (
    id BIGSERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    prix DECIMAL(10, 2) NOT NULL CHECK (prix > 0),
    quantite INTEGER NOT NULL CHECK (quantite >= 0),
    categorie_id BIGINT NOT NULL,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_categorie FOREIGN KEY (categorie_id)
        REFERENCES categories (id) ON DELETE CASCADE
);

-- Index pour les performances
CREATE INDEX idx_produit_categorie ON produits (categorie_id);
CREATE INDEX idx_produit_nom ON produits (nom);
CREATE INDEX idx_categorie_nom ON categories (nom);

-- Données de test
INSERT INTO categories (nom, description) VALUES
    ('Médicaments', 'Médicaments pour le traitement de la maladie d''Alzheimer'),
    ('Équipements Médicaux', 'Matériel et équipements pour le diagnostic'),
    ('Compléments Alimentaires', 'Suppléments nutritionnels recommandés'),
    ('Matériel de Rééducation', 'Outils pour la rééducation cognitive');

INSERT INTO produits (nom, description, prix, quantite, categorie_id) VALUES
    ('Donépézil 10mg', 'Inhibiteur de la cholinestérase - boîte de 30', 4500.00, 150, 1),
    ('Rivastigmine Patch', 'Patch transdermique 4.6mg/24h', 6200.00, 80, 1),
    ('Mémantine 20mg', 'Antagoniste des récepteurs NMDA - boîte de 28', 3800.00, 200, 1),
    ('Scanner IRM Portable', 'Appareil d''imagerie pour diagnostic précoce', 250000.00, 5, 2),
    ('Kit de Test Cognitif', 'Ensemble d''outils pour évaluation MMSE', 15000.00, 30, 2),
    ('Oméga-3 DHA', 'Capsules d''acides gras oméga-3 - 120 capsules', 2800.00, 300, 3),
    ('Vitamine E 400UI', 'Antioxydant - boîte de 60 capsules', 1500.00, 250, 3),
    ('Jeux de Mémoire', 'Set de jeux cognitifs pour stimulation', 8500.00, 45, 4),
    ('Tablette Cognitive', 'Tablette avec applications de rééducation', 35000.00, 20, 4);
