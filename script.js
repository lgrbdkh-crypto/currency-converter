const modeSelect = document.getElementById("modeSelect");
const fromCurrency = document.getElementById("fromCurrency");
const toCurrency = document.getElementById("toCurrency");
const convertBtn = document.getElementById("convertBtn");
const result = document.getElementById("result");
const amountInput = document.getElementById("amount");

// Load fiat currencies dari exchangerate.host
async function loadFiatCurrencies() {
  const res = await fetch("https://api.exchangerate.host/symbols");
  const data = await res.json();
  return data.symbols; // object { USD: {description:"US Dollar"}, ... }
}

// Load crypto currencies dari file lokal
async function loadCryptoCurrencies() {
  const res = await fetch("crypto.json");
  const data = await res.json();
  return data; // object { BTC: "Bitcoin", ... }
}

// Populate dropdowns
function populateDropdowns(symbols) {
  fromCurrency.innerHTML = "";
  toCurrency.innerHTML = "";
  for (const code in symbols) {
    const name = symbols[code].description || symbols[code];
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

// Convert function
async function convertCurrency() {
  const mode = modeSelect.value;
  const from = fromCurrency.value;
  const to = toCurrency.value;
  const amount = parseFloat(amountInput.value);

  if (!amount || amount <= 0) {
    result.textContent = "Masukkan jumlah yang valid.";
    return;
  }

  try {
    let converted = 0;

    if (mode === "fiat") {
      // fiat -> fiat
      const url = `https://api.exchangerate.host/convert?from=${from}&to=${to}&amount=${amount}`;
      const res = await fetch(url);
      const data = await res.json();
      converted = data.result;
    } else {
      // crypto -> fiat/crypto
      const fiatMap = {USD:"usd",EUR:"eur",IDR:"idr",JPY:"jpy",GBP:"gbp",AUD:"aud",CAD:"cad",CHF:"chf",CNY:"cny",SGD:"sgd"};
      const cryptoCodes = ["BTC","ETH","USDT","BNB","XRP","DOGE"];
      let fromId = cryptoCodes.includes(from) ? from.toLowerCase() : fiatMap[from];
      let toId = cryptoCodes.includes(to) ? to.toLowerCase() : fiatMap[to];

      const url = `https://api.coingecko.com/api/v3/simple/price?ids=${fromId}&vs_currencies=${toId}`;
      const res = await fetch(url);
      const data = await res.json();

      converted = data[fromId][toId] * amount;
    }

    result.textContent = `${amount} ${from} = ${converted.toFixed(6)} ${to}`;
  } catch (error) {
    result.textContent = "Gagal melakukan konversi 😢 — " + error.message;
    console.error(error);
  }
}

// Mode change listener
modeSelect.addEventListener("change", async () => {
  if (modeSelect.value === "fiat") {
    const fiatSymbols = await loadFiatCurrencies();
    populateDropdowns(fiatSymbols);
  } else {
    const cryptoSymbols = await loadCryptoCurrencies();
    populateDropdowns(cryptoSymbols);
  }
});

// Initial load
(async function init() {
  const fiatSymbols = await loadFiatCurrencies();
  populateDropdowns(fiatSymbols);
})();

convertBtn.addEventListener("click", convertCurrency);
