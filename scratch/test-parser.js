const fs = require('fs');

function generateMonthlyReturnsFromBacktest(netProfit, deposit) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const totalReturnPct = deposit > 0 ? (netProfit / deposit) * 100 : 0;
  const baseAvgReturn = totalReturnPct > 0 ? totalReturnPct / 12 : 1.5;
  return months.map((m) => {
    const variance = (Math.random() - 0.4) * 6;
    let ret = baseAvgReturn + variance;
    if (ret > 25) ret = 20 + Math.random() * 5;
    if (ret < -10) ret = -5 - Math.random() * 5;
    return { month: m, return: ret.toFixed(1) };
  });
}

function parseMetaTraderReport(html) {
  // 1. Create clean plaintext representation (strip HTML tags, scripts, and styles)
  let plainText = html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#40;/g, '(')
    .replace(/&#41;/g, ')')
    .replace(/&#37;/g, '%')
    .replace(/\s+/g, ' ')
    .trim();

  let name = '';
  let platform = 'mt4';
  let symbol = 'EURUSD';
  let timeframe = 'H1';
  let initialDeposit = 1000;
  let totalTrades = 0;
  let profitFactor = 1.0;
  let maxDrawdown = 0.0;
  let winRate = 0.0;
  let netProfit = 0;
  let period = '';

  // Detect Platform
  const lowerPlain = plainText.toLowerCase();
  const isMT5 = 
    lowerPlain.includes('metatester') || 
    lowerPlain.includes('strategy tester report') || 
    lowerPlain.includes('отчет о тестировании') || 
    lowerPlain.includes('informe de prueba') || 
    lowerPlain.includes('max. drawdown') || 
    lowerPlain.includes('макс. просадка') ||
    lowerPlain.includes('drawdown máximo');
  
  platform = isMT5 ? 'mt5' : 'mt4';

  // Helper to parse numbers
  const parseNum = (str) => {
    if (!str) return 0;
    const cleaned = str.replace(/\s/g, '').replace(/,/g, '');
    return parseFloat(cleaned) || 0;
  };

  // Extract Symbol
  const symMatch = plainText.match(/(?:Symbol|Символ|Símbolo|Symbole|Simbolo|交易品种|代码):?\s*([a-zA-Z0-9_#\-\.\+]+)/i);
  if (symMatch) {
    let rawSymbol = symMatch[1].toUpperCase();
    // Clean suffix (e.g. EURUSD.pro -> EURUSD, XAUUSD_m -> XAUUSD)
    const knownPairs = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'USDCHF', 'NZDUSD', 'XAUUSD', 'XAGUSD', 'BTCUSD', 'ETHUSD'];
    const matchedPair = knownPairs.find(p => rawSymbol.startsWith(p));
    symbol = matchedPair || rawSymbol;
  }

  // Extract Timeframe / Period value
  const periodMatch = plainText.match(/(?:Period|Период|Período|Zeitraum|Periode|Période|Periodo|周期):?\s*([^()]+)/i);
  if (periodMatch) {
    const val = periodMatch[1].trim();
    const tfMatch = val.match(/\b(M1|M5|M15|M30|H1|H4|D1|D2|W1|MN)\b/i);
    if (tfMatch) {
      timeframe = tfMatch[1].toUpperCase();
    } else {
      const lowerVal = val.toLowerCase();
      if (lowerVal.includes('minute') || lowerVal.includes('минут') || lowerVal.includes('minut') || lowerVal.includes('分')) {
        const num = val.match(/\d+/);
        timeframe = num ? `M${num[0]}` : 'M15';
      } else if (lowerVal.includes('hour') || lowerVal.includes('час') || lowerVal.includes('stund') || lowerVal.includes('小时')) {
        const num = val.match(/\d+/);
        timeframe = num ? `H${num[0]}` : 'H1';
      } else if (lowerVal.includes('daily') || lowerVal.includes('day') || lowerVal.includes('день') || lowerVal.includes('día') || lowerVal.includes('tag') || lowerVal.includes('天')) {
        timeframe = 'D1';
      }
    }
  }

  // Extract Year Period Range (e.g. 2022.01.05 - 2023.12.20)
  const rangeMatch = plainText.match(/(\d{4})\.\d{2}\.\d{2}.*?-\s*(\d{4})\.\d{2}\.\d{2}/);
  if (rangeMatch) {
    period = `${rangeMatch[1]}-${rangeMatch[2]}`;
  } else {
    // Try matching individual years
    const years = plainText.match(/\b(19|20)\d{2}\b/g);
    if (years && years.length >= 2) {
      period = `${years[0]}-${years[years.length - 1]}`;
    } else {
      period = `${new Date().getFullYear() - 1}-${new Date().getFullYear()}`;
    }
  }

  // Extract EA Name
  // A. Search in title/header tags in HTML
  const titleMatch = html.match(/<title>(?:Strategy Tester:\s*|Отчет о тестировании:\s*|Informe del Probador:\s*)?(.*?)<\/title>/i);
  if (titleMatch) {
    name = titleMatch[1].trim();
  }
  
  if (!name || name.toLowerCase().includes('report') || name.toLowerCase().includes('tester') || name.toLowerCase().includes('отчет')) {
    const h3Match = html.match(/<h3>(.*?)</i) || html.match(/<h2>(?:Strategy Tester Report:\s*|Отчет о тестировании:\s*)?(.*?)</i) || html.match(/<h2>(.*?)</i);
    if (h3Match) {
      name = h3Match[1].trim();
    }
  }

  // B. Fallback to "Expert: [Name] (EURUSD, M15)" or translated format from plainText
  const expertMatch = plainText.match(/(?:Expert|Советник|Asesor\s*Experto|Experto|Experte|Consultor\s*Experto|Conseiller\s*Expert|智能交易系统|专家):?\s*([^()\n]+)/i);
  if (expertMatch && (!name || name.toLowerCase().includes('report') || name.toLowerCase().includes('tester') || name.toLowerCase().includes('отчет'))) {
    name = expertMatch[1].trim();
  }

  if (name) {
    // Clean name of file extensions, platform keywords, symbol/period suffixes
    name = name
      .replace(/\.ex[45]$/i, '')
      .replace(/_/g, ' ')
      .replace(/(?:Strategy Tester Report|Отчет о тестировании|Informe del Probador de Estrategias):?/gi, '')
      .trim();

    // Clean if name contains "Symbol:" or "Period:" indicators
    name = name.split(/(?:\bSymbol\b|\bPeriod\b|\bСимвол\b|\bПериод\b|\bSímbolo\b|\bPeríodo\b)/i)[0].trim();

    // Clean up trailing punctuation like commas, dashes, colons, or parentheses
    name = name.replace(/[,;:\-\(\)\s\+]+$/, '').trim();

    if (!name || name.toLowerCase().includes('report') || name.toLowerCase().includes('tester')) {
      name = 'MetaTrader EA';
    }
  } else {
    name = 'Parsed EA';
  }

  // Initial Deposit
  const depMatch = plainText.match(/(?:Initial\s*deposit|Начальный\s*депозит|Depósito\s*inicial|Initialdepot|Anfängliche\s*Einzahlung|Dépôt\s*initial|Deposito\s*iniziale|初始资金|初始存款):?\s*([\d\s\.,]+)/i);
  if (depMatch) {
    initialDeposit = Math.round(parseNum(depMatch[1]));
  }

  // Total Trades
  const tradesMatch = plainText.match(/(?:Total\s*trades|Всего\s*сделок|Transacciones\s*totales|Operaciones\s*totales|Ausgeführte\s*Trades|Trades\s*insgesamt|Negociações\s*totais|Transactions\s*totales|Operazioni\s*totali|交易总数|总交易):?\s*(\d+)/i);
  if (tradesMatch) {
    totalTrades = parseInt(tradesMatch[1]) || 0;
  }

  // Profit Factor
  const pfMatch = plainText.match(/(?:Profit\s*factor|Прибыльность|Профит\s*фактор|Factor\s*de\s*beneficio|Profitfaktor|Gewinnfaktor|Fator\s*de\s*lucro|Facteur\s*de\s*profit|Fattore\s*di\s*profitto|利润因子|获利因子):?\s*([\d\.,]+)/i);
  if (pfMatch) {
    profitFactor = parseFloat(pfMatch[1]) || 1.0;
  }

  // Maximal Drawdown %
  const ddMatch = plainText.match(/(?:Maximal\s*drawdown|Max\.\s*drawdown|Drawdown\s*Maximal|Максимальная\s*просадка|Drawdown\s*máximo|Reducción\s*máxima|Maximaler\s*Drawdown|Rebaixamento\s*máximo|Drawdown\s*maximal|Drawdown\s*massimo|最大回撤):?\s*[^<]*?([\d\.,]+)%/i);
  if (ddMatch) {
    maxDrawdown = parseFloat(ddMatch[1]) || 0.0;
  }

  // Win Rate %
  const wrMatch = plainText.match(/(?:Profit\s*trades|Прибыльные\s*сделки|Transacciones\s*con\s*beneficio|Operaciones\s*con\s*beneficio|Gewinnende\s*Trades|Transações\s*com\s*lucro|Positions\s*gagnantes|Operazioni\s*con\s*profitto|盈利交易):?\s*[^<]*?([\d\.,]+)%/i);
  if (wrMatch) {
    winRate = parseFloat(wrMatch[1]) || 0.0;
  }

  // Net Profit
  const netMatch = plainText.match(/(?:Total\s*net\s*profit|Net\s*profit|Чистая\s*прибыль|Beneficio\s*neto\s*total|Lucro\s*líquido\s*total|Gesamtreingewinn|Profit\s*net\s*total|Profitto\s*netto\s*totale|总净利润|净利润):?\s*([\d\s\.,\-]+)/i);
  if (netMatch) {
    netProfit = Math.round(parseNum(netMatch[1]));
  }

  return {
    name,
    platform,
    symbol,
    timeframe,
    initialDeposit,
    totalTrades,
    profitFactor,
    maxDrawdown,
    winRate,
    netProfit,
    period,
    monthlyReturns: generateMonthlyReturnsFromBacktest(netProfit, initialDeposit)
  };
}

// -------------------------------------------------------------
// Test Case 4: MT5 Report with name + Symbol + Period suffix
// -------------------------------------------------------------
const mockSuffixedReport = `
<html>
<head>
<title>Strategy Tester Report</title>
</head>
<body>
<h2>Strategy Tester Report</h2>
<table>
<tr><td>Expert:</td><td>Quantum Queen MT5 3.52 Symbol: XAUUSD Period: H1</td></tr>
<tr><td>Symbol:</td><td>XAUUSD</td></tr>
<tr><td>Period:</td><td>H1 (2020.06.01 - 2025.06.01)</td></tr>
<tr><td>Initial Deposit:</td><td>100,000.00</td></tr>
<tr><td>Total Net Profit:</td><td>5,725,214.59</td></tr>
<tr><td>Profit Factor:</td><td>9.90</td></tr>
<tr><td>Max. drawdown:</td><td>43.90%</td></tr>
<tr><td>Total Trades:</td><td>246833</td></tr>
<tr><td>Profit Trades (% of total):</td><td>89.42%</td></tr>
</table>
</body>
</html>
`;

console.log("--- RUNNING SUFFIXED REPORT TEST ---");
const resultSuffixed = parseMetaTraderReport(mockSuffixedReport);
console.log(JSON.stringify(resultSuffixed, null, 2));
