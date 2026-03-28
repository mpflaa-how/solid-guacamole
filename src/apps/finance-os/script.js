// TAB SWITCHING
document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.onclick = () => {
    const tab = btn.dataset.tab;
    document.querySelectorAll(".tab").forEach(t => t.hidden = true);
    document.getElementById("tab-" + tab).hidden = false;
  };
});

// FINANCE ASSISTANT
document.getElementById("faSend").onclick = () => {
  const q = faInput.value.trim();
  if (!q) return;

  faOutput.innerHTML = `
    <div class="card">
      <strong>Your question:</strong> ${q}<br><br>
      <em>This is where your AI or logic can respond.</em>
    </div>
  `;
};

// BUDGET TRACKER
const items = [];
document.getElementById("bAdd").onclick = () => {
  const name = bName.value.trim();
  const amt = parseFloat(bAmount.value);
  if (!name || isNaN(amt)) return;

  items.push({ name, amt });
  renderBudget();
};

function renderBudget() {
  let html = "";
  let total = 0;

  items.forEach(i => {
    total += i.amt;
    html += `<div>${i.name}: $${i.amt.toFixed(2)}</div>`;
  });

  html += `<hr><strong>Total: $${total.toFixed(2)}</strong>`;
  bList.innerHTML = html;
}

// CALCULATOR
let buffer = "";
document.querySelectorAll("#calcButtons button").forEach(btn => {
  btn.onclick = () => {
    const v = btn.textContent;

    if (v === "=") {
      try { buffer = eval(buffer).toString(); }
      catch { buffer = "Error"; }
    } else {
      buffer += v;
    }

    calcDisplay.value = buffer;
  };
});

// MONEY TOOLS
ciCalc.onclick = () => {
  const P = parseFloat(ciPrincipal.value);
  const r = parseFloat(ciRate.value) / 100;
  const y = parseFloat(ciYears.value);
  if (isNaN(P) || isNaN(r) || isNaN(y)) return;

  const A = P * Math.pow(1 + r, y);
  ciOut.innerHTML = `<strong>Future Value:</strong> $${A.toFixed(2)}`;
};

loanCalc.onclick = () => {
  const L = parseFloat(loanAmt.value);
  const r = parseFloat(loanRate.value) / 100 / 12;
  const n = parseFloat(loanYears.value) * 12;
  if (isNaN(L) || isNaN(r) || isNaN(n)) return;

  const payment = (L * r) / (1 - Math.pow(1 + r, -n));
  loanOut.innerHTML = `<strong>Monthly Payment:</strong> $${payment.toFixed(2)}`;
};
