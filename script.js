const fromCurrency = document.getElementById("fromCurrency");
const toCurrency = document.getElementById("toCurrency");
const convertBtn = document.getElementById("convertBtn");
const result = document.getElementById("result");
const amountInput = document.getElementById("amount");

// Load currencies dari JSON lokal
async function loadCurrencies() {
  try {
    const response = await fetch("currencies.json");
    if (!response.ok) throw new Error("currencies.json tidak ditemukan");
    const data = await response.json();
    if (!data) throw new Error("currencies.json kosong atau invalid");

    const currencies = Object.keys(data);

    currencies.forEach(code => {
      const option1 = document.createElement("option");
      option1.value = code;
      option1.textContent = `${code} - ${data[code]}`;
      fromCurrency.appendChild(option1);

      const option2 = document.createElement("option");
      option2.value = code;
      option2.textContent = `${code} - ${data[code]}`;
      toCurrency.appendChild(option2);
    });

    fromCurrency.value = "USD";
    toCurrency.value = "IDR";
  } catch (error) {
    result.textContent = "Gagal memuat daftar mata uang 😢 — " + error.message;
    console.error(error);
  }
}

// Fungsi untuk convert real-time
async function convertCurrency() {
  const from = fromCurrency.value;
  const to = toCurrency.value;
  const amount = parseFloat(amountInput.value);

  if (!amount || amount <= 0) {
    result.textContent = "Masukkan jumlah yang valid.";
    return;
  }

  try {
    let converted = 0;

    // Jika salah satu mata uang adalah crypto
    const cryptoCodes = ["BTC","ETH","USDT","BNB"];

    if (cryptoCodes.includes(from) || cryptoCodes.includes(to)) {
      // CoinGecko API
      let fromId = from.toLowerCase();
      let toId = to.toLowerCase();

      // CoinGecko membutuhkan ID crypto; beberapa fiat harus diganti
      const fiatMap = {USD:"usd",EUR:"eur",IDR:"idr",JPY:"jpy",GBP:"gbp",AUD:"aud",CAD:"cad",CHF:"chf",CNY:"cny",SGD:"sgd"};
      if (!cryptoCodes.includes(from)) fromId = fiatMap[from];
      if (!cryptoCodes.includes(to)) toId = fiatMap[to];

      const url = `https://api.coingecko.com/api/v3/simple/price?ids=${fromId}&vs_currencies=${toId}`;
      const response = await fetch(url);
      const data = await response.json();

      converted = data[fromId][toId] * amount;
    } else {
      // fiat ke fiat via exchangerate.host
      const url = `https://api.exchangerate.host/convert?from=${from}&to=${to}&amount=${amount}`;
      const response = await fetch(url);
      const data = await response.json();
      converted = data.result;
    }

    result.textContent = `${amount} ${from} = ${converted.toFixed(6)} ${to}`;
  } catch (error) {
    result.textContent = "Gagal melakukan konversi 😢 — " + error.message;
    console.error(error);
  }
}

convertBtn.addEventListener("click", convertCurrency);
loadCurrencies();
