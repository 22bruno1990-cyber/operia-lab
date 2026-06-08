const maxPhotos = 5;
let beforePhotos = [];
let afterPhotos = [];
let currentAnalysis = null;

const photoGrid = document.querySelector("#photoGrid");
const afterGrid = document.querySelector("#afterGrid");
const photoInput = document.querySelector("#photoInput");
const afterInput = document.querySelector("#afterInput");
const caseStatus = document.querySelector("#caseStatus");
const providerQuoteInput = document.querySelector("#providerQuoteInput");
const laborQuoteInput = document.querySelector("#laborQuoteInput");
const providerNameInput = document.querySelector("#providerNameInput");
const providerDeadlineInput = document.querySelector("#providerDeadlineInput");
const analyzeButton = document.querySelector("#analyzeButton");
const ordersStorageKey = "zeladorIaOrders";
const propertiesStorageKey = "zeladorIaProperties";
const selectedPropertyStorageKey = "zeladorIaSelectedProperty";
const propertySelect = document.querySelector("#propertySelect");
const newPropertyInput = document.querySelector("#newPropertyInput");
let serviceOrders = loadOrders();
let properties = loadProperties();
let selectedPropertyId = localStorage.getItem(selectedPropertyStorageKey) || properties[0].id;

const categoryProfiles = {
  hidraulica: {
    title: "Suspeita de vazamento, infiltração ou falha hidráulica",
    technical: "Os sinais descritos indicam possível passagem de água fora do ponto previsto, falha de vedação, rejunte comprometido ou tubulação com microvazamento. A prioridade é isolar a origem antes de tratar acabamento.",
    pro: "Encanador + manutenção civil",
    crew: "1 a 2 profissionais",
    duration: "2 a 6 horas",
    cost: "R$ 250 - R$ 900",
    costMin: 250,
    costMax: 900,
    deadline: "24h a 48h",
    actions: ["Verificar registro, sifão, caixa acoplada, tubulação aparente e pontos vizinhos.", "Secar a área e demarcar a mancha para medir evolução.", "Se houver água ativa, interditar parcialmente e acionar manutenção no mesmo dia."],
    materials: ["Vedante/veda rosca", "Sifão ou flexível", "Rejunte", "Massa corrida", "Tinta antimofo", "Lona de proteção"],
    scope: ["Identificar origem da umidade", "Interromper vazamento ativo", "Trocar componente danificado", "Secar e tratar área afetada", "Refazer acabamento somente após teste"],
    checks: ["Sem gotejamento visível", "Mancha não aumentou em 48h", "Área seca ao toque", "Acabamento recomposto"]
  },
  eletrica: {
    title: "Risco elétrico ou mau contato em componente",
    technical: "A ocorrência pode envolver aquecimento, curto intermitente, conexão frouxa, umidade próxima a ponto energizado ou componente em fim de vida. Não é adequado testar manualmente sem desligamento e profissional habilitado.",
    pro: "Eletricista predial",
    crew: "1 profissional",
    duration: "1 a 4 horas",
    cost: "R$ 180 - R$ 650",
    costMin: 180,
    costMax: 650,
    deadline: "Imediato a 24h",
    actions: ["Sinalizar a área e evitar uso do ponto afetado.", "Verificar disjuntor, carga conectada, aquecimento, odor e histórico de queda.", "Solicitar teste com multímetro e reaperto/substituição do componente."],
    materials: ["Tomada/interruptor", "Conector elétrico", "Fita isolante", "Espelho de acabamento", "Disjuntor compatível", "Caixa 4x2 se necessário"],
    scope: ["Desenergizar circuito", "Testar tensão e carga", "Identificar mau contato", "Substituir componente comprometido", "Registrar teste final"],
    checks: ["Sem cheiro de queimado", "Sem aquecimento", "Disjuntor estável", "Ponto testado pelo eletricista"]
  },
  civil: {
    title: "Patologia civil em parede, piso, teto ou acabamento",
    technical: "Os sintomas sugerem desgaste de acabamento, fissura, desplacamento, umidade residual ou movimentação localizada. A análise deve separar risco estrutural de reparo estético ou corretivo simples.",
    pro: "Manutenção predial ou pedreiro",
    crew: "1 a 2 profissionais",
    duration: "3 a 8 horas",
    cost: "R$ 300 - R$ 1.200",
    costMin: 300,
    costMax: 1200,
    deadline: "48h a 7 dias",
    actions: ["Medir extensão da fissura ou dano e registrar ponto exato.", "Verificar se há som cavo, partes soltas ou risco de queda.", "Executar reparo apenas depois de eliminar causa de umidade ou impacto."],
    materials: ["Argamassa", "Massa acrílica", "Lixa", "Selador", "Tinta", "Rejunte ou porcelanato se aplicável"],
    scope: ["Remover partes soltas", "Tratar base", "Regularizar superfície", "Aplicar acabamento", "Conferir aderência e nivelamento"],
    checks: ["Sem partes soltas", "Trinca estabilizada", "Superfície nivelada", "Pintura/acabamento regular"]
  },
  climatizacao: {
    title: "Falha ou baixo desempenho de climatização",
    technical: "Pode haver filtro saturado, dreno obstruído, vazamento de condensado, falha de ventilação ou necessidade de limpeza técnica. Quando há água aparente, o dreno deve ser priorizado.",
    pro: "Técnico de ar-condicionado",
    crew: "1 a 2 profissionais",
    duration: "1 a 3 horas",
    cost: "R$ 220 - R$ 850",
    costMin: 220,
    costMax: 850,
    deadline: "24h a 72h",
    actions: ["Checar filtro, dreno, serpentina e bandeja de condensado.", "Registrar se há ruído, gotejamento, mau cheiro ou baixa refrigeração.", "Programar limpeza preventiva se o equipamento estiver sem manutenção recente."],
    materials: ["Produto bactericida", "Mangueira de dreno", "Bandeja ou conexão", "Filtro", "Isolamento térmico", "Suporte/abraçadeira"],
    scope: ["Limpar filtros", "Desobstruir dreno", "Testar vazão", "Verificar serpentina", "Medir desempenho após manutenção"],
    checks: ["Sem gotejamento", "Ar saindo com fluxo normal", "Sem odor", "Dreno testado"]
  },
  limpeza: {
    title: "Necessidade de limpeza técnica ou controle de contaminação",
    technical: "A situação aparenta exigir limpeza corretiva, remoção de resíduo, tratamento de odor, mofo superficial ou higienização de área comum. Se houver origem hidráulica, a limpeza deve vir depois do reparo.",
    pro: "Equipe de limpeza ou conservação",
    crew: "1 a 2 profissionais",
    duration: "30 min a 2 horas",
    cost: "R$ 80 - R$ 350",
    costMin: 80,
    costMax: 350,
    deadline: "Mesmo dia a 24h",
    actions: ["Isolar área se houver piso escorregadio ou material biológico.", "Usar produto adequado para o tipo de superfície.", "Registrar antes/depois para comprovar saneamento."],
    materials: ["Desinfetante", "Removedor específico", "Panos descartáveis", "EPI", "Saco de descarte", "Sinalização de piso molhado"],
    scope: ["Isolar área", "Remover resíduo", "Higienizar superfície", "Neutralizar odor", "Liberar circulação após secagem"],
    checks: ["Área seca", "Sem odor", "Sem resíduo aparente", "Piso liberado para circulação"]
  },
  seguranca: {
    title: "Risco operacional ou de segurança no andar",
    technical: "A ocorrência pode gerar queda, corte, bloqueio de passagem, acesso indevido ou comprometimento de rota. A prioridade é reduzir risco imediatamente enquanto o reparo definitivo é acionado.",
    pro: "Manutenção predial ou segurança patrimonial",
    crew: "1 a 2 profissionais",
    duration: "30 min a 4 horas",
    cost: "R$ 120 - R$ 700",
    costMin: 120,
    costMax: 700,
    deadline: "Imediato",
    actions: ["Sinalizar e, se necessário, isolar a área.", "Remover obstáculo ou bloquear uso do item até manutenção.", "Registrar comunicação ao responsável pelo andar."],
    materials: ["Fita zebrada", "Cone", "Parafusos/buchas", "Fechadura ou mola", "Placa de sinalização", "Peça de reposição"],
    scope: ["Isolar risco imediato", "Identificar item causador", "Reparar ou substituir componente", "Testar uso seguro", "Registrar liberação da área"],
    checks: ["Área sinalizada", "Risco removido", "Circulação liberada", "Responsável notificado"]
  }
};

const scenarios = {
  umidade: {
    location: "Banheiro masculino - 7o andar",
    category: "hidraulica",
    urgency: "alta",
    description: "Mancha escura no teto perto da luminaria, cheiro de umidade e pintura com bolha. Parece que aumentou desde ontem."
  },
  eletrica: {
    location: "Corredor central - 7o andar",
    category: "eletrica",
    urgency: "critica",
    description: "Tomada com cheiro de queimado, espelho escurecido e usuario relatou aquecimento ao conectar equipamento."
  },
  ar: {
    location: "Sala de reuniao - 7o andar",
    category: "climatizacao",
    urgency: "normal",
    description: "Ar-condicionado pingando perto da evaporadora, sala com mau cheiro leve e refrigeracao mais fraca que o normal."
  }
};

function drawDemoPhoto(kind, index) {
  const canvas = document.createElement("canvas");
  canvas.width = 900;
  canvas.height = 900;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#d8ddd7";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#f4f1e8";
  ctx.fillRect(90, 90, 720, 720);
  ctx.strokeStyle = "#c7cfc6";
  ctx.lineWidth = 10;
  ctx.strokeRect(90, 90, 720, 720);

  if (kind === "umidade") {
    ctx.fillStyle = "#ebe6d8";
    ctx.fillRect(90, 90, 720, 210);
    ctx.fillStyle = "rgba(93, 80, 57, 0.32)";
    ctx.beginPath();
    ctx.ellipse(470, 220, 190 + index * 22, 72 + index * 10, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(47, 76, 63, 0.18)";
    ctx.beginPath();
    ctx.ellipse(520, 258, 100, 38, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#e5dfd0";
    ctx.fillRect(105, 315, 690, 480);
    ctx.fillStyle = "rgba(156, 100, 23, 0.15)";
    ctx.fillRect(110, 325, 680, 85);
  }

  if (kind === "eletrica") {
    ctx.fillStyle = "#f6f5ef";
    ctx.fillRect(90, 90, 720, 720);
    ctx.fillStyle = "#e9ece8";
    ctx.fillRect(330, 310, 240, 240);
    ctx.strokeStyle = "#bcc5be";
    ctx.lineWidth = 8;
    ctx.strokeRect(330, 310, 240, 240);
    ctx.fillStyle = "#272c28";
    ctx.fillRect(405, 390, 32, 88);
    ctx.fillRect(465, 390, 32, 88);
    ctx.fillStyle = "rgba(79, 47, 29, 0.32)";
    ctx.beginPath();
    ctx.ellipse(462, 355, 115 + index * 8, 55, 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#c53f32";
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.moveTo(510, 555);
    ctx.lineTo(610, 690);
    ctx.stroke();
  }

  if (kind === "ar") {
    ctx.fillStyle = "#eef2f3";
    ctx.fillRect(130, 150, 640, 210);
    ctx.strokeStyle = "#b9c4c8";
    ctx.lineWidth = 8;
    ctx.strokeRect(130, 150, 640, 210);
    ctx.fillStyle = "#d7e0e4";
    ctx.fillRect(160, 300, 580, 32);
    ctx.fillStyle = "rgba(39, 93, 141, 0.18)";
    ctx.beginPath();
    ctx.ellipse(520, 420 + index * 18, 44, 88, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(39, 93, 141, 0.45)";
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(520, 350);
    ctx.bezierCurveTo(530, 430, 500, 520, 526, 610);
    ctx.stroke();
    ctx.fillStyle = "#dfe7e0";
    ctx.fillRect(90, 650, 720, 160);
  }

  ctx.fillStyle = "rgba(23, 33, 27, 0.72)";
  ctx.fillRect(0, 810, 900, 90);
  ctx.fillStyle = "#ffffff";
  ctx.font = "700 30px system-ui, sans-serif";
  const label = kind === "umidade" ? "Evidência demo: umidade" : kind === "eletrica" ? "Evidência demo: elétrica" : "Evidência demo: ar-condicionado";
  ctx.fillText(label, 34, 865);

  return canvas.toDataURL("image/png");
}

function createDemoPhotos(kind) {
  return [0, 1, 2].map((item) => {
    const dataUrl = drawDemoPhoto(kind, item);
    return {
      name: `${kind}-demo-${item + 1}.png`,
      url: dataUrl,
      dataUrl
    };
  });
}

function renderSlots() {
  photoGrid.innerHTML = "";
  for (let index = 0; index < maxPhotos; index += 1) {
    const slot = document.createElement("div");
    slot.className = "photo-slot";
    if (beforePhotos[index]) {
      const image = document.createElement("img");
      image.src = beforePhotos[index].url;
      image.alt = `Foto ${index + 1}`;
      slot.appendChild(image);
    } else {
      slot.textContent = `Foto ${index + 1}`;
    }
    photoGrid.appendChild(slot);
  }
}

function renderAfterPhotos() {
  afterGrid.innerHTML = "";
  afterPhotos.forEach((photo, index) => {
    const shot = document.createElement("div");
    shot.className = "after-shot";
    const image = document.createElement("img");
    image.src = photo.url;
    image.alt = `Depois ${index + 1}`;
    shot.appendChild(image);
    afterGrid.appendChild(shot);
  });
}

function renderEvidenceGrid() {
  const grid = document.querySelector("#evidenceGrid");
  if (!grid) return;
  grid.innerHTML = "";

  const items = [
    ...beforePhotos.map((photo, index) => ({ ...photo, label: `Antes ${index + 1}` })),
    ...afterPhotos.map((photo, index) => ({ ...photo, label: `Depois ${index + 1}` }))
  ];

  if (!items.length) {
    const empty = document.createElement("div");
    empty.className = "evidence-empty";
    empty.textContent = "Nenhuma foto anexada nesta simulação.";
    grid.appendChild(empty);
    return;
  }

  items.forEach((photo) => {
    const figure = document.createElement("figure");
    figure.className = "evidence-card";
    const image = document.createElement("img");
    image.src = photo.url;
    image.alt = photo.label;
    const caption = document.createElement("figcaption");
    caption.textContent = photo.label;
    figure.appendChild(image);
    figure.appendChild(caption);
    grid.appendChild(figure);
  });
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(reader.result));
    reader.addEventListener("error", reject);
    reader.readAsDataURL(file);
  });
}

function normalizeImageDataUrl(dataUrl) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => {
      const maxSide = 1600;
      const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      const ctx = canvas.getContext("2d");
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.88));
    });
    image.addEventListener("error", () => reject(new Error("Formato de imagem não suportado pelo navegador.")));
    image.src = dataUrl;
  });
}

async function fileToPhoto(file) {
  const originalDataUrl = await readFileAsDataUrl(file);
  const normalizedDataUrl = await normalizeImageDataUrl(originalDataUrl);
  return { name: file.name, url: normalizedDataUrl, dataUrl: normalizedDataUrl };
}

function detectCategory(description, selected) {
  if (selected !== "auto") return selected;
  const text = description.toLowerCase();
  const rules = [
    ["eletrica", ["fio", "tomada", "luz", "lampada", "disjuntor", "queimado", "choque", "curto"]],
    ["hidraulica", ["agua", "vazamento", "goteira", "umidade", "infiltração", "cano", "sifao", "descarga"]],
    ["climatizacao", ["ar", "condicionado", "dreno", "frio", "calor", "evaporadora", "split"]],
    ["seguranca", ["risco", "queda", "porta", "fechadura", "vidro", "rota", "escada", "solto"]],
    ["limpeza", ["odor", "cheiro", "sujeira", "mofo", "lixo", "residuo", "mancha"]],
    ["civil", ["trinca", "rachadura", "piso", "parede", "teto", "azulejo", "pintura", "rejunte"]]
  ];
  const match = rules.find(([, words]) => words.some((word) => text.includes(word)));
  return match ? match[0] : "civil";
}

function calculateSeverity(category, urgency, description) {
  const text = description.toLowerCase();
  const criticalWords = ["choque", "fumaca", "queimado", "vazando muito", "alagado", "queda", "vidro quebrado", "curto"];
  const highWords = ["goteira", "infiltração", "solto", "cheiro", "mofo", "aquecendo", "barulho"];
  if (urgency === "critica" || criticalWords.some((word) => text.includes(word))) return "Critica";
  if (urgency === "alta" || category === "eletrica" || category === "seguranca" || highWords.some((word) => text.includes(word))) return "Alta";
  return "Media";
}

function defaultDeadlineBySeverity(severity, category) {
  if (severity === "Critica") return "Imediato a 24h";
  if (severity === "Alta") return category === "eletrica" || category === "seguranca" ? "Imediato a 24h" : "24h a 48h";
  return "2 a 5 dias úteis";
}

function sanitizeDeadline(deadline, severity, category) {
  const value = String(deadline || "").trim();
  const hasCalendarDate = /\b20\d{2}\b|\d{1,2}[/-]\d{1,2}[/-]\d{2,4}/.test(value);
  if (!value || hasCalendarDate) return defaultDeadlineBySeverity(severity, category);
  return value;
}

function buildAnalysis(aiReport) {
  const description = document.querySelector("#descriptionInput").value.trim();
  const selectedCategory = document.querySelector("#categoryInput").value;
  const urgency = document.querySelector("#urgencyInput").value;
  const category = aiReport?.category || detectCategory(description, selectedCategory);
  const profile = categoryProfiles[category] || categoryProfiles.civil;
  const severity = aiReport?.severity || calculateSeverity(category, urgency, description);
  return {
    ...profile,
    ...(aiReport || {}),
    category,
    severity,
    deadline: sanitizeDeadline(aiReport?.deadline || profile.deadline, severity, category),
    cost: aiReport?.cost || profile.cost,
    costMin: aiReport?.costMin || profile.costMin,
    costMax: aiReport?.costMax || profile.costMax,
    reportId: `ZIA-${Date.now().toString().slice(-6)}`,
    reportDate: new Date().toLocaleDateString("pt-BR"),
    location: document.querySelector("#locationInput").value.trim() || "Local não informado",
    evidenceCount: beforePhotos.length
  };
}

function fillList(target, items) {
  target.innerHTML = "";
  items.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    target.appendChild(li);
  });
}

function fillChecklist(target, items) {
  target.innerHTML = "";
  items.forEach((item) => {
    const label = document.createElement("label");
    label.className = "check-item";
    label.innerHTML = `<input type="checkbox"><span>${item}</span>`;
    target.appendChild(label);
  });
}

function fillTags(target, items) {
  target.innerHTML = "";
  items.forEach((item) => {
    const tag = document.createElement("span");
    tag.textContent = item;
    target.appendChild(tag);
  });
}

function fillScope(target, items) {
  target.innerHTML = "";
  items.forEach((item, index) => {
    const row = document.createElement("div");
    row.className = "scope-item";
    row.innerHTML = `<strong>${index + 1}</strong><span>${item}</span>`;
    target.appendChild(row);
  });
}

function currency(value) {
  return Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function loadOrders() {
  try {
    return JSON.parse(localStorage.getItem(ordersStorageKey) || "[]");
  } catch {
    return [];
  }
}

function loadProperties() {
  try {
    const saved = JSON.parse(localStorage.getItem(propertiesStorageKey) || "[]");
    if (saved.length) return saved;
  } catch {
    // Use defaults below when local storage is empty or invalid.
  }
  return [
    { id: "prop-matriz", name: "Edifício Matriz" },
    { id: "prop-anexo", name: "Prédio Anexo" },
    { id: "prop-galpao", name: "Galpão Operacional" }
  ];
}

function persistOrders() {
  localStorage.setItem(ordersStorageKey, JSON.stringify(serviceOrders));
}

function persistProperties() {
  localStorage.setItem(propertiesStorageKey, JSON.stringify(properties));
  localStorage.setItem(selectedPropertyStorageKey, selectedPropertyId);
}

function selectedProperty() {
  return properties.find((property) => property.id === selectedPropertyId) || properties[0];
}

function renderPropertySelector() {
  if (!propertySelect) return;
  propertySelect.innerHTML = "";
  properties.forEach((property) => {
    const option = document.createElement("option");
    option.value = property.id;
    option.textContent = property.name;
    propertySelect.appendChild(option);
  });
  if (!properties.some((property) => property.id === selectedPropertyId)) selectedPropertyId = properties[0].id;
  propertySelect.value = selectedPropertyId;
  document.querySelector("#activePropertyName").textContent = selectedProperty().name;
}

function addProperty() {
  const name = newPropertyInput.value.trim();
  if (!name) return;
  const id = `prop-${Date.now().toString(36)}`;
  properties.push({ id, name });
  selectedPropertyId = id;
  newPropertyInput.value = "";
  persistProperties();
  renderPropertySelector();
  renderOrders();
}

function statusLabel(status) {
  const labels = {
    aberta: "Aberta",
    em_execucao: "Em execução",
    pendente: "Pendente",
    resolvida: "Resolvida"
  };
  return labels[status] || "Aberta";
}

function severityLabel(severity) {
  return severity === "Critica" ? "Crítica" : severity;
}

function categoryLabel(category) {
  const labels = {
    hidraulica: "Hidráulica",
    eletrica: "Elétrica",
    civil: "Civil",
    climatizacao: "Climatização",
    limpeza: "Limpeza",
    seguranca: "Segurança"
  };
  return labels[category] || category || "Geral";
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function switchTab(tabName) {
  document.querySelectorAll(".tab-button").forEach((button) => {
    button.classList.toggle("active", button.dataset.tab === tabName);
  });
  document.querySelectorAll(".tab-page").forEach((page) => {
    page.classList.toggle("active", page.id === `${tabName}Page`);
  });
  if (tabName === "acompanhamento") renderOrders();
}

function createOrderFromCurrentReport() {
  if (!currentAnalysis) return null;
  const property = selectedProperty();
  return {
    id: currentAnalysis.reportId,
    propertyId: property.id,
    propertyName: property.name,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: "aberta",
    title: currentAnalysis.title,
    location: currentAnalysis.location,
    category: currentAnalysis.category,
    severity: currentAnalysis.severity,
    deadline: currentAnalysis.deadline,
    cost: currentAnalysis.cost,
    pro: currentAnalysis.pro,
    duration: currentAnalysis.duration,
    provider: providerNameInput.value.trim(),
    providerDeadline: providerDeadlineInput.value.trim(),
    providerQuote: providerQuoteInput.value ? currency(providerQuoteInput.value) : "",
    laborQuote: laborQuoteInput.value ? currency(laborQuoteInput.value) : "",
    summary: buildSupplierSummary(),
    note: "OS criada a partir do pré-laudo.",
    beforeCount: beforePhotos.length,
    afterCount: afterPhotos.length
  };
}

function saveCurrentOrder() {
  const order = createOrderFromCurrentReport();
  if (!order) return;
  const existingIndex = serviceOrders.findIndex((item) => item.id === order.id);
  if (existingIndex >= 0) {
    serviceOrders[existingIndex] = { ...serviceOrders[existingIndex], ...order, updatedAt: new Date().toISOString() };
  } else {
    serviceOrders.unshift(order);
  }
  persistOrders();
  renderOrders();
  document.querySelector("#saveOrderButton").textContent = "OS salva";
  setTimeout(() => {
    document.querySelector("#saveOrderButton").textContent = "Salvar OS";
  }, 1400);
}

function updateOrderStatus(id, status) {
  serviceOrders = serviceOrders.map((order) => {
    if (order.id !== id) return order;
    return {
      ...order,
      status,
      updatedAt: new Date().toISOString(),
      note: status === "resolvida" ? "Resolvida e encerrada." : status === "pendente" ? "Pendente de correção/validação." : status === "em_execucao" ? "Serviço em execução." : "Ordem aberta."
    };
  });
  persistOrders();
  renderOrders();
}

function deleteOrder(id) {
  serviceOrders = serviceOrders.filter((order) => order.id !== id);
  persistOrders();
  renderOrders();
}

function orderMatchesFilters(order) {
  const categoryFilter = document.querySelector("#historyCategoryFilter")?.value || "all";
  const statusFilter = document.querySelector("#historyStatusFilter")?.value || "all";
  const propertyMatches = (order.propertyId || "prop-matriz") === selectedPropertyId;
  return propertyMatches && (categoryFilter === "all" || order.category === categoryFilter) && (statusFilter === "all" || order.status === statusFilter);
}

function updateOrderStats() {
  const propertyOrders = serviceOrders.filter((order) => (order.propertyId || "prop-matriz") === selectedPropertyId);
  const total = propertyOrders.length;
  const open = propertyOrders.filter((order) => order.status === "aberta" || order.status === "em_execucao").length;
  const pending = propertyOrders.filter((order) => order.status === "pendente").length;
  const resolved = propertyOrders.filter((order) => order.status === "resolvida").length;
  document.querySelector("#totalOrdersText").textContent = total;
  document.querySelector("#openOrdersText").textContent = open;
  document.querySelector("#pendingOrdersText").textContent = pending;
  document.querySelector("#resolvedOrdersText").textContent = resolved;
}

function renderOrders() {
  const list = document.querySelector("#ordersList");
  const empty = document.querySelector("#historyEmpty");
  if (!list || !empty) return;
  updateOrderStats();
  list.innerHTML = "";
  const visibleOrders = serviceOrders.filter(orderMatchesFilters);
  empty.classList.toggle("hidden", visibleOrders.length > 0);

  visibleOrders.forEach((order) => {
    const card = document.createElement("article");
    card.className = "order-card";
    card.innerHTML = `
      <div class="order-head">
        <div>
          <h3>${escapeHtml(order.id)} - ${escapeHtml(order.title)}</h3>
          <p>${escapeHtml(order.propertyName || selectedProperty().name)} | ${escapeHtml(order.location)} | ${escapeHtml(categoryLabel(order.category))} | Atualizado em ${new Date(order.updatedAt).toLocaleDateString("pt-BR")}</p>
        </div>
        <span class="status-badge status-${escapeHtml(order.status)}">${escapeHtml(statusLabel(order.status))}</span>
      </div>
      <div class="order-meta">
        <div><span>Criticidade</span><strong>${escapeHtml(severityLabel(order.severity))}</strong></div>
        <div><span>Prazo</span><strong>${escapeHtml(order.deadline)}</strong></div>
        <div><span>Custo base</span><strong>${escapeHtml(order.cost)}</strong></div>
        <div><span>Profissional</span><strong>${escapeHtml(order.pro)}</strong></div>
        <div><span>Fornecedor</span><strong>${escapeHtml(order.provider || "Não informado")}</strong></div>
      </div>
      <div class="order-notes">
        <label class="field compact-field">
          <span>Fim da OS / observação</span>
          <textarea rows="2" data-note="${escapeHtml(order.id)}" placeholder="Ex: prestador executou reparo, falta pintura, aguardando peça...">${escapeHtml(order.note || "")}</textarea>
        </label>
      </div>
      <div class="order-actions">
        <button class="secondary-button" type="button" data-status="em_execucao" data-order="${escapeHtml(order.id)}">Em execução</button>
        <button class="secondary-button" type="button" data-status="pendente" data-order="${escapeHtml(order.id)}">Marcar pendente</button>
        <button class="primary-button" type="button" data-status="resolvida" data-order="${escapeHtml(order.id)}">Encerrar resolvida</button>
        <button class="danger-button" type="button" data-delete="${escapeHtml(order.id)}">Excluir OS</button>
      </div>
    `;
    list.appendChild(card);
  });

  list.querySelectorAll("[data-status]").forEach((button) => {
    button.addEventListener("click", () => updateOrderStatus(button.dataset.order, button.dataset.status));
  });
  list.querySelectorAll("[data-delete]").forEach((button) => {
    button.addEventListener("click", () => deleteOrder(button.dataset.delete));
  });
  list.querySelectorAll("[data-note]").forEach((textarea) => {
    textarea.addEventListener("change", () => {
      serviceOrders = serviceOrders.map((order) => order.id === textarea.dataset.note ? { ...order, note: textarea.value, updatedAt: new Date().toISOString() } : order);
      persistOrders();
      renderOrders();
    });
  });
}

function updateQuoteComparison() {
  if (!currentAnalysis) return;
  const providerQuote = Number(providerQuoteInput.value || 0);
  const laborQuote = Number(laborQuoteInput.value || 0);
  const quoteResult = document.querySelector("#quoteResult");
  const referenceMid = (currentAnalysis.costMin + currentAnalysis.costMax) / 2;

  if (!providerQuote && !laborQuote) {
    quoteResult.textContent = "Informe valores para comparar com a pesquisa média.";
    quoteResult.className = "quote-result";
    return;
  }

  const total = providerQuote || laborQuote;
  const delta = total - referenceMid;
  const percent = Math.round((delta / referenceMid) * 100);
  const laborText = laborQuote ? ` Mão de obra informada: ${currency(laborQuote)}.` : "";

  if (total > currentAnalysis.costMax) {
    quoteResult.textContent = `Proposta acima da faixa de referência em aproximadamente ${Math.abs(percent)}%. Vale pedir detalhamento de materiais, deslocamento, garantia e prazo.${laborText}`;
    quoteResult.className = "quote-result alert";
    return;
  }

  if (total < currentAnalysis.costMin) {
    quoteResult.textContent = `Proposta abaixo da faixa média. Pode ser boa oportunidade, mas confirme se inclui material, acabamento, garantia e limpeza final.${laborText}`;
    quoteResult.className = "quote-result attention";
    return;
  }

  quoteResult.textContent = `Proposta dentro da faixa de pesquisa. Use o checklist para confirmar se o escopo está completo.${laborText}`;
  quoteResult.className = "quote-result ok";
}

function buildSupplierSummary() {
  if (!currentAnalysis) return "";
  const property = selectedProperty();
  const provider = providerNameInput.value.trim();
  const providerDeadline = providerDeadlineInput.value.trim();
  const providerQuote = providerQuoteInput.value ? currency(providerQuoteInput.value) : "";
  const laborQuote = laborQuoteInput.value ? currency(laborQuoteInput.value) : "";
  const providerText = provider ? ` Prestador consultado: ${provider}.` : "";
  const deadlineText = providerDeadline ? ` Prazo informado pelo prestador: ${providerDeadline}.` : "";
  const quoteText = providerQuote ? ` Proposta informada: ${providerQuote}.` : "";
  const laborText = laborQuote ? ` Mão de obra informada: ${laborQuote}.` : "";
  return `Pré-laudo Zelador.ia ${currentAnalysis.reportId} - ${property.name} - ${currentAnalysis.location}. Tecnologia Operia Lab. Emissão: ${currentAnalysis.reportDate}. Problema provável: ${currentAnalysis.title}. Criticidade: ${severityLabel(currentAnalysis.severity)}. Profissional indicado: ${currentAnalysis.pro}. Prazo sugerido: ${currentAnalysis.deadline}. Referência de custo pesquisada: ${currentAnalysis.cost}.${providerText}${deadlineText}${quoteText}${laborText} Materiais prováveis: ${currentAnalysis.materials.join(", ")}. Escopo sugerido: ${currentAnalysis.scope.join("; ")}. Evidências anexadas: ${beforePhotos.length + afterPhotos.length} foto(s).`;
}

async function requestAiAnalysis() {
  if (!beforePhotos.length) return null;

  const payload = {
    location: document.querySelector("#locationInput").value.trim(),
    category: document.querySelector("#categoryInput").value,
    urgency: document.querySelector("#urgencyInput").value,
    description: document.querySelector("#descriptionInput").value.trim(),
    images: beforePhotos.map((photo) => ({ name: photo.name, dataUrl: photo.dataUrl }))
  };

  const response = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({}));
    throw new Error(errorPayload.error || "Análise visual indisponível.");
  }

  const result = await response.json();
  return result.report;
}

function setAnalyzeLoading(isLoading) {
  analyzeButton.disabled = isLoading;
  analyzeButton.textContent = isLoading ? "Analisando fotos..." : "Gerar pré-laudo";
}

function renderReport(aiReport, source = "demo") {
  currentAnalysis = buildAnalysis(aiReport);
  document.querySelector("#emptyStaté").classList.add("hidden");
  document.querySelector("#report").classList.remove("hidden");
  const sourceBanner = document.querySelector("#sourceBanner");
  sourceBanner.textContent = source === "openai" ? "Origem: IA visual aplicada nas fotos" : "Origem: demo local / exemplo sem análise visual";
  sourceBanner.className = source === "openai" ? "source-banner ai-source" : "source-banner demo-source";
  document.querySelector("#problemTitle").textContent = currentAnalysis.title;
  document.querySelector("#technicalText").textContent = currentAnalysis.technical;
  document.querySelector("#reportIdText").textContent = currentAnalysis.reportId;
  document.querySelector("#reportLocationText").textContent = currentAnalysis.location;
  document.querySelector("#reportDateText").textContent = currentAnalysis.reportDate;
  document.querySelector("#severityText").textContent = severityLabel(currentAnalysis.severity);
  document.querySelector("#deadlineText").textContent = currentAnalysis.deadline;
  document.querySelector("#costText").textContent = currentAnalysis.cost;
  document.querySelector("#proText").textContent = currentAnalysis.pro;
  document.querySelector("#crewText").textContent = currentAnalysis.crew;
  document.querySelector("#durationText").textContent = currentAnalysis.duration;
  document.querySelector("#statusText").textContent = "Aberto";
  caseStatus.textContent = `Chamado aberto: ${currentAnalysis.location}`;
  fillList(document.querySelector("#actionsList"), currentAnalysis.actions);
  fillTags(document.querySelector("#materialsList"), currentAnalysis.materials);
  fillScope(document.querySelector("#scopeList"), currentAnalysis.scope);
  fillChecklist(document.querySelector("#checklist"), currentAnalysis.checks);
  const sourceLabel = source === "openai" ? "Análise visual por IA aplicada sobre as fotos." : "Demo usando descrição/categoria como fallback até configurar a API.";
  document.querySelector("#priceNote").textContent = `Pesquisa média para referência: ${currentAnalysis.cost}. ${sourceLabel} Use isso como base para conversar com o prestador, sem substituir vistoria técnica.`;
  document.querySelector("#supplierSummary").textContent = buildSupplierSummary();
  renderEvidenceGrid();
  updateQuoteComparison();

  const strip = document.querySelector("#riskStrip");
  strip.classList.toggle("critical", currentAnalysis.severity === "Critica");
  strip.classList.toggle("high", currentAnalysis.severity === "Alta");
}

async function handleAnalyze() {
  setAnalyzeLoading(true);
  try {
    const aiReport = await requestAiAnalysis();
    renderReport(aiReport, aiReport ? "openai" : "demo");
  } catch (error) {
    renderReport(null, "demo");
    document.querySelector("#quoteResult").textContent = `${error.message} O pré-laudo abaixo foi gerado pela lógica demo local.`;
    document.querySelector("#quoteResult").className = "quote-result attention";
  } finally {
    setAnalyzeLoading(false);
  }
}

function evaluateClosure() {
  const checked = [...document.querySelectorAll(".check-item input")].filter((item) => item.checked).length;
  const total = currentAnalysis?.checks.length || 1;
  const ratio = checked / total;
  const hasAfter = afterPhotos.length > 0;
  const closure = document.querySelector("#closureBox");
  closure.classList.remove("hidden");

  if (!hasAfter) {
    closure.textContent = "Ainda falta evidência pós-serviço. Adicione fotos depois da execução para validar o encerramento.";
    return;
  }

  if (ratio >= 0.75) {
    closure.textContent = "Status sugerido: sanado. Há fotos pós-serviço e a maior parte do checklist foi confirmada dentro do fluxo.";
    document.querySelector("#statusText").textContent = "Sanado";
    caseStatus.textContent = "Chamado sanado";
    renderEvidenceGrid();
    return;
  }

  if (ratio >= 0.4) {
    closure.textContent = "Status sugerido: parcialmente sanado. Recomenda-se manter o chamado em observação e revalidar no prazo.";
    document.querySelector("#statusText").textContent = "Parcial";
    caseStatus.textContent = "Validação parcial";
    renderEvidenceGrid();
    return;
  }

  closure.textContent = "Status sugerido: não sanado. As evidências ainda não sustentam encerramento do chamado.";
  document.querySelector("#statusText").textContent = "Não sanado";
  caseStatus.textContent = "Pendência ativa";
  renderEvidenceGrid();
}

document.querySelector("#photoButton").addEventListener("click", () => photoInput.click());
document.querySelector("#afterButton").addEventListener("click", () => afterInput.click());
analyzeButton.addEventListener("click", handleAnalyze);
document.querySelector("#closeButton").addEventListener("click", evaluateClosure);
document.querySelector("#printButton").addEventListener("click", () => window.print());
document.querySelector("#saveOrderButton").addEventListener("click", saveCurrentOrder);
document.querySelector("#copyReportButton").addEventListener("click", async () => {
  const summary = buildSupplierSummary();
  try {
    await navigator.clipboard.writeText(summary);
    document.querySelector("#copyReportButton").textContent = "Copiado";
    setTimeout(() => {
      document.querySelector("#copyReportButton").textContent = "Copiar resumo";
    }, 1400);
  } catch {
    document.querySelector("#supplierSummary").textContent = summary;
  }
});
providerQuoteInput.addEventListener("input", updateQuoteComparison);
laborQuoteInput.addEventListener("input", updateQuoteComparison);
providerNameInput.addEventListener("input", () => {
  if (currentAnalysis) document.querySelector("#supplierSummary").textContent = buildSupplierSummary();
});
providerDeadlineInput.addEventListener("input", () => {
  if (currentAnalysis) document.querySelector("#supplierSummary").textContent = buildSupplierSummary();
});

document.querySelectorAll(".tab-button").forEach((button) => {
  button.addEventListener("click", () => switchTab(button.dataset.tab));
});

document.querySelector("#heroTrackingButton")?.addEventListener("click", () => {
  switchTab("acompanhamento");
  document.querySelector("#acompanhamentoPage")?.scrollIntoView({ behavior: "smooth", block: "start" });
});

document.querySelector("#pricingTrackingButton")?.addEventListener("click", () => {
  switchTab("acompanhamento");
  document.querySelector("#acompanhamentoPage")?.scrollIntoView({ behavior: "smooth", block: "start" });
});

document.querySelector("#historyCategoryFilter")?.addEventListener("change", renderOrders);
document.querySelector("#historyStatusFilter")?.addEventListener("change", renderOrders);
document.querySelector("#showAllOrdersButton")?.addEventListener("click", () => {
  document.querySelector("#historyCategoryFilter").value = "all";
  document.querySelector("#historyStatusFilter").value = "all";
  renderOrders();
});

propertySelect?.addEventListener("change", () => {
  selectedPropertyId = propertySelect.value;
  persistProperties();
  renderPropertySelector();
  renderOrders();
});

document.querySelector("#addPropertyButton")?.addEventListener("click", addProperty);
newPropertyInput?.addEventListener("keydown", (event) => {
  if (event.key === "Enter") addProperty();
});

document.querySelectorAll(".scenario-button").forEach((button) => {
  button.addEventListener("click", () => {
    const scenario = scenarios[button.dataset.scenario];
    document.querySelector("#locationInput").value = scenario.location;
    document.querySelector("#categoryInput").value = scenario.category;
    document.querySelector("#urgencyInput").value = scenario.urgency;
    document.querySelector("#descriptionInput").value = scenario.description;
    beforePhotos = createDemoPhotos(button.dataset.scenario);
    renderSlots();
    renderReport(null, "demo");
  });
});

photoInput.addEventListener("change", async (event) => {
  const files = [...event.target.files].slice(0, maxPhotos - beforePhotos.length);
  const photos = await Promise.all(files.map(fileToPhoto));
  beforePhotos = [...beforePhotos, ...photos].slice(0, maxPhotos);
  renderSlots();
  renderEvidenceGrid();
  photoInput.value = "";
});

afterInput.addEventListener("change", async (event) => {
  const files = [...event.target.files].slice(0, maxPhotos - afterPhotos.length);
  const photos = await Promise.all(files.map(fileToPhoto));
  afterPhotos = [...afterPhotos, ...photos].slice(0, maxPhotos);
  renderAfterPhotos();
  renderEvidenceGrid();
  afterInput.value = "";
});

document.querySelector("#resetButton").addEventListener("click", () => {
  beforePhotos = [];
  afterPhotos = [];
  currentAnalysis = null;
  document.querySelector("#locationInput").value = "";
  document.querySelector("#descriptionInput").value = "";
  document.querySelector("#categoryInput").value = "auto";
  document.querySelector("#urgencyInput").value = "normal";
  providerQuoteInput.value = "";
  laborQuoteInput.value = "";
  providerNameInput.value = "";
  providerDeadlineInput.value = "";
  document.querySelector("#report").classList.add("hidden");
  document.querySelector("#emptyStaté").classList.remove("hidden");
  document.querySelector("#closureBox").classList.add("hidden");
  caseStatus.textContent = "Novo chamado";
  renderSlots();
  renderAfterPhotos();
});

renderSlots();
renderPropertySelector();
renderOrders();
