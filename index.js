const http = require('http');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { URL } = require('url');

let cognomData = [];
let dataLoaded = false;

function loadCSVData() {
  return new Promise((resolve, reject) => {
    if (dataLoaded) {
      resolve(cognomData);
      return;
    }

    cognomData = [];
    fs.createReadStream(path.join(__dirname, 's0a0rani1y0lca.csv'))
      .pipe(csv({
        separator: ';',
        headers: [
          'posicio',
          'cognom',
          'freqPrimer',
          'permilPrimer',
          'freqSegon',
          'permilSegon'
        ],
        skipLines: 9
      }))
      .on('data', (data) => {
        const procesat = {
          posicio: data.posicio,
          cognom: data.cognom,
          freqPrimer: data.freqPrimer === '..' ? null : parseInt(data.freqPrimer, 10),
          permilPrimer: data.permilPrimer === '..' ? null : parseFloat(data.permilPrimer.replace(',', '.')),
          freqSegon: data.freqSegon === '..' ? null : parseInt(data.freqSegon, 10),
          permilSegon: data.permilSegon === '..' ? null : parseFloat(data.permilSegon.replace(',', '.'))
        };
        cognomData.push(procesat);
      })
      .on('end', () => {
        dataLoaded = true;
        resolve(cognomData);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Max-Age', 86400);

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  const urlParsed = new URL(req.url, `http://${req.headers.host}`);
  const ruta = urlParsed.pathname;

  try {
    await loadCSVData();

    if (ruta === '/api/v1/cognoms') {
      const cognom = urlParsed.searchParams.get('cognom');
      const freqPrimer = parseInt(urlParsed.searchParams.get('freqPrimer'), 10);
      const freqSegon = parseInt(urlParsed.searchParams.get('freqSegon'), 10);
      const permilPrimer = parseFloat(urlParsed.searchParams.get('permilPrimer'));
      const permilSegon = parseFloat(urlParsed.searchParams.get('permilSegon'));
      const page = parseInt(urlParsed.searchParams.get('page')) || 1;
      const rawLimit = parseInt(urlParsed.searchParams.get('limit')) || 100;
      const limit = Math.min(rawLimit, 100); // màxim 100

      let resultats = [...cognomData];

      if (cognom) {
        resultats = resultats.filter(item =>
          item.cognom.toLowerCase().includes(cognom.toLowerCase())
        );
      }

      if (!isNaN(freqPrimer)) {
        resultats = resultats.filter(item =>
          item.freqPrimer !== null && item.freqPrimer >= freqPrimer
        );
      }

      if (!isNaN(freqSegon)) {
        resultats = resultats.filter(item =>
          item.freqSegon !== null && item.freqSegon >= freqSegon
        );
      }

      if (!isNaN(permilPrimer)) {
        resultats = resultats.filter(item =>
          item.permilPrimer !== null && item.permilPrimer >= permilPrimer
        );
      }

      if (!isNaN(permilSegon)) {
        resultats = resultats.filter(item =>
          item.permilSegon !== null && item.permilSegon >= permilSegon
        );
      }

      const total = resultats.length;
      const start = (page - 1) * limit;
      const end = start + limit;
      const paginats = resultats.slice(start, end);
      const hasMore = end < total;

      return res.end(JSON.stringify({
        consulta: {
          cognom,
          freqPrimer: isNaN(freqPrimer) ? null : freqPrimer,
          freqSegon: isNaN(freqSegon) ? null : freqSegon,
          permilPrimer: isNaN(permilPrimer) ? null : permilPrimer,
          permilSegon: isNaN(permilSegon) ? null : permilSegon,
          page,
          limit
        },
        total,
        hasMore,
        resultats: paginats
      }));
    }

    else if (ruta === '/api/v1/posicio') {
      const posicio = parseInt(urlParsed.searchParams.get('pos'), 10);
      if (!posicio) {
        return res.end(JSON.stringify({
          error: 'Has de proporcionar una posició. Exemple: /api/v1/posicio?pos=1'
        }));
      }

      const resultat = cognomData.find(item => parseInt(item.posicio, 10) === posicio);
      if (!resultat) {
        return res.end(JSON.stringify({
          error: `No s’ha trobat cap cognom a la posició ${posicio}`
        }));
      }

      return res.end(JSON.stringify(resultat));
    }

    else {
      return res.end(JSON.stringify({
        missatge: 'API de cognoms de Catalunya basada en dades de l\'Idescat.',
        endpoints: [
          '/api/v1/cognoms?cognom=X&freqPrimer=N&freqSegon=N&permilPrimer=M&permilSegon=M&page=1&limit=100',
          '/api/v1/posicio?pos=N'
        ]
      }));
    }
  } catch (error) {
    console.error('Error al servidor:', error);
    res.statusCode = 500;
    return res.end(JSON.stringify({ error: 'Error intern al servidor' }));
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor escoltant a http://localhost:${PORT}`);
});
