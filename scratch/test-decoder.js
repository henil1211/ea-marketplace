function decodeFileContent(bytes) {
  const uint8 = new Uint8Array(bytes);
  
  // Check for UTF-16 LE BOM (0xFF, 0xFE)
  if (uint8.length >= 2 && uint8[0] === 0xFF && uint8[1] === 0xFE) {
    return new TextDecoder('utf-16le').decode(bytes);
  }
  // Check for UTF-16 BE BOM (0xFE, 0xFF)
  if (uint8.length >= 2 && uint8[0] === 0xFE && uint8[1] === 0xFF) {
    return new TextDecoder('utf-16be').decode(bytes);
  }
  
  // Detect UTF-16 LE without BOM
  let zeroCount = 0;
  const testLimit = Math.min(100, uint8.length - 1);
  for (let i = 0; i < testLimit; i += 2) {
    if (uint8[i + 1] === 0x00) zeroCount++;
  }
  if (testLimit > 10 && zeroCount > (testLimit / 2) * 0.7) {
    return new TextDecoder('utf-16le').decode(bytes);
  }

  return new TextDecoder('utf-8').decode(bytes);
}

// Create a mock UTF-16 LE buffer representing standard MT5 report HTML
const testHtml = "<html><head><title>Strategy Tester Report</title></head><body>Symbol: EURUSD</body></html>";
const bufUTF8 = Buffer.from(testHtml, 'utf-8');
const bufUTF16LE = Buffer.from(testHtml, 'utf16le');

const decodedUTF8 = decodeFileContent(bufUTF8.buffer);
const decodedUTF16LE = decodeFileContent(bufUTF16LE.buffer);

console.log("Decoded UTF-8 contains Strategy Tester:", decodedUTF8.includes("Strategy Tester"));
console.log("Decoded UTF-16LE contains Strategy Tester:", decodedUTF16LE.includes("Strategy Tester"));
