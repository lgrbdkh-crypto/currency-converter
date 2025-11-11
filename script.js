// script.js (versi fix)
const fromCurrency = document.getElementById("fromCurrency");
const toCurrency = document.getElementById("toCurrency");
const convertBtn = document.getElementById("convertBtn");
const result = document.getElementById("result");
const amountInput = document.getElementById("amount");
const rateChart = document.getElementById("rateChart");

const apiUrl = "https://api.frankfurter.app"; // API bebas & cepat

async function loadCurrencies() {
  try {
    const response = await fetch(`${apiUrl}/currencies`);
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

async function convertCurrency() {
  const from = fromCurrency.value;
  const to = toCurrency.value;
  const amount = amountInput.value;

  if (!amount || amount <= 0) {
    result.textContent = "Please enter a valid amount.";
    return;
  }

  try {
    const response = await fetch(`${apiUrl}/latest?amount=${amount}&from=${from}&to=${to}`);
    const data = await response.json();
    const rate = data.rates[to];
    const converted = (amount * rate).toFixed(2);
    result.textContent = `${amount} ${from} = ${converted} ${to}`;

    updateChart(from, to);
  } catch (error) {
    result.textContent = "Conversion failed 😢";
    console.error(error);
  }
}

async function updateChart(from, to) {
  try {
    const endDate = new Date().toISOString().split("T")[0];
    const startDate = "2024-11-01";

    const response = await fetch(`${apiUrl}/${startDate}..${endDate}?from=${from}&to=${to}`);
    const data = await response.json();

    const labels = Object.keys(data.rates);
    const values = labels.map(date => data.rates[date][to]);

    new Chart(rateChart, {
      type: "line",
      data: {
        labels,
        datasets: [{
          label: `${from} to ${to}`,
          data: values,
          borderColor: "#4a90e2",
          backgroundColor: "rgba(74,144,226,0.1)"
        }]
      },
      options: {
        responsive: true,
        scales: { y: { beginAtZero: false } }
      }
    });
  } catch (error) {
    console.error("Error loading chart:", error);
  }
}

convertBtn.addEventListener("click", convertCurrency);
loadCurrencies();
