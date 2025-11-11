const modeSelect = document.getElementById("modeSelect");
const fromCurrency = document.getElementById("fromCurrency");
const toCurrency = document.getElementById("toCurrency");
const convertBtn = document.getElementById("convertBtn");
const result = document.getElementById("result");
const amountInput = document.getElementById("amount");

// Load currencies from JSON
async function loadCurrencies() {
  const res = await fetch("currencies.json");
  const data = await res.json();
  return data;
}

// Populate dropdowns
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
  const mode = modeSelect.value;
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

    if (mode === "fiat" || (!cryptoCoins.includes(from) && !cryptoCoins.includes(to))) {
      // fiat -> fiat
      const url = `https://api.exchangerate.host/convert?from=${from}&to=${to}&amount=${amount}`;
      const res = await fetch(url);
      const data = await res.json();
      converted = data.result;
    } else {
      // crypto -> fiat or crypto
      const coinMap = {};
      cryptoCoins.forEach(c => coinMap[c] = c.toLowerCase());
      const fiatMap = {};
      Object.keys(data).forEach(c => {
        if (!cryptoCoins.includes(c)) fiatMap[c] = c.toLowerCase();
      });

      let fromId = cryptoCoins.includes(from) ? coinMap[from] : fiatMap[from];
      let toId = cryptoCoins.includes(to) ? coinMap[to] : fiatMap[to];

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

// Mode change listener
modeSelect.addEventListener("change", async () => {
  const data = await loadCurrencies();
  // Ambil semua mata uang (flat) untuk dropdown, tetap bisa pilih fiat/crypto via mode
  populateDropdowns(data);
});

// Initial load
(async function init() {
  const data = await loadCurrencies();
  populateDropdowns(data);
})();

// Convert button click
convertBtn.addEventListener("click", convertCurrency);
