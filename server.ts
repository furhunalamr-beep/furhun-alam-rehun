import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { google } from "googleapis";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // AI Parse calculation parameters via natural language
  app.post("/api/ai/parse", async (req, res) => {
    const { prompt, calculatorType } = req.body;
    
    if (!process.env.GEMINI_API_KEY) {
       return res.status(500).json({ error: "Gemini API key is missing. Please configure GEMINI_API_KEY in the environment." });
    }

    try {
      if (calculatorType === "ecom_cost") {
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: `Parse this instruction for an e-commerce true cost calculator out of these parameters:
          Instruction: "${prompt}"`,
          config: {
            systemInstruction: "You are a financial parsing assistant. Extract pricing, cost, shipping, and CPA (ad cost per acquisition) from the user's message. Set missing values to null. Output only the requested JSON structure.",
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                sellingPrice: { type: Type.NUMBER, description: "The final retail selling price to customers" },
                supplierCost: { type: Type.NUMBER, description: "The item base cost from the supplier" },
                shippingCost: { type: Type.NUMBER, description: "Shipping cost per unit" },
                cpa: { type: Type.NUMBER, description: "Target or actual Cost Per Acquisition (CPA) for marketing/ads" },
              }
            }
          }
        });
        
        return res.json(JSON.parse(response.text));
      } 
      else if (calculatorType === "position_size") {
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: `Parse this instruction for a position size trade calculator:
          Instruction: "${prompt}"`,
          config: {
            systemInstruction: "You are a trading risk parsing assistant. Extract account balance, risk percentage, entry price, and stop loss price. Output only the requested JSON.",
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                accountBalance: { type: Type.NUMBER },
                riskPercent: { type: Type.NUMBER },
                entryPrice: { type: Type.NUMBER },
                stopLossInput: { type: Type.NUMBER },
              }
            }
          }
        });
        
        return res.json(JSON.parse(response.text));
      }
      
      res.status(400).json({ error: "Unsupported calculator type" });

    } catch (e: any) {
      console.error("AI parse error:", e);
      res.status(500).json({ error: "Failed to parse query" });
    }
  });

  // Simple simulated URL scraper using AI
  app.post("/api/ai/scrape-url", async (req, res) => {
    const { url } = req.body;
    
    if (!process.env.GEMINI_API_KEY) {
       return res.status(500).json({ error: "Gemini API key is missing. Please configure GEMINI_API_KEY in the environment." });
    }

    try {
      // In a real scenario we'd use 'urlContext' or Deep Research, 
      // but without complex auth or live fetch, we'll simulate Gemini recognizing domains
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Scrape/estimate the supplier cost and shipping cost based on this URL: ${url}`,
        config: {
          systemInstruction: "You are an automated aliexpress/dropshipping product scraper. Even if you can't access live data, deduce a plausible wholesale cost based on the URL keywords, or default to reasonable generic prices. Return JSON.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              productName: { type: Type.STRING },
              supplierCost: { type: Type.NUMBER },
              shippingCost: { type: Type.NUMBER },
            }
          }
        }
      });
      return res.json(JSON.parse(response.text));
    } catch (e: any) {
       res.status(500).json({ error: "Failed to scrape URL" });
    }
  });

  // Google Sheets Export
  app.post("/api/sheets/export", async (req, res) => {
    const authHeader = req.headers['authorization'];
    const accessToken = authHeader?.split(' ')[1];
    const { historyTape } = req.body;

    if (!accessToken) {
      return res.status(401).json({ error: "Missing authorization token" });
    }

    try {
      const oauth2Client = new google.auth.OAuth2();
      oauth2Client.setCredentials({ access_token: accessToken });

      const sheets = google.sheets({ version: 'v4', auth: oauth2Client });
      
      // Create a new spreadsheet
      const spreadsheet = await sheets.spreadsheets.create({
        requestBody: {
          properties: {
            title: `TradeCalc Pro Export - ${new Date().toLocaleString()}`
          }
        }
      });

      const spreadsheetId = spreadsheet.data.spreadsheetId!;
      
      // Transform tape data to rows
      const rows = [
        ['Date', 'Calculator', 'Inputs', 'Results'],
        ...historyTape.map((t: any) => [
          new Date(t.timestamp).toISOString(),
          t.title,
          JSON.stringify(t.inputs),
          JSON.stringify(t.results)
        ])
      ];

      // Update the sheet
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: 'Sheet1!A1',
        valueInputOption: 'RAW',
        requestBody: {
          values: rows
        }
      });

      res.json({ url: `https://docs.google.com/spreadsheets/d/${spreadsheetId}` });
    } catch (error: any) {
      console.error('Sheets export error:', error);
      res.status(500).json({ error: error.message || "Failed to export to Google Sheets" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
