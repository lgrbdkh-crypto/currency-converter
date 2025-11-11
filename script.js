const fromCurrency = document.getElementById("fromCurrency");
const toCurrency = document.getElementById("toCurrency");
const convertBtn = document.getElementById("convertBtn");
const result = document.getElementById("result");
const amountInput = document.getElementById("amount");

// Load currencies dari file JSON lokal
async function loadCurrencies() {
  try {
    const response = await fetch("currencies.json");
    if (!response.ok) throw new Error("currencies.json not found");
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

// Fungsi convert sederhana dengan rate statis
function convertCurrency() {
  const from = fromCurrency.value;
  const to = toCurrency.value;
  const amount = parseFloat(amountInput.value);

  if (!amount || amount <= 0) {
    result.textContent = "Masukkan jumlah yang valid.";
    return;
  }

  // Contoh rate statis
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

convertBtn.addEventListener("click", convertCurrency);
loadCurrencies();
