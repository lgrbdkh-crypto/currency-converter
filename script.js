const modeSelect = document.getElementById("modeSelect");
const fromCurrency = document.getElementById("fromCurrency");
const toCurrency = document.getElementById("toCurrency");
const convertBtn = document.getElementById("convertBtn");
const result = document.getElementById("result");
const amountInput = document.getElementById("amount");
const chartCanvas = document.getElementById("rateChart");

let rateChart = null;

// Crypto list
const cryptoCoins = ["BTC","ETH","USDT","BNB","XRP","DOGE","LTC","ADA","SOL"];

// Crypto → CoinGecko mapping
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

// Load currencies list from JSON
async function loadCurrencies() {
  try {
    const res = await fetch("currencies.json?nocache=" + Date.now());
    if (!res.ok) throw new Error("currencies.json not found");
    return res.json();
  } catch (err) {
    console.error("Load currencies failed:", err);
    alert("❌ currencies.json tidak ditemukan.");
    return {};
  }
}

// Filter dropdown by mode
function filterByMode(data, mode) {
  if (mode === "fiat")
    return Object.fromEntries(Object.entries(data).filter(([k]) => !cryptoCoins.includes(k)));

  if (mode === "crypto")
    return Object.fromEntries(Object.entries(data).filter(([k]) => cryptoCoins.includes(k)));

  return data;
}

// Populate dropdowns
function populateDropdowns(data) {
  fromCurrency.innerHTML = "";
  toCurrency.innerHTML = "";

  for (const [code, name] of Object.entries(data)) {
    fromCurrency.add(new Option(`${code} - ${name}`, code));
    toCurrency.add(new Option(`${code} - ${name}`, code));
  }
}

// MAIN CONVERSION FUNCTION
async function convertCurrency() {
  const from = fromCurrency.value;
  const to = toCurrency.value;
  const amount = parseFloat(amountInput.value);

  if (!amount || amount <= 0) {
    result.textContent = "⚠️ Please enter a valid amount.";
    return;
  }

  const isFromCrypto = cryptoCoins.includes(from);
  const isToCrypto = cryptoCoins.includes(to);

  try {
    let converted = null;

    // ============================================================
    // 🌍 FIAT → FIAT  (Fix utama — USD → IDR bekerja di sini)
    // ============================================================
    if (!isFromCrypto && !isToCrypto) {
      const url = `https://api.frankfurter.app/latest?from=${from}&to=${to}`;
      const data = await (await fetch(url)).json();

      if (!data.rates || !data.rates[to])
        throw new Error("No rate found for selected fiat pair.");

      converted = amount * data.rates[to];
    }

    // ============================================================
    // 💰 CRYPTO conversion (direct or via USD bridge)
    // ============================================================
    else {
      const fromId = coinMap[from] || from.toLowerCase();
      const toId = coinMap[to] || to.toLowerCase();

      // Direct crypto conversion
      const url = `https://api.coingecko.com/api/v3/simple/price?ids=${fromId}&vs_currencies=${toId}`;
      const data = await (await fetch(url)).json();

      if (data[fromId]?.[toId] !== undefined) {
        converted = data[fromId][toId] * amount;
      } else {
        // Bridge via USD if crypto pair not supported
        const urlBridge = `https://api.coingecko.com/api/v3/simple/price?ids=${fromId},${toId}&vs_currencies=usd`;
        const dataBridge = await (await fetch(urlBridge)).json();

        if (!dataBridge[fromId] || !dataBridge[toId])
          throw new Error("Crypto conversion rate missing.");

        converted = (dataBridge[fromId].usd / dataBridge[toId].usd) * amount;
      }

      // Load crypto chart
      if (isFromCrypto || isToCrypto) {
        await loadChart(fromId, isToCrypto ? toId : "usd");
      }
    }

    // Display result
    if (converted === null || isNaN(converted)) {
      result.textContent = "❌ Conversion failed — no rate found.";
    } else {
      result.textContent = `${amount} ${from} = ${converted.toLocaleString()} ${to}`;
    }
  } catch (err) {
    console.error("Conversion error:", err);
    result.textContent = "Conversion failed 😢 — " + err.message;
  }
}

// Load crypto chart
async function loadChart(fromId, toId) {
  try {
    const url = `https://api.coingecko.com/api/v3/coins/${fromId}/market_chart?vs_currency=${toId}&days=7`;
    const res = await fetch(url);
    const data = await res.json();

    if (!data.prices) return;

    const labels = data.prices.map(p => new Date(p[0]).toLocaleDateString());
    const prices = data.prices.map(p => p[1]);

    if (rateChart) rateChart.destroy();

    rateChart = new Chart(chartCanvas, {
      type: "line",
      data: {
        labels,
        datasets: [{
          label: `${fromId.toUpperCase()} → ${toId.toUpperCase()} (7 days)`,
          data: prices,
          borderColor: "#007bff",
          fill: false,
          tension: 0.2
        }]
      },
      options: { responsive: true }
    });
  } catch (err) {
    console.error("Chart load error:", err);
  }
}

// Initialize
(async function init() {
  const data = await loadCurrencies();
  populateDropdowns(filterByMode(data, modeSelect.value));
})();

modeSelect.addEventListener("change", async () => {
  const data = await loadCurrencies();
  populateDropdowns(filterByMode(data, modeSelect.value));
});

convertBtn.addEventListener("click", convertCurrency);
