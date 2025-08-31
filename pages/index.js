import { useState, useEffect } from 'react';
import Head from 'next/head';
import StockTracker from '../components/StockTracker';

const SUPPORTED_SYMBOLS = [
  {
    label: "Nifty 50",
    symbol: "^NSEI",
    type: "index",
    ath: 26250
  },
  {
    label: "BSE Sensex",
    symbol: "^BSESN", 
    type: "index",
    ath: 85000
  },
  {
    label: "Bank Nifty",
    symbol: "^NSEBANK",
    type: "index", 
    ath: 55000
  },
  {
    label: "Nifty IT",
    symbol: "^CNXIT",
    type: "index",
    ath: 45000
  },
  {
    label: "Reliance Industries",
    symbol: "RELIANCE.NS",
    type: "stock",
    ath: 3000
  },
  {
    label: "TCS",
    symbol: "TCS.NS", 
    type: "stock",
    ath: 4500
  },
  {
    label: "HDFC Bank",
    symbol: "HDFCBANK.NS",
    type: "stock", 
    ath: 2000
  },
  {
    label: "Infosys",
    symbol: "INFY.NS",
    type: "stock",
    ath: 2000
  },
  {
    label: "ITC",
    symbol: "ITC.NS",
    type: "stock",
    ath: 500
  },
  {
    label: "ICICI Bank",
    symbol: "ICICIBANK.NS",
    type: "stock",
    ath: 1200
  }
];

export default function Home() {
  const [selectedSymbol, setSelectedSymbol] = useState(SUPPORTED_SYMBOLS[0]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSymbolChange = (e) => {
    const symbol = SUPPORTED_SYMBOLS.find(s => s.symbol === e.target.value);
    setSelectedSymbol(symbol);
  };

  if (!isClient) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading Stock Tracker...</p>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Live Stock & Index Tracker</title>
        <meta name="description" content="Track live Nifty, Sensex, Bank Nifty and stock prices in real-time" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#1f2937" />
        
        {/* PWA Meta Tags */}
        <meta name="application-name" content="Stock Tracker" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Stock Tracker" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#1f2937" />
        
        {/* Icons */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <link rel="manifest" href="/manifest.json" />
        
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Live Stock & Index Tracker" />
        <meta property="og:description" content="Track live Nifty, Sensex, Bank Nifty and stock prices in real-time" />
        <meta property="og:site_name" content="Stock Tracker" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Live Stock & Index Tracker" />
        <meta name="twitter:description" content="Track live Nifty, Sensex, Bank Nifty and stock prices in real-time" />
      </Head>

      <div className="app-container">
        <header className="app-header">
          <h1 className="app-title">
            📈 Stock Tracker
          </h1>
          
          <div className="symbol-selector">
            <label htmlFor="symbol-select" className="symbol-label">
              Select Stock/Index:
            </label>
            <select 
              id="symbol-select"
              className="symbol-select" 
              value={selectedSymbol.symbol} 
              onChange={handleSymbolChange}
            >
              <optgroup label="Indices">
                {SUPPORTED_SYMBOLS.filter(s => s.type === 'index').map(symbol => (
                  <option key={symbol.symbol} value={symbol.symbol}>
                    {symbol.label}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Stocks">
                {SUPPORTED_SYMBOLS.filter(s => s.type === 'stock').map(symbol => (
                  <option key={symbol.symbol} value={symbol.symbol}>
                    {symbol.label}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>
        </header>

        <main className="main-content">
          <StockTracker selectedSymbol={selectedSymbol} />
        </main>

        <footer className="app-footer">
          <p>© 2025 Live Stock Tracker • Real-time data</p>
        </footer>
      </div>
    </>
  );
}
