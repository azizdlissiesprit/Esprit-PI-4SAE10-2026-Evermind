"""
Data Seeding — Insère des données de démonstration réalistes
pour alimenter le tableau de bord analytique.
Idempotent : ne réinsère rien si des données existent déjà.
"""

from fastapi import APIRouter
from datetime import datetime, timedelta
from database import engine
from sqlalchemy import text
import random
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/seed")
def seed_demo_data():
    """
    Insère des catégories, produits et commandes de démonstration
    pour alimenter le tableau de bord analytique.
    """
    with engine.begin() as conn:
        # Check if data already exists
        existing = conn.execute(text("SELECT COUNT(*) FROM commandes")).scalar()
        if existing and existing > 0:
            logger.info("Données existantes détectées — seed ignoré.")
            return {
                "status": "skipped",
                "message": f"Base déjà peuplée ({existing} commandes). Seed ignoré.",
            }

        logger.info("🌱 Début du seeding des données de démonstration...")

        # ── 1. CATEGORIES ─────────────────────────────────────────
        conn.execute(text("""
            INSERT INTO categories (nom, description, date_creation, date_modification)
            VALUES
              ('Médicaments', 'Médicaments pour le traitement de la maladie d''Alzheimer et symptômes associés', NOW(), NOW()),
              ('Matériel Médical', 'Équipement médical spécialisé pour les soins aux patients', NOW(), NOW()),
              ('Hygiène & Soins', 'Produits d''hygiène et de soins quotidiens pour patients dépendants', NOW(), NOW()),
              ('Compléments Alimentaires', 'Vitamines et suppléments nutritionnels pour séniors', NOW(), NOW())
        """))

        # Get category IDs
        cats = conn.execute(text("SELECT id, nom FROM categories ORDER BY id")).fetchall()
        cat_map = {row[1]: row[0] for row in cats}

        logger.info(f"✅ {len(cat_map)} catégories créées")

        # ── 2. PRODUCTS ───────────────────────────────────────────
        now = datetime.now()
        products = [
            # Médicaments
            ("Donépézil 10mg", "Inhibiteur de la cholinestérase pour alzheimer léger à modéré", 45.90, 120, cat_map["Médicaments"], now + timedelta(days=180), "LOT-MED-001", False, "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&q=80"),
            ("Mémantine 20mg", "Antagoniste des récepteurs NMDA pour alzheimer modéré à sévère", 62.50, 85, cat_map["Médicaments"], now + timedelta(days=25), "LOT-MED-002", False, "https://images.unsplash.com/photo-1550572017-edb7dfd24aab?w=500&q=80"),
            ("Rivastigmine Patch", "Patch transdermique — inhibiteur de la cholinestérase", 78.00, 45, cat_map["Médicaments"], now + timedelta(days=12), "LOT-MED-003", True, "https://images.unsplash.com/photo-1583324113626-70df0f4deaab?w=500&q=80"),
            ("Galantamine 8mg", "Traitement symptomatique de l'alzheimer léger", 38.75, 200, cat_map["Médicaments"], now - timedelta(days=5), "LOT-MED-004", False, "https://images.unsplash.com/photo-1585435557343-3b092031a831?w=500&q=80"),
            ("Anxiolytique Doux", "Aide au sommeil et réduction de l'agitation", 22.30, 60, cat_map["Médicaments"], now + timedelta(days=90), "LOT-MED-005", False, "https://images.unsplash.com/photo-1628771065518-0d82f1938462?w=500&q=80"),

            # Matériel Médical
            ("Tensiomètre Électronique", "Mesure automatique de la pression artérielle", 89.90, 30, cat_map["Matériel Médical"], now + timedelta(days=720), "LOT-MAT-001", False, "https://images.unsplash.com/photo-1576086213369-97a306d36557?w=500&q=80"),
            ("Oxymètre de Pouls", "Surveillance continue de la saturation en oxygène", 34.50, 8, cat_map["Matériel Médical"], now + timedelta(days=365), "LOT-MAT-002", True, "https://images.unsplash.com/photo-1584362917165-526a968579e8?w=500&q=80"),
            ("Bracelet GPS Patient", "Localisation en temps réel pour patients désorientés", 149.90, 15, cat_map["Matériel Médical"], None, "LOT-MAT-003", False, "https://images.unsplash.com/photo-1510017803434-a899398421b3?w=500&q=80"),

            # Hygiène & Soins
            ("Lingettes Nettoyantes x100", "Lingettes hypoallergéniques pour soins quotidiens", 12.90, 250, cat_map["Hygiène & Soins"], now + timedelta(days=45), "LOT-HYG-001", False, "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&q=80"),
            ("Crème Protectrice", "Protection cutanée pour peaux fragiles", 18.50, 3, cat_map["Hygiène & Soins"], now + timedelta(days=60), "LOT-HYG-002", False, "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=500&q=80"),
            ("Kit Toilette Patient", "Kit complet de toilette pour soins à domicile", 29.90, 55, cat_map["Hygiène & Soins"], now + timedelta(days=150), "LOT-HYG-003", True, "https://images.unsplash.com/photo-1584522902273-d734892c54bb?w=500&q=80"),

            # Compléments
            ("Oméga-3 DHA Sénior", "Acides gras essentiels pour la santé cognitive", 24.90, 180, cat_map["Compléments Alimentaires"], now + timedelta(days=200), "LOT-CMP-001", False, "https://images.unsplash.com/photo-1577401239170-897942555fb3?w=500&q=80"),
            ("Vitamine D3 + K2", "Renforcement osseux et immunité", 16.50, 0, cat_map["Compléments Alimentaires"], now + timedelta(days=300), "LOT-CMP-002", False, "https://images.unsplash.com/photo-1550572017-edb7dfd24aab?w=500&q=80"),
            ("Magnésium Marin B6", "Réduction de la fatigue et du stress", 19.90, 95, cat_map["Compléments Alimentaires"], now + timedelta(days=8), "LOT-CMP-003", False, "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=500&q=80"),
        ]

        for p in products:
            exp_val = f"'{p[5].strftime('%Y-%m-%d')}'" if p[5] else "NULL"
            conn.execute(text(f"""
                INSERT INTO produits (nom, description, prix, quantite, categorie_id,
                                     date_expiration, numero_lot, en_promo, image_url, date_creation, date_modification)
                VALUES (:nom, :desc, :prix, :qte, :cat_id,
                        {exp_val}, :lot, :promo, :img, NOW(), NOW())
            """), {
                "nom": p[0], "desc": p[1], "prix": p[2], "qte": p[3],
                "cat_id": p[4], "lot": p[6], "promo": p[7], "img": p[8]
            })

        logger.info(f"✅ {len(products)} produits créés")

        # Get product data for orders
        prods = conn.execute(text("SELECT id, nom, prix FROM produits ORDER BY id")).fetchall()

        # ── 3. ORDERS (spread over 90 days) ──────────────────────
        statuts = ["EN_ATTENTE", "LIVREE", "LIVREE", "LIVREE", "LIVREE", "ANNULEE"]
        prenoms = ["Ahmed", "Fatma", "Mohamed", "Amira", "Youssef", "Mariem", "Khalil", "Sonia", "Nabil", "Leila"]
        noms_famille = ["Ben Ali", "Trabelsi", "Bouazizi", "Chérif", "Khelifi", "Mansour", "Hamdi", "Jebali"]

        nb_commandes = 0
        nb_lignes = 0

        for day_offset in range(90, 0, -1):
            # 0 to 3 orders per day, more orders in recent days
            weight = 1 if day_offset > 60 else 2 if day_offset > 30 else 3
            num_orders = random.randint(0, weight)

            for _ in range(num_orders):
                order_date = now - timedelta(days=day_offset, hours=random.randint(8, 20), minutes=random.randint(0, 59))
                reference = f"CMD-{order_date.strftime('%Y%m%d')}-{random.randint(1000, 9999)}"
                statut = random.choice(statuts)
                client_nom = f"{random.choice(prenoms)} {random.choice(noms_famille)}"
                email = f"{client_nom.lower().replace(' ', '.')}@email.tn"
                telephone = f"+216 {random.randint(20, 99)} {random.randint(100, 999)} {random.randint(100, 999)}"
                adresse = f"{random.randint(1, 200)} Rue {random.choice(['Habib Bourguiba', 'de la Liberté', 'Ibn Khaldoun', 'de Carthage', 'de la République'])}, Tunis"

                # Insert order
                conn.execute(text("""
                    INSERT INTO commandes (reference, nom_client, email_client, telephone_client,
                                          adresse_livraison, statut, montant_total, date_commande, date_modification)
                    VALUES (:ref, :nom, :email, :tel, :adr, :statut, 0, :dt, :dt)
                """), {
                    "ref": reference, "nom": client_nom, "email": email,
                    "tel": telephone, "adr": adresse, "statut": statut,
                    "dt": order_date
                })

                commande_id = conn.execute(text("SELECT MAX(id) FROM commandes")).scalar()

                # 1-4 line items per order
                num_items = random.randint(1, 4)
                selected_prods = random.sample(prods, min(num_items, len(prods)))
                montant_total = 0

                for prod_row in selected_prods:
                    prod_id, prod_nom, prod_prix = prod_row
                    qte = random.randint(1, 5)
                    prix_unit = float(prod_prix)
                    sous_total = round(prix_unit * qte, 2)
                    montant_total += sous_total

                    conn.execute(text("""
                        INSERT INTO lignes_commande (commande_id, produit_id, nom_produit,
                                                    prix_unitaire, quantite, sous_total)
                        VALUES (:cmd_id, :prod_id, :nom, :prix, :qte, :st)
                    """), {
                        "cmd_id": commande_id, "prod_id": prod_id,
                        "nom": prod_nom, "prix": prix_unit,
                        "qte": qte, "st": sous_total
                    })
                    nb_lignes += 1

                # Update order total
                conn.execute(text("""
                    UPDATE commandes SET montant_total = :total WHERE id = :id
                """), {"total": round(montant_total, 2), "id": commande_id})

                nb_commandes += 1

        logger.info(f"✅ {nb_commandes} commandes et {nb_lignes} lignes créées")

        # Final counts
        total_cats = conn.execute(text("SELECT COUNT(*) FROM categories")).scalar()
        total_prods = conn.execute(text("SELECT COUNT(*) FROM produits")).scalar()
        total_cmds = conn.execute(text("SELECT COUNT(*) FROM commandes")).scalar()
        total_lines = conn.execute(text("SELECT COUNT(*) FROM lignes_commande")).scalar()

        return {
            "status": "success",
            "message": "Données de démonstration insérées avec succès",
            "stats": {
                "categories": total_cats,
                "produits": total_prods,
                "commandes": total_cmds,
                "lignesCommande": total_lines,
            },
        }
