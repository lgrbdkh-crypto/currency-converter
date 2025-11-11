// Currency list
const currencies = ["USD", "EUR", "GBP", "IDR", "JPY", "AUD", "CAD", "SGD", "CHF"];

const fromCurrency = document.getElementById("fromCurrency");
const toCurrency = document.getElementById("toCurrency");
const amountInput = document.getElementById("amount");
const resultBox = document.getElementById("result");

// Populate dropdowns
currencies.forEach(c => {
  let option1 = document.createElement("option");
  option1.value = c;
  option1.textContent = c;
  fromCurrency.appendChild(option1);

  let option2 = document.createElement("option");
  option2.value = c;
  option2.textContent = c;
  toCurrency.appendChild(option2);
});

fromCurrency.value = "USD";
toCurrency.value = "IDR";

document.getElementById("convertBtn").addEventListener("click", () => {
  let amount = parseFloat(amountInput.value);
  if (!amount) return alert("Masukkan jumlah dengan benar!");

  // Fake conversion rate (random)
  let rate = (Math.random() * (1.4 - 0.6) + 0.6).toFixed(2);
  let converted = (amount * rate).toFixed(2);

  resultBox.textContent = `${amount} ${fromCurrency.value} = ${converted} ${toCurrency.value}`;

  updateChart(rate);
});

let chart;

function updateChart(rate) {
  const ctx = document.getElementById("rateChart");

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      datasets: [{
        label: "Weekly Rate",
        data: [rate - 0.3, rate - 0.2, rate - 0.1, rate, rate + 0.1, rate - 0.05, rate],
        borderColor: "#2ea043",
        borderWidth: 2,
        fill: false,
        tension: 0.3
      }]
    },
    options: {
      plugins: { legend: { labels: { color: "#fff" } } },
      scales: {
        x: { ticks: { color: "#fff" } },
        y: { ticks: { color: "#fff" } }
      }
    }
  });
}