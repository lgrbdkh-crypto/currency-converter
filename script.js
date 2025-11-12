const modeSelect = document.getElementById("modeSelect");
const fromCurrency = document.getElementById("fromCurrency");
const toCurrency = document.getElementById("toCurrency");
const convertBtn = document.getElementById("convertBtn");
const result = document.getElementById("result");
const amountInput = document.getElementById("amount");
const chartCanvas = document.getElementById("rateChart");

let rateChart = null;
const cryptoCoins = ["BTC","ETH","USDT","BNB","XRP","DOGE","LTC","ADA","SOL"];

// ✅ Load daftar mata uang
async function loadCurrencies() {
  try {
    const res = await fetch("currencies.json?nocache=" + Date.now());
    if (!res.ok) throw new Error("currencies.json not found!");
    return res.json();
  } catch (err) {
    console.error("Failed to load currencies:", err);
    alert("❌ Gagal memuat currencies.json — pastikan file ada di root folder.");
    return {};
  }
}

// ✅ Filter sesuai mode
function filterByMode(data, mode) {
  if (mode === "fiat") {
    return Object.fromEntries(Object.entries(data).filter(([k]) => !cryptoCoins.includes(k)));
  } else if (mode === "crypto") {
    return Object.fromEntries(Object.entries(data).filter(([k]) => cryptoCoins.includes(k)));
  }
  return data;
}

// ✅ Isi dropdown
function populateDropdowns(data) {
  fromCurrency.innerHTML = "";
  toCurrency.innerHTML = "";
  for (const [code, name] of Object.entries(data)) {
    const opt1 = new Option(`${code} - ${name}`, code);
    const opt2 = new Option(`${code} - ${name}`, code);
    fromCurrency.add(opt1);
    toCurrency.add(opt2);
  }
}

// ✅ Konversi
async function convertCurrency() {
  const from = fromCurrency.value;
  const to = toCurrency.value;
  const amount = parseFloat(amountInput.value);

  if (!amount || amount <= 0) {
    result.textContent = "⚠️ Please enter a valid amount.";
    return;
  }

  try {
    console.log("Converting:", amount, from, "to", to);

    const isFromCrypto = cryptoCoins.includes(from);
    const isToCrypto = cryptoCoins.includes(to);
    let converted = null;

    if (!isFromCrypto && !isToCrypto) {
      // 💱 Fiat ke Fiat
      const url = `https://api.exchangerate.host/convert?from=${from}&to=${to}&amount=${amount}`;
      const data = await (await fetch(url)).json();
      converted = data.result;
    } else {
      // 💰 Crypto logic
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

      const fromId = coinMap[from] || from.toLowerCase();
      const toId = coinMap[to] || to.toLowerCase();

      let url = `https://api.coingecko.com/api/v3/simple/price?ids=${fromId}&vs_currencies=${toId}`;
      let data = await (await fetch(url)).json();

      if (data[fromId]?.[toId] !== undefined) {
        converted = data[fromId][toId] * amount;
      } else {
        // Pakai USD bridge
        const urlBridge = `https://api.coingecko.com/api/v3/simple/price?ids=${fromId},${toId}&vs_currencies=usd`;
        const dataBridge = await (await fetch(urlBridge)).json();

        if (dataBridge[fromId]?.usd && dataBridge[toId]?.usd) {
          converted = (dataBridge[fromId].usd / dataBridge[toId].usd) * amount;
        } else {
          throw new Error("Conversion data unavailable.");
        }
      }

      // tampilkan grafik jika crypto terlibat
      await loadChart(fromId, toId);
    }

    if (converted === null || isNaN(converted)) {
      result.textContent = "❌ Conversion failed — no rate found.";
    } else {
      result.textContent = `${amount} ${from} = ${converted.toFixed(6)} ${to}`;
    }
  } catch (err) {
    console.error("❌ Error during conversion:", err);
    result.textContent = "Conversion failed 😢 — " + err.message;
  }
}

// ✅ Chart.js
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
      type: 'line',
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
      options: {
        responsive: true,
        plugins: { legend: { display: true } },
        scales: { y: { beginAtZero: false } }
      }
    });
  } catch (err) {
    console.error("Chart error:", err);
  }
}

// ✅ Init
(async function init() {
  console.log("🔄 Loading currencies...");
  const data = await loadCurrencies();
  populateDropdowns(filterByMode(data, modeSelect.value));
})();

modeSelect.addEventListener("change", async () => {
  const data = await loadCurrencies();
  populateDropdowns(filterByMode(data, modeSelect.value));
});

convertBtn.addEventListener("click", convertCurrency);
