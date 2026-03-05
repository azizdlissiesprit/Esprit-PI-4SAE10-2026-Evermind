# Lancer le projet EverMind

Pour que l’application **affiche les données du backend** (programmes, modules, contenu, quiz), il faut **démarrer le backend avant le frontend**.

## Option 1 : Depuis la racine du projet (recommandé)

Ouvrez **deux** terminaux PowerShell dans le dossier du projet :
`c:\Users\MESSOUDI\Desktop\EverMind-main`

### 1) D’abord – Backend (Spring Boot Formation)
```powershell
.\run-backend.cmd
```
Attendez le message du type « Started FormationApplication ». Le backend tourne sur **http://localhost:9087** (base H2 en mémoire).

### 2) Ensuite – Frontend (Angular)
```powershell
npm start
```
Le frontend sera sur **http://localhost:4200**. Les appels API passent par le proxy vers le backend ; les données du backend s’affichent dans l’app.

---

## Option 2 : Depuis les sous-dossiers

### Frontend
```powershell
cd "c:\Users\MESSOUDI\Desktop\EverMind-main\Frontend\alzheimer-care-web"
npm install
npm start
```

### Backend
```powershell
cd "c:\Users\MESSOUDI\Desktop\EverMind-main\Backend\Formation\Formation"
.\run-port9087.cmd
```
(ou : `.\mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=port9087`)

---

## Vérifications

- **Frontend** : http://localhost:4200  
- **API Formation** : http://localhost:9087/formation/programmes  

En cas d’erreur, assurez-vous d’être dans le bon dossier et que les ports 4200 et 9087 ne sont pas utilisés par une autre application.
