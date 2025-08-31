import axios from 'axios';

// Cache to avoid too many API calls
let cache = new Map();
const CACHE_DURATION = 30 * 1000; // 30 seconds

// Helper function to check if market is open (IST)
function isMarketOpen() {
  const now = new Date();
  const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
  const hours = istTime.getHours();
  const minutes = istTime.getMinutes();
  const day = istTime.getDay();
  
  // Weekend check
  if (day === 0 || day === 6) return false;
  
  const currentMinutes = hours * 60 + minutes;
  const marketStart = 9 * 60 + 15; // 9:15 AM
  const marketEnd = 15 * 60 + 30;  // 3:30 PM
  
  return currentMinutes >= marketStart && currentMinutes <= marketEnd;
}

// Parse Yahoo Finance response
function parseYahooResponse(data) {
  try {
    const result = data?.chart?.result?.[0];
    if (!result) return null;
    
    const meta = result.meta;
    const price = meta.regularMarketPrice || meta.previousClose;
    const previousClose = meta.previousClose || meta.chartPreviousClose;
    
    if (!price || price <= 0) return null;
    
    return {
      price: Math.round(price * 100) / 100,
      previousClose: Math.round(previousClose * 100) / 100,
      change: Math.round((price - previousClose) * 100) / 100,
      changePercent: Math.round(((price - previousClose) / previousClose) * 10000) / 100,
      dayHigh: Math.round((meta.regularMarketDayHigh || price) * 100) / 100,
      dayLow: Math.round((meta.regularMarketDayLow || price) * 100) / 100,
      volume: meta.regularMarketVolume || 0,
      marketState: meta.marketState || 'UNKNOWN',
      currency: meta.currency || 'INR',
      symbol: meta.symbol,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error parsing Yahoo response:', error);
    return null;
  }
}

// Fetch from Yahoo Finance with multiple fallback strategies
async function fetchStockData(symbol) {
  const endpoints = [
    `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`,
    `https://query2.finance.yahoo.com/v8/finance/chart/${symbol}`,
    `https://finance.yahoo.com/chart/${symbol}`
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await axios.get(endpoint, {
        timeout: 8000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Referer': 'https://finance.yahoo.com/'
        }
      });
      
      if (response.data && response.data.chart) {
        const parsed = parseYahooResponse(response.data);
        if (parsed) {
          console.log(`✅ Success with ${endpoint}`);
          return parsed;
        }
      }
    } catch (error) {
      console.warn(`❌ Failed ${endpoint}:`, error.message);
      continue;
    }
  }
  
  return null;
}

// Generate realistic demo data as fallback
function generateDemoData(symbol) {
  const basePrice = symbol.includes('NSEI') ? 25000 : 
                   symbol.includes('BSESN') ? 82000 :
                   symbol.includes('BANK') ? 52000 :
                   symbol.includes('RELIANCE') ? 2800 :
                   symbol.includes('TCS') ? 4200 :
                   symbol.includes('HDFC') ? 1800 : 1000;
  
  const variation = (Math.random() - 0.5) * 0.02; // ±1% variation
  const price = Math.round(basePrice * (1 + variation) * 100) / 100;
  const previousClose = Math.round(basePrice * 100) / 100;
  const change = Math.round((price - previousClose) * 100) / 100;
  const changePercent = Math.round((change / previousClose) * 10000) / 100;
  
  return {
    price,
    previousClose,
    change,
    changePercent,
    dayHigh: Math.round(price * 1.01 * 100) / 100,
    dayLow: Math.round(price * 0.99 * 100) / 100,
    volume: Math.floor(Math.random() * 10000000),
    marketState: isMarketOpen() ? 'REGULAR' : 'CLOSED',
    currency: 'INR',
    symbol,
    timestamp: new Date().toISOString(),
    isDemo: true
  };
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const { symbol } = req.query;
  
  if (!symbol) {
    return res.status(400).json({ error: 'Symbol parameter is required' });
  }
  
  // Check cache first
  const cacheKey = symbol.toUpperCase();
  const cached = cache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp < CACHE_DURATION)) {
    console.log(`📦 Cache hit for ${symbol}`);
    return res.status(200).json({ ...cached.data, fromCache: true });
  }
  
  console.log(`🔍 Fetching live data for ${symbol}`);
  
  try {
    // Try to fetch live data
    const liveData = await fetchStockData(symbol);
    
    if (liveData) {
      // Cache the result
      cache.set(cacheKey, {
        data: liveData,
        timestamp: Date.now()
      });
      
      return res.status(200).json(liveData);
    }
    
    // Fallback to demo data
    console.log(`⚠️ Live data failed, using demo data for ${symbol}`);
    const demoData = generateDemoData(symbol);
    
    // Cache demo data for shorter duration
    cache.set(cacheKey, {
      data: demoData,
      timestamp: Date.now()
    });
    
    return res.status(200).json(demoData);
    
  } catch (error) {
    console.error(`💥 API Error for ${symbol}:`, error.message);
    
    // Return demo data as last resort
    const demoData = generateDemoData(symbol);
    return res.status(200).json(demoData);
  }
}
