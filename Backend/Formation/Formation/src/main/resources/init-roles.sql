-- Script d'initialisation des rôles
-- Exécutez ce script après le démarrage de l'application pour initialiser les rôles

-- Insérer les rôles dans la base de données
INSERT INTO roles (name, description) VALUES 
('ROLE_ADMIN', 'Administrateur - Accès complet'),
('ROLE_AIDANT', 'Aidant - Accès aux formations et quiz')
ON CONFLICT (name) DO NOTHING;

-- Exemple : Créer un utilisateur admin de test
-- Hash du mot de passe "admin123" avec BCrypt : $2a$10$slYQmyNdGzin7olVN3p5Be7DlH.PKZbv5H8KnzzVgXXbVxzy990He
INSERT INTO users (nom, prenom, email, mot_de_passe, actif, created_at, updated_at) VALUES 
('Admin', 'Test', 'admin@example.com', '$2a$10$slYQmyNdGzin7olVN3p5Be7DlH.PKZbv5H8KnzzVgXXbVxzy990He', true, NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- Assigner le rôle ADMIN à l'utilisateur admin
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r 
WHERE u.email = 'admin@example.com' AND r.name = 'ROLE_ADMIN'
AND NOT EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = u.id AND ur.role_id = r.id
);

-- Exemple : Créer un utilisateur aidant de test
-- Hash du mot de passe "aidant123" avec BCrypt : $2a$10$RjtZHx9bvI.5h8qCjHLbAeC8Ygtt.R0WJ7bMuGCuPxwCqn6.wL5Ym
INSERT INTO users (nom, prenom, email, mot_de_passe, actif, created_at, updated_at) VALUES 
('Test', 'Aidant', 'aidant@example.com', '$2a$10$RjtZHx9bvI.5h8qCjHLbAeC8Ygtt.R0WJ7bMuGCuPxwCqn6.wL5Ym', true, NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- Assigner le rôle AIDANT à l'utilisateur aidant
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r 
WHERE u.email = 'aidant@example.com' AND r.name = 'ROLE_AIDANT'
AND NOT EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = u.id AND ur.role_id = r.id
);
