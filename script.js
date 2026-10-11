// ===== Tilstand: det kalkulatoren "husker" =====
let gjeldende = "0";     // tallet som vises nå
let forrige = null;      // tallet før regnearten ble valgt
let operator = null;     // valgt regneart: + - * /
let nyttTall = false;    // true = neste siffer starter et nytt tall

const visning = document.getElementById("visning");
const regnestykke = document.getElementById("regnestykke");

const symboler = { "+": "+", "-": "−", "*": "×", "/": "÷" };

// ===== Hjelpefunksjoner =====

// Viser tall med norsk komma i stedet for punktum
function formater(tall) {
  return String(tall).replace(".", ",");
}

function oppdaterSkjerm() {
  visning.textContent = formater(gjeldende);
  regnestykke.textContent =
    operator && forrige !== null ? `${formater(forrige)} ${symboler[operator]}` : "";

  // Marker aktiv regneart-knapp
  document.querySelectorAll(".operator").forEach((knapp) => {
    knapp.classList.toggle("aktiv", knapp.dataset.operator === operator && nyttTall);
  });
}

function regnUt(a, b, op) {
  const x = parseFloat(a);
  const y = parseFloat(b);
  let svar;
  switch (op) {
    case "+": svar = x + y; break;
    case "-": svar = x - y; break;
    case "*": svar = x * y; break;
    case "/":
      if (y === 0) return "Feil";
      svar = x / y;
      break;
  }
  // Runder av for å unngå ting som 0.1 + 0.2 = 0.30000000000000004
  return String(parseFloat(svar.toPrecision(12)));
}

// ===== Handlinger =====

function trykkTall(siffer) {
  if (gjeldende === "Feil" || nyttTall) {
    gjeldende = siffer;
    nyttTall = false;
  } else {
    gjeldende = gjeldende === "0" ? siffer : gjeldende + siffer;
  }
  oppdaterSkjerm();
}

function trykkKomma() {
  if (nyttTall || gjeldende === "Feil") {
    gjeldende = "0.";
    nyttTall = false;
  } else if (!gjeldende.includes(".")) {
    gjeldende += ".";
  }
  oppdaterSkjerm();
}

function velgOperator(op) {
  if (gjeldende === "Feil") return;
  // Regn ut mellomresultat hvis man fortsetter et regnestykke (f.eks. 2 + 3 + ...)
  if (operator && !nyttTall) {
    gjeldende = regnUt(forrige, gjeldende, operator);
  }
  forrige = gjeldende;
  operator = op;
  nyttTall = true;
  oppdaterSkjerm();
}

function trykkLik() {
  if (!operator || forrige === null) return;
  regnestykke.textContent = "";
  gjeldende = regnUt(forrige, gjeldende, operator);
  forrige = null;
  operator = null;
  nyttTall = true;
  oppdaterSkjerm();
}

function tomAlt() {
  gjeldende = "0";
  forrige = null;
  operator = null;
  nyttTall = false;
  oppdaterSkjerm();
}

function slettSiste() {
  if (nyttTall || gjeldende === "Feil") return;
  gjeldende = gjeldende.length > 1 ? gjeldende.slice(0, -1) : "0";
  if (gjeldende === "-") gjeldende = "0";
  oppdaterSkjerm();
}

function prosent() {
  if (gjeldende === "Feil") return;
  gjeldende = String(parseFloat(gjeldende) / 100);
  oppdaterSkjerm();
}

// ===== Koble knappene til handlingene =====

document.querySelectorAll("[data-tall]").forEach((knapp) => {
  knapp.addEventListener("click", () => trykkTall(knapp.dataset.tall));
});

document.querySelectorAll("[data-operator]").forEach((knapp) => {
  knapp.addEventListener("click", () => velgOperator(knapp.dataset.operator));
});

document.getElementById("komma").addEventListener("click", trykkKomma);
document.getElementById("lik").addEventListener("click", trykkLik);
document.getElementById("tom").addEventListener("click", tomAlt);
document.getElementById("slett").addEventListener("click", slettSiste);
document.getElementById("prosent").addEventListener("click", prosent);

// ===== Tastaturstøtte =====

document.addEventListener("keydown", (e) => {
  if (/^[0-9]$/.test(e.key)) trykkTall(e.key);
  else if (e.key === "," || e.key === ".") trykkKomma();
  else if (["+", "-", "*", "/"].includes(e.key)) velgOperator(e.key);
  else if (e.key === "Enter" || e.key === "=") { e.preventDefault(); trykkLik(); }
  else if (e.key === "Backspace") slettSiste();
  else if (e.key === "Escape") tomAlt();
  else if (e.key === "%") prosent();
});

oppdaterSkjerm();
