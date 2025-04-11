# 📊 API de Cognoms de Catalunya

Una API REST que et permet consultar, filtrar i explorar els cognoms més comuns de Catalunya, segons dades oficials de l'Idescat (2023). Ideal per a projectes d'anàlisi demogràfica, apps de cognoms, jocs de paraules... o pura curiositat!

---

## 🔗 Dades originals

- **Font:** Institut d'Estadística de Catalunya (Idescat)
- **Any:** 2023
- **Enllaç:** [https://www.idescat.cat/cognoms/](https://www.idescat.cat/cognoms/)
- **Notes:**
  - Només es mostren cognoms amb 4 o més aparicions
  - `..` = dada confidencial o inexistent
  - El càlcul de `‰` és respecte al total de la població

---

## 🛠️ Instal·lació

```bash
git clone https://github.com/el-teu-repo/cognoms-api.git
cd cognoms-api
npm install
node index.js
```

---

## 🌐 Endpoints disponibles

### 🔍 `/api/v1/cognoms`

Cerca cognoms per nom parcial i/o per filtres numèrics.

#### Paràmetres de consulta (`query`):

| Paràmetre       | Tipus   | Descripció                                               |
|-----------------|---------|-----------------------------------------------------------|
| `cognom`        | string  | Cerca per text parcial (no sensible a majúscules)        |
| `freqPrimer`    | número  | Freqüència mínima com a primer cognom                    |
| `freqSegon`     | número  | Freqüència mínima com a segon cognom                     |
| `permilPrimer`  | decimal | Percentatge mínim com a primer cognom (‰)               |
| `permilSegon`   | decimal | Percentatge mínim com a segon cognom (‰)                |
| `page`          | número  | Número de pàgina (per defecte: `1`)                      |
| `limit`         | número  | Elements per pàgina (màxim `100`, per defecte: `100`)    |

#### Exemple:

```
/api/v1/cognoms?cognom=gar&freqPrimer=500&page=2&limit=50
```

#### Resposta:

```json
{
  "consulta": {
    "cognom": "gar",
    "freqPrimer": 500,
    "freqSegon": null,
    "permilPrimer": null,
    "permilSegon": null,
    "page": 2,
    "limit": 50
  },
  "total": 172,
  "hasMore": true,
  "resultats": [
    {
      "posicio": "1234",
      "cognom": "GARCIA",
      "freqPrimer": 15872,
      "permilPrimer": 2.03,
      "freqSegon": 15021,
      "permilSegon": 1.98
    },
    ...
  ]
}
```

---

### 🧭 `/api/v1/posicio?pos=N`

Retorna el cognom que ocupa una posició concreta al rànquing.

#### Exemple:

```
/api/v1/posicio?pos=123
```

#### Resposta:

```json
{
  "posicio": "123",
  "cognom": "MARTÍ",
  "freqPrimer": 5621,
  "permilPrimer": 0.72,
  "freqSegon": 5432,
  "permilSegon": 0.70
}
```

---

## 🧠 Possibles millores

- 🔀 Ordenació (`sort=-freqPrimer`)
- 🌍 Traduccions o suport multilingüe
- 📈 Estadístiques globals (màxims, mitjanes...)

---

## 📜 Llicència

Aquest projecte és lliure i gratuït per ús personal, educatiu o professional. Però recorda que les dades són propietat de **l’Idescat**.