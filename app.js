const FORM_ENDPOINT = "";
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

interestForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(interestForm);
  const name = formValue(formData, "name");
  const company = formValue(formData, "company");
  const contact = formValue(formData, "contact");
  const solution = formValue(formData, "solution");
  const message = formValue(formData, "message");

  const payload = {
    subject: `Interesse comercial - ${solution || "Operia Lab"}`,
    name,
    company: company || "Não informado",
    contact,
    solution: solution || "Não informado",
    message: message || "Não informado",
    source: "operia-lab-vitrine",
    page: window.location.href,
  };

  if (interestStatus) {
    interestStatus.textContent = "Enviando interesse pelo canal seguro da Operia Lab...";
  }

  if (!FORM_ENDPOINT) {
    if (interestStatus) {
      interestStatus.textContent = "Canal automático em configuração. O formulário já não expõe e-mail; falta conectar o endpoint de recebimento.";
    }

    return;
  }

  try {
    const response = await fetch(FORM_ENDPOINT, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("Falha ao enviar interesse.");
    }

    interestForm.reset();

    if (interestStatus) {
      interestStatus.textContent = "Interesse enviado. A Operia Lab retornará pelo contato informado.";
    }
  } catch (error) {
    if (interestStatus) {
      interestStatus.textContent = "Não foi possível enviar agora. Tente novamente em instantes.";
    }
  }
});
