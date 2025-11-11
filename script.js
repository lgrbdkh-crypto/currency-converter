// ✅ script.js — versi fix untuk GitHub Pages
const fromCurrency = document.getElementById("fromCurrency");
const toCurrency = document.getElementById("toCurrency");
const convertBtn = document.getElementById("convertBtn");
const result = document.getElementById("result");
const amountInput = document.getElementById("amount");
const rateChart = document.getElementById("rateChart");

// gunakan API bebas & stabil
const apiKey = "91e31f5c31a3a5b8d501bfb5"; // key publik gratis
const apiUrl = `https://v6.exchangerate-api.com/v6/${apiKey}`;

async function loadCurrencies() {
  try {
    console.log("Loading currencies...");
    const response = await fetch(`${apiUrl}/latest/USD`);
    const data = await response.json();
    const currencies = Object.keys(data.conversion_rates);

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
    const response = await fetch(`${apiUrl}/pair/${from}/${to}/${amount}`);
    const data = await response.json();

    if (data.conversion_result) {
      result.textContent = `${amount} ${from} = ${data.conversion_result.toFixed(2)} ${to}`;
      updateChart(from, to);
    } else {
      result.textContent = "Conversion failed 😢";
    }
  } catch (error) {
    result.textContent = "Error fetching rate 😢";
    console.error(error);
  }
}

async function updateChart(from, to) {
  try {
    const response = await fetch(`${apiUrl}/latest/${from}`);
    const data = await response.json();
    const rates = data.conversion_rates;
    const labels = Object.keys(rates).slice(0, 10);
    const values = labels.map(l => rates[l]);

    new Chart(rateChart, {
      type: "bar",
      data: {
        labels,
        datasets: [{
          label: `${from} Exchange Rates`,
          data: values,
          backgroundColor: "rgba(74,144,226,0.5)"
        }]
      },
      options: {
        responsive: true,
        scales: { y: { beginAtZero: false } }
      }
    });
  } catch (error) {
    console.error("Chart load error:", error);
  }
}

convertBtn.addEventListener("click", convertCurrency);
loadCurrencies();
