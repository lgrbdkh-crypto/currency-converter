// script.js — versi GitHub Pages aman tanpa API eksternal
const fromCurrency = document.getElementById("fromCurrency");
const toCurrency = document.getElementById("toCurrency");
const convertBtn = document.getElementById("convertBtn");
const result = document.getElementById("result");
const amountInput = document.getElementById("amount");

// Load currencies dari file JSON lokal
async function loadCurrencies() {
  try {
    const response = await fetch("currencies.json");
    const data = await response.json();
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
    result.textContent = "Failed to load currencies 😢";
    console.error(error);
  }
}

// Fungsi konversi sederhana (pakai nilai tukar statis untuk demo)
function convertCurrency() {
  const from = fromCurrency.value;
  const to = toCurrency.value;
  const amount = parseFloat(amountInput.value);

  if (!amount || amount <= 0) {
    result.textContent = "Please enter a valid amount.";
    return;
  }

  // Contoh rate statis (bisa diperluas nanti)
  const rates = {
    USD: 1,
    EUR: 0.92,
    IDR: 15600,
    JPY: 150,
    GBP: 0.79,
    AUD: 1.45,
    CAD: 1.33,
    CHF: 0.88,
    CNY: 7.2,
    SGD: 1.36
  };

  const converted = (amount / rates[from]) * rates[to];
  result.textContent = `${amount} ${from} = ${converted.toFixed(2)} ${to}`;
}

// Event listener tombol convert
convertBtn.addEventListener("click", convertCurrency);

// Load currencies saat halaman terbuka
loadCurrencies();
