const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
  // Servir le fichier HTML principal
  if (req.url === '/' || req.url === '/index.html') {
    fs.readFile(path.join(__dirname, 'admin.html'), (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end('Erreur serveur');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
  } else if (req.url === '/admin') {
    fs.readFile(path.join(__dirname, 'admin.html'), (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end('Erreur serveur');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
  } else if (req.url === '/appointments' || req.url === '/calendar') {
    fs.readFile(path.join(__dirname, 'calendar-static.html'), (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end('Erreur serveur');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
  } else if (req.url === '/test') {
    fs.readFile(path.join(__dirname, 'test-crud-web.html'), (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end('Erreur serveur');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
  } else {
    res.writeHead(404);
    res.end('Page non trouvée');
  }
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Serveur web démarré sur http://localhost:${PORT}`);
    console.log('Ouvrez votre navigateur et accédez à http://localhost:4200');
    console.log('Backend API disponible sur http://localhost:8080/api/rendezvous');
});
