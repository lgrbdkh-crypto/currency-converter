// Ambil elemen HTML
const modeSelect = document.getElementById("modeSelect"); // kalau ada menu mode
const fromCurrency = document.getElementById("fromCurrency");
const toCurrency = document.getElementById("toCurrency");
const convertBtn = document.getElementById("convertBtn");
const result = document.getElementById("result");
const amountInput = document.getElementById("amount");

// Load currencies dari JSON
async function loadCurrencies() {
  const res = await fetch("currencies.json");
  const data = await res.json();
  return data;
}

// Populate dropdown
function populateDropdowns(symbols) {
  fromCurrency.innerHTML = "";
  toCurrency.innerHTML = "";

  for (const code in symbols) {
    const name = symbols[code];

    const option1 = document.createElement("option");
    option1.value = code;
    option1.textContent = `${code} - ${name}`;
    fromCurrency.appendChild(option1);

    const option2 = document.createElement("option");
    option2.value = code;
    option2.textContent = `${code} - ${name}`;
    toCurrency.appendChild(option2);
  }
}

// Convert currency
async function convertCurrency() {
  const data = await loadCurrencies();
  const from = fromCurrency.value;
  const to = toCurrency.value;
  const amount = parseFloat(amountInput.value);

  if (!amount || amount <= 0) {
    result.textContent = "Please enter a valid amount.";
    return;
  }

  try {
    let converted = 0;
    const cryptoCoins = ["BTC","ETH","USDT","BNB","XRP","DOGE","LTC","ADA","SOL"];

    // Cek apakah from/to adalah crypto
    const isFromCrypto = cryptoCoins.includes(from);
    const isToCrypto = cryptoCoins.includes(to);

    if (!isFromCrypto && !isToCrypto) {
      // fiat → fiat
      const url = `https://api.exchangerate.host/convert?from=${from}&to=${to}&amount=${amount}`;
      const res = await fetch(url);
      const data = await res.json();
      converted = data.result;
    } else {
      // crypto → fiat / crypto
      // Map coin ke ID CoinGecko
      const coinMap = {
        "BTC": "bitcoin",
        "ETH": "ethereum",
        "USDT": "tether",
        "BNB": "binancecoin",
        "XRP": "ripple",
        "DOGE": "dogecoin",
        "LTC": "litecoin",
        "ADA": "cardano",
        "SOL": "solana"
      };

      const fromId = cryptoCoins.includes(from) ? coinMap[from] : from.toLowerCase();
      const toId = cryptoCoins.includes(to) ? coinMap[to] : to.toLowerCase();

      const url = `https://api.coingecko.com/api/v3/simple/price?ids=${fromId}&vs_currencies=${toId}`;
      const res = await fetch(url);
      const dataCG = await res.json();

      converted = dataCG[fromId][toId] * amount;
    }

    result.textContent = `${amount} ${from} = ${converted.toFixed(6)} ${to}`;
  } catch (error) {
    result.textContent = "Conversion failed 😢 — " + error.message;
    console.error(error);
  }
}

// Inisialisasi dropdown saat page load
(async function init() {
  const data = await loadCurrencies();
  populateDropdowns(data);
})();

// Event tombol convert
convertBtn.addEventListener("click", convertCurrency);

// Jika ada mode select, update dropdown sesuai mode
if (modeSelect) {
  modeSelect.addEventListener("change", async () => {
    const data = await loadCurrencies();
    populateDropdowns(data);
  });
}
