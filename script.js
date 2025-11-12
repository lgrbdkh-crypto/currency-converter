const modeSelect = document.getElementById("modeSelect");
const fromCurrency = document.getElementById("fromCurrency");
const toCurrency = document.getElementById("toCurrency");
const convertBtn = document.getElementById("convertBtn");
const result = document.getElementById("result");
const amountInput = document.getElementById("amount");
const chartCanvas = document.getElementById("rateChart");

let rateChart = null;
const cryptoCoins = ["BTC","ETH","USDT","BNB","XRP","DOGE","LTC","ADA","SOL"];

async function loadCurrencies() {
  const res = await fetch("currencies.json");
  return res.json();
}

function filterByMode(data, mode) {
  if (mode === "fiat") {
    return Object.fromEntries(Object.entries(data).filter(([k]) => !cryptoCoins.includes(k)));
  } else if (mode === "crypto") {
    return Object.fromEntries(Object.entries(data).filter(([k]) => cryptoCoins.includes(k)));
  }
  return data;
}

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

async function convertCurrency() {
  const from = fromCurrency.value;
  const to = toCurrency.value;
  const amount = parseFloat(amountInput.value);
  if (!amount || amount <= 0) {
    result.textContent = "Please enter a valid amount.";
    return;
  }

  try {
    let converted = null;
    const isFromCrypto = cryptoCoins.includes(from);
    const isToCrypto = cryptoCoins.includes(to);

    if (!isFromCrypto && !isToCrypto) {
      const url = `https://api.exchangerate.host/convert?from=${from}&to=${to}&amount=${amount}`;
      const data = await (await fetch(url)).json();
      converted = data.result;
    } else {
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

      const fromId = isFromCrypto ? coinMap[from] : from.toLowerCase();
      const toId = isToCrypto ? coinMap[to] : to.toLowerCase();

      // coba langsung
      let url = `https://api.coingecko.com/api/v3/simple/price?ids=${fromId}&vs_currencies=${toId}`;
      let data = await (await fetch(url)).json();

      if (data[fromId]?.[toId] !== undefined) {
        converted = data[fromId][toId] * amount;
      } else {
        // pakai USD bridge
        const urlBridge = `https://api.coingecko.com/api/v3/simple/price?ids=${fromId},${toId}&vs_currencies=usd`;
        const dataBridge = await (await fetch(urlBridge)).json();

        if (dataBridge[fromId]?.usd && dataBridge[toId]?.usd) {
          converted = (dataBridge[fromId].usd / dataBridge[toId].usd) * amount;
        } else {
          throw new Error("Conversion data unavailable.");
        }
      }

      // tampilkan grafik untuk crypto
      if (isFromCrypto || isToCrypto) {
        await loadChart(fromId, toId);
      }
    }

    if (converted === null || isNaN(converted)) {
      result.textContent = "Conversion failed 😢 — no rate found.";
    } else {
      result.textContent = `${amount} ${from} = ${converted.toFixed(6)} ${to}`;
    }
  } catch (err) {
    result.textContent = "Conversion failed 😢 — " + err.message;
    console.error(err);
  }
}

// 🔹 Chart.js: tampilkan grafik historis harga 7 hari
async function loadChart(fromId, toId) {
  if (!chartCanvas) return;

  const url = `https://api.coingecko.com/api/v3/coins/${fromId}/market_chart?vs_currency=${toId}&days=7`;
  const res = await fetch(url);
  const data = await res.json();

  if (!data.prices) {
    if (rateChart) rateChart.destroy();
    return;
  }

  const labels = data.prices.map(p => new Date(p[0]).toLocaleDateString());
  const prices = data.prices.map(p => p[1]);

  if (rateChart) rateChart.destroy();
  rateChart = new Chart(chartCanvas, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: `${fromId.toUpperCase()} price in ${toId.toUpperCase()} (7 days)`,
        data: prices,
        borderColor: "#007bff",
        fill: false,
        tension: 0.2
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: true }
      },
      scales: {
        y: {
          beginAtZero: false
        }
      }
    }
  });
}

(async function init() {
  const data = await loadCurrencies();
  populateDropdowns(filterByMode(data, modeSelect.value));
})();

modeSelect.addEventListener("change", async () => {
  const data = await loadCurrencies();
  populateDropdowns(filterByMode(data, modeSelect.value));
});

convertBtn.addEventListener("click", convertCurrency);
