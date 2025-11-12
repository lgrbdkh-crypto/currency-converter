const modeSelect = document.getElementById("modeSelect");
const fromCurrency = document.getElementById("fromCurrency");
const toCurrency = document.getElementById("toCurrency");
const convertBtn = document.getElementById("convertBtn");
const result = document.getElementById("result");
const amountInput = document.getElementById("amount");

const cryptoCoins = ["BTC","ETH","USDT","BNB","XRP","DOGE","LTC","ADA","SOL"];

async function loadCurrencies() {
  const res = await fetch("currencies.json");
  const data = await res.json();
  return data;
}

function filterByMode(data, mode) {
  if (mode === "fiat") {
    return Object.fromEntries(Object.entries(data).filter(([k]) => !cryptoCoins.includes(k)));
  } else if (mode === "crypto") {
    return Object.fromEntries(Object.entries(data).filter(([k]) => cryptoCoins.includes(k)));
  }
  return data; // all
}

function populateDropdowns(data) {
  fromCurrency.innerHTML = "";
  toCurrency.innerHTML = "";

  for (const code in data) {
    const name = data[code];

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
      // 🔹 Fiat → Fiat
      const url = `https://api.exchangerate.host/convert?from=${from}&to=${to}&amount=${amount}`;
      const res = await fetch(url);
      const data = await res.json();
      converted = data.result;

    } else {
      // 🔹 Crypto atau campuran
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

      // 🔸 1. Coba konversi langsung
      let url = `https://api.coingecko.com/api/v3/simple/price?ids=${fromId}&vs_currencies=${toId}`;
      let res = await fetch(url);
      let dataCG = await res.json();

      if (dataCG[fromId] && dataCG[fromId][toId] !== undefined) {
        converted = dataCG[fromId][toId] * amount;
      } else {
        // 🔸 2. Jika gagal, coba pakai USD sebagai jembatan
        console.warn("Direct conversion not available, using USD bridge...");
        const urlBridge = `https://api.coingecko.com/api/v3/simple/price?ids=${fromId},${toId}&vs_currencies=usd`;
        const resBridge = await fetch(urlBridge);
        const dataBridge = await resBridge.json();

        if (dataBridge[fromId]?.usd && dataBridge[toId]?.usd) {
          converted = (dataBridge[fromId].usd / dataBridge[toId].usd) * amount;
        } else {
          throw new Error("Conversion data not available from CoinGecko");
        }
      }
    }

    if (converted === null || isNaN(converted)) {
      result.textContent = "Conversion failed 😢 — no rate found.";
    } else {
      result.textContent = `${amount} ${from} = ${converted.toFixed(6)} ${to}`;
    }

  } catch (error) {
    result.textContent = "Conversion failed 😢 — " + error.message;
    console.error(error);
  }
}

(async function init() {
  const data = await loadCurrencies();
  const filtered = filterByMode(data, modeSelect.value);
  populateDropdowns(filtered);
})();

convertBtn.addEventListener("click", convertCurrency);

modeSelect.addEventListener("change", async () => {
  const data = await loadCurrencies();
  const filtered = filterByMode(data, modeSelect.value);
  populateDropdowns(filtered);
});
