import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));

// Initialize Google Gemini Client if API key is provided
let aiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  aiClient = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// AI Text Processing Route (Docs & Notes)
app.post('/api/ai/text', async (req, res) => {
  const { action, text, prompt, language = 'nl' } = req.body;
  if (!text && !prompt) {
    return res.status(400).json({ error: 'Text of prompt is verplicht.' });
  }

  const langNames: Record<string, string> = {
    nl: 'Nederlands',
    en: 'English',
    de: 'Deutsch',
    fr: 'Français',
  };
  const targetLang = langNames[language] || 'Nederlands';

  if (!aiClient) {
    // Fallback smart offline/demo generator if API key is pending
    return res.json({
      result: `[AI Geformatteerd (${targetLang})]\n\n${text ? text.trim() : prompt}\n\n• Samenvatting: Belangrijkste punten verwerkt conform richtlijnen.\n• Toon: Professioneel en zakelijk afgestemd.`,
      source: 'offline-engine',
    });
  }

  try {
    let instruction = `Je bent een geavanceerde AI-assistent in een enterprise Office Suite genaamd OmniOffice. Antwoord in het ${targetLang}.`;
    let userPrompt = '';

    switch (action) {
      case 'summarize':
        userPrompt = `Maak een beknopte, gestructureerde samenvatting met kernpunten van de volgende tekst:\n\n${text}`;
        break;
      case 'expand':
        userPrompt = `Breid de volgende tekst professioneel uit met meer context, details en voorbeelden in verzorgd ${targetLang}:\n\n${text}`;
        break;
      case 'fix_grammar':
        userPrompt = `Verbeter spelling, grammatica en interpunctie van de volgende tekst. Behoud de opmaak en toon:\n\n${text}`;
        break;
      case 'translate':
        userPrompt = `Vertaal de volgende tekst natuurlijk en vakkundig naar het ${targetLang}:\n\n${text}`;
        break;
      case 'professional_tone':
        userPrompt = `Herschrijf de volgende tekst naar een formele, diplomatieke en zakelijke bedrijfstoon:\n\n${text}`;
        break;
      case 'generate':
        userPrompt = `Schrijf een kwalitatief document of sectie gebaseerd op deze instructie:\n${prompt || text}`;
        break;
      default:
        userPrompt = prompt || `Analyseer en verbeter:\n${text}`;
    }

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction: instruction,
      },
    });

    const result = response.text || '';
    return res.json({ result, source: 'gemini-3.8-flash' });
  } catch (error: any) {
    console.error('Gemini text processing error:', error);
    return res.status(500).json({
      error: error?.message || 'Fout bij het verwerken van de tekst door de AI-service.',
    });
  }
});

// AI Spreadsheet Analysis Route
app.post('/api/ai/sheets', async (req, res) => {
  const { sheetData, query, language = 'nl' } = req.body;
  if (!sheetData) {
    return res.status(400).json({ error: 'Spreadsheet data is verplicht.' });
  }

  if (!aiClient) {
    return res.json({
      analysis: 'Offline data-analyse: Cellen succesvol geanalyseerd. Gemiddelden en totalen berekend.',
      suggestions: ['Voeg grafiek toe', 'Controleer uitbijters in rij 4'],
      formula: '=SOM(B2:B10)',
    });
  }

  try {
    const prompt = `Je bent een spreadsheet & data science analist in OmniOffice.
Gegeven de volgende spreadsheet tabulaire data (in JSON formaat):
${JSON.stringify(sheetData, null, 2)}

Gebruikersvraag of instructie: "${query || 'Analyseer deze gegevens op trends, uitschieters en geef formulesuggesties.'}"

Geef een bondig gestructureerd JSON antwoord met:
1. "analysis": Een heldere analyse in Markdown (max 3 alinea's).
2. "insights": Array van 3-4 bullet-points met datainzichten.
3. "suggestedFormulas": Array van nuttige formules (bijv. "=SOM(B2:B10)").
4. "chartRecommendation": Welk type grafiek het best past (bijv. 'bar', 'line', 'pie') en waarom.
`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    let parsed = {};
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = { analysis: text };
    }
    return res.json(parsed);
  } catch (error: any) {
    console.error('Gemini sheet analysis error:', error);
    return res.status(500).json({
      error: error?.message || 'Fout bij sheet analyse.',
    });
  }
});

// AI Presentation Slides Generator
app.post('/api/ai/slides', async (req, res) => {
  const { topic, slideCount = 4, language = 'nl' } = req.body;

  if (!aiClient) {
    return res.json({
      slides: [
        {
          title: topic || 'Projectpresentatie',
          subtitle: 'Overzicht en doelstellingen',
          bulletPoints: ['Inleiding en context', 'Doelen van het kwartaal', 'Succescriteria'],
          notes: 'Verwelkom de stakeholders en stel de agenda voor.',
          bgColor: '#1e293b',
          textColor: '#f8fafc',
        },
        {
          title: 'Strategische Pijlers',
          subtitle: 'Kernprioriteiten',
          bulletPoints: ['Innovatie en AI-integratie', 'Klanttevredenheid 95%+', 'Schaalbare infrastructuur'],
          notes: 'Focus op de 3 pijlers en meetbare KPI’s.',
          bgColor: '#0f172a',
          textColor: '#f8fafc',
        },
      ],
    });
  }

  try {
    const prompt = `Genereer een professionele bedrijfspresentatie met ${slideCount} slides over het onderwerp: "${topic}".
Taal: ${language}.
Geef een JSON array van objecten met de structuur:
[
  {
    "title": "Titel van slide",
    "subtitle": "Korte ondertitel",
    "bulletPoints": ["Punt 1", "Punt 2", "Punt 3"],
    "notes": "Sprekersnotities voor de presentator",
    "bgColor": "Hex kleurcode bijv. #0f172a of #1e3a8a",
    "textColor": "#ffffff"
  }
]`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '[]');
    return res.json({ slides: parsed });
  } catch (error: any) {
    console.error('Gemini slides error:', error);
    return res.status(500).json({
      error: error?.message || 'Fout bij het genereren van presentatieslides.',
    });
  }
});

// Mock Cloud Storage Sync Status & Backup API
app.get('/api/sync/status', (req, res) => {
  res.json({
    online: true,
    lastBackup: new Date().toISOString(),
    cloudProviders: [
      { id: 'gdrive', name: 'Google Drive', connected: true, storageUsedMb: 142, storageTotalMb: 15000 },
      { id: 'onedrive', name: 'Microsoft OneDrive', connected: true, storageUsedMb: 85, storageTotalMb: 5000 },
      { id: 'dropbox', name: 'Dropbox', connected: false, storageUsedMb: 0, storageTotalMb: 2000 },
      { id: 'nextcloud', name: 'Nextcloud Enterprise', connected: true, storageUsedMb: 320, storageTotalMb: 50000 },
    ],
  });
});

async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`OmniOffice Pro Server running on port ${port} (mode: ${isProd ? 'production' : 'development'})`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
