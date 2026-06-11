const CONTACT_EMAIL = "contato@laboperia.com";
const anchorLinks = document.querySelectorAll('a[href^="#"], a[href^="index.html#"]');

function scrollToSection(targetId) {
  const target = document.querySelector(targetId);

  if (!target) {
    return;
  }

  const headerOffset = document.querySelector(".site-header")?.offsetHeight || 0;
  const targetTop = target.getBoundingClientRect().top + window.pageYOffset - headerOffset;

  window.scrollTo({
    top: Math.max(targetTop, 0),
    behavior: "auto",
  });
}

anchorLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const href = link.getAttribute("href");
    const targetId = href?.startsWith("index.html#") ? href.replace("index.html", "") : href;

    if (!targetId || targetId === "#") {
      return;
    }

    const solution = link.dataset.interestLink;
    const solutionField = document.querySelector("#interestSolution");

    if (solution && solutionField) {
      solutionField.value = solution;
    }

    event.preventDefault();
    history.pushState(null, "", targetId);
    scrollToSection(targetId);
  });
});

window.addEventListener("load", () => {
  if (window.location.hash) {
    requestAnimationFrame(() => scrollToSection(window.location.hash));
    [160, 520, 980].forEach((delay) => {
      window.setTimeout(() => scrollToSection(window.location.hash), delay);
    });
  }
});

const interestForm = document.querySelector("#interestForm");
const interestStatus = document.querySelector("#interestStatus");
const solutionFromUrl = new URLSearchParams(window.location.search).get("solucao");

if (solutionFromUrl) {
  const solutionField = document.querySelector("#interestSolution");

  if (solutionField) {
    solutionField.value = solutionFromUrl;
  }
}

function formValue(formData, key) {
  return String(formData.get(key) || "").trim();
}

interestForm?.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(interestForm);
  const name = formValue(formData, "name");
  const company = formValue(formData, "company");
  const contact = formValue(formData, "contact");
  const solution = formValue(formData, "solution");
  const message = formValue(formData, "message");

  const subject = `Interesse comercial - ${solution || "Operia Lab"}`;
  const body = [
    "Olá, Operia Lab.",
    "",
    "Tenho interesse em conversar sobre uma solução.",
    "",
    `Nome: ${name}`,
    `Empresa: ${company || "Não informado"}`,
    `Contato de retorno: ${contact}`,
    `Solução de interesse: ${solution || "Não informado"}`,
    "",
    "Contexto:",
    message || "Não informado",
  ].join("\n");

  window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  if (interestStatus) {
    interestStatus.textContent = "Mensagem preparada. Se o e-mail não abrir, revise o contato configurado no navegador.";
  }
});
