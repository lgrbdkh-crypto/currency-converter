// script.js
const fromCurrency = document.getElementById("fromCurrency");
const toCurrency = document.getElementById("toCurrency");
const convertBtn = document.getElementById("convertBtn");
const result = document.getElementById("result");
const amountInput = document.getElementById("amount");
const rateChart = document.getElementById("rateChart");

const apiUrl = "https://api.exchangerate.host/latest";

async function loadCurrencies() {
  const response = await fetch(apiUrl);
  const data = await response.json();
  const currencies = Object.keys(data.rates);
  
  currencies.forEach(code => {
    const option1 = document.createElement("option");
    option1.value = code;
    option1.textContent = code;
    fromCurrency.appendChild(option1);

    const option2 = document.createElement("option");
    option2.value = code;
    option2.textContent = code;
    toCurrency.appendChild(option2);
  });

  fromCurrency.value = "USD";
  toCurrency.value = "IDR";
}

async function convertCurrency() {
  const from = fromCurrency.value;
  const to = toCurrency.value;
  const amount = amountInput.value;

  if (!amount || amount <= 0) {
    result.textContent = "Please enter a valid amount.";
    return;
  }

  const response = await fetch(`${apiUrl}?base=${from}&symbols=${to}`);
  const data = await response.json();
  const rate = data.rates[to];
  const converted = (amount * rate).toFixed(2);
  result.textContent = `${amount} ${from} = ${converted} ${to}`;

  updateChart(from, to);
}

async function updateChart(from, to) {
  const response = await fetch(`https://api.exchangerate.host/timeseries?start_date=2025-01-01&end_date=2025-11-01&base=${from}&symbols=${to}`);
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
}

convertBtn.addEventListener("click", convertCurrency);
loadCurrencies();
