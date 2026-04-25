import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import "dotenv/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// API route to search flights using SerpApi (Google Flights API)
app.get("/api/flights", async (req, res) => {
  const { departure_id, arrival_id, outbound_date, return_date, type, adults } = req.query;
  
  if (!process.env.SERPAPI_KEY) {
    return res.status(500).json({ 
      error: "SERPAPI_KEY environment variable is required. Please set it in your environment variables to access real-time Google Flights data.",
      mockNeeded: true
    });
  }

  try {
    const params = new URLSearchParams({
      engine: "google_flights",
      departure_id: departure_id as string,
      arrival_id: arrival_id as string,
      outbound_date: outbound_date as string,
      currency: "USD",
      hl: "en",
      api_key: process.env.SERPAPI_KEY,
    });
    
    if (return_date) {
        params.append('return_date', return_date as string);
        params.append('type', '1'); // Round trip
    } else {
        params.append('type', '2'); // One way
    }

    if (adults) {
        params.append('adults', adults as string);
    }

    const response = await fetch(`https://serpapi.com/search.json?${params.toString()}`);
    const data = await response.json();

    res.json(data);
  } catch (error) {
    console.error("Flight API Error:", error);
    res.status(500).json({ error: "Failed to fetch flight data" });
  }
});

// For development/production: Serve the vanilla JS index.html directly from root
app.use(express.static(process.cwd()));

app.get("*", (req, res) => {
  res.sendFile(path.join(process.cwd(), "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
