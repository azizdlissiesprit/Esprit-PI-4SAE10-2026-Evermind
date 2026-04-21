"""
PharmaCare — Service d'Analyse Prédictive Python
=================================================
Microservice Python (FastAPI) qui se connecte à la même base PostgreSQL
que service-stock et fournit des analyses avancées par ML :

1. Prédiction de péremption (quels produits vont expirer avant d'être vendus)
2. Prévision de demande (combien commander pour chaque produit)
3. Détection d'anomalies de vente
4. Score de risque par produit

Lancement : uvicorn main:app --port 8083 --reload
Docs API  : http://localhost:8083/docs
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI(
    title="PharmaCare Analytics",
    description="Service d'analyse prédictive — péremption, demande, anomalies",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200", "http://localhost:8081"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import routes
from routes import predictions, expiration, demand, seed

app.include_router(predictions.router, prefix="/api/analytics", tags=["Prédictions"])
app.include_router(expiration.router, prefix="/api/analytics", tags=["Péremption"])
app.include_router(demand.router, prefix="/api/analytics", tags=["Demande"])
app.include_router(seed.router, prefix="/api/analytics", tags=["Seeding"])

import py_eureka_client.eureka_client as eureka_client

@app.on_event("startup")
async def startup_event():
    import asyncio
    
    # 1. Start Eureka Registration
    eureka_server_url = os.getenv("EUREKA_SERVER_URL", "http://localhost:8761/eureka")
    try:
        await eureka_client.init_async(
            eureka_server=eureka_server_url,
            app_name="STOCK-ANALYTICS",
            instance_port=8083,
        )
        print(f"✅ Successfully registered to Eureka at {eureka_server_url}")
    except Exception as e:
        print(f"❌ Failed to register with Eureka: {e}")

    # 2. Auto-run Seeding (with retry logic in case Java hasn't created tables yet)
    print("⏳ Attempting to auto-seed demo data...")
    from sqlalchemy.exc import ProgrammingError, OperationalError
    for attempt in range(5):
        try:
            from routes.seed import seed_demo_data
            result = seed_demo_data()
            print(f"✅ Seeding finished: {result.get('message')}")
            break
        except (ProgrammingError, OperationalError) as e:
            print(f"⚠️ Tables not ready yet (Attempt {attempt+1}/5). Waiting 5 seconds before retrying...")
            await asyncio.sleep(5)
        except Exception as e:
            print(f"❌ Seeding skipped due to error: {e}")
            break

@app.get("/", tags=["Health"])
def health():
    return {"status": "ok", "service": "PharmaCare Analytics (Python)"}
