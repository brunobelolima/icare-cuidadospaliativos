const dialog = document.querySelector("#professionalDialog");
const acceptButton = document.querySelector("#acceptProfessional");
const declineButton = document.querySelector("#declineProfessional");
const cookieBanner = document.querySelector("#cookieBanner");
const acceptCookiesButton = document.querySelector("#acceptCookies");
const declineCookiesButton = document.querySelector("#declineCookies");
const visitCounter = document.querySelector("#visitCounter");
const visitCounterMeta = document.querySelector("#visitCounterMeta");
const tabs = Array.from(document.querySelectorAll(".tab-trigger"));
const panels = Array.from(document.querySelectorAll(".content-panel"));
const visitCounterKey = "icare-abordagem-paliativa-visits-v3";
const visitCounterLastVisitKey = "icare-abordagem-paliativa-last-visit-v3";
const visitCounterSessionKey = "icare-abordagem-paliativa-session-counted-v3";
const visitCounterLegacyKeys = [
  "icare-abordagem-paliativa-visits-v1",
  "icare-abordagem-paliativa-last-visit-v1",
  "icare-abordagem-paliativa-session-counted-v1",
  "icare-abordagem-paliativa-visits-v2",
  "icare-abordagem-paliativa-last-visit-v2",
  "icare-abordagem-paliativa-session-counted-v2",
];
const visitCounterWindowMs = 30 * 60 * 1000;
const cookieConsentKey = "icare-abordagem-paliativa-cookie-consent-v1";
const publicAudienceTabs = new Set(["nao-profissionais", "medicamentos-componente-especializado", "idealizadores", "contato"]);
const opioidSource = document.querySelector("#opioidSource");
const opioidSourceDose = document.querySelector("#opioidSourceDose");
const opioidTarget = document.querySelector("#opioidTarget");
const opioidReduction = document.querySelector("#opioidReduction");
const calculateOpioidConversionButton = document.querySelector("#calculateOpioidConversion");
const opioidConversionResult = document.querySelector("#opioidConversionResult");

const opioidConversionData = {
  "morphine-oral": {
    label: "Morfina oral",
    unit: "mg/24h",
    oralMorphineEquivalentFactor: 1,
  },
  "morphine-parenteral": {
    label: "Morfina SC/IV",
    unit: "mg/24h",
    oralMorphineEquivalentFactor: 3,
  },
  "codeine-oral": {
    label: "Codeína oral",
    unit: "mg/24h",
    oralMorphineEquivalentFactor: 0.15,
  },
  "dihydrocodeine-oral": {
    label: "Di-hidrocodeína oral",
    unit: "mg/24h",
    oralMorphineEquivalentFactor: 0.1,
  },
  "tramadol-oral": {
    label: "Tramadol oral",
    unit: "mg/24h",
    oralMorphineEquivalentFactor: 0.1,
  },
  "tapentadol-oral": {
    label: "Tapentadol oral",
    unit: "mg/24h",
    oralMorphineEquivalentFactor: 0.4,
  },
  "hydrocodone-oral": {
    label: "Hidrocodona oral",
    unit: "mg/24h",
    oralMorphineEquivalentFactor: 1,
  },
  "oxycodone-oral": {
    label: "Oxicodona oral",
    unit: "mg/24h",
    oralMorphineEquivalentFactor: 1.5,
  },
  "oxycodone-parenteral": {
    label: "Oxicodona SC/IV",
    unit: "mg/24h",
    oralMorphineEquivalentFactor: 2,
  },
  "hydromorphone-oral": {
    label: "Hidromorfona oral",
    unit: "mg/24h",
    oralMorphineEquivalentFactor: 4,
  },
  "hydromorphone-parenteral": {
    label: "Hidromorfona SC/IV",
    unit: "mg/24h",
    oralMorphineEquivalentFactor: 20,
  },
  "oxymorphone-oral": {
    label: "Oximorfona oral",
    unit: "mg/24h",
    oralMorphineEquivalentFactor: 2,
  },
  "oxymorphone-parenteral": {
    label: "Oximorfona SC/IV",
    unit: "mg/24h",
    oralMorphineEquivalentFactor: 30,
  },
  "fentanyl-patch": {
    label: "Fentanil transdérmico",
    unit: "mcg/h",
    oralMorphineEquivalentFactor: 2,
    isPatch: true,
  },
};

const publicCeafMedicationList = [
  {
    name: "Morfina",
    aliases: ["morfina", "sulfato de morfina"],
    route: "Geralmente dispensada pela assistência farmacêutica municipal ou serviço de referência, com receita de controle especial/notificação conforme apresentação.",
    documents: "Documento, receita dentro da validade e orientações da farmácia local; pode exigir fluxo próprio para medicamento controlado.",
    forms: "Comprimido ou solução oral; solução injetável para uso em serviço de saúde, conforme apresentação disponível na rede.",
    cids: "Conferir no PCDT, na receita/relatório e na farmácia do SUS, pois os CIDs aceitos variam conforme indicação e fluxo local.",
    pcdt: "Não há PCDT único para uso paliativo geral. Para dor crônica ou dor oncológica, conferir protocolo/diretriz aplicável e fluxo local.",
  },
  {
    name: "Codeína",
    aliases: ["codeina", "codeína", "fosfato de codeina", "fosfato de codeína"],
    route: "Geralmente dispensada conforme fluxo municipal/estadual para medicamento controlado, não necessariamente pelo CEAF.",
    documents: "Receita adequada para medicamento sujeito a controle especial e documentos pessoais; confirmar apresentação disponível.",
    forms: "Comprimido ou solução oral, conforme apresentação disponível na rede.",
    cids: "Conferir no PCDT, na receita/relatório e na farmácia do SUS, pois os CIDs aceitos variam conforme indicação e fluxo local.",
    pcdt: "Conferir PCDT da condição tratada e regra local para opioide controlado.",
  },
  {
    name: "Metadona",
    aliases: ["metadona"],
    route: "Medicamento de uso especializado. A pessoa deve confirmar o fluxo com a equipe de referência e a farmácia estadual ou municipal.",
    documents: "Receita controlada, relatório médico e documentos definidos pelo serviço. Consulte especialista antes de prescrever.",
    forms: "Comprimido ou solução oral, conforme apresentação disponível na rede. Consulte um especialista antes de prescrever.",
    cids: "Conferir no PCDT, na receita/relatório e na farmácia do SUS, pois os CIDs aceitos variam conforme indicação e fluxo local.",
    pcdt: "Conferir PCDT/linha de cuidado da condição tratada e consultar especialista antes de prescrever.",
  },
  {
    name: "Gabapentina",
    aliases: ["gabapentina"],
    route: "Pode depender de protocolo, indicação e fluxo estadual; confirmar se o acesso será pelo CEAF ou por outro componente local.",
    documents: "Receita, relatório ou LME quando solicitado, CID, documentos pessoais e exames/laudos conforme protocolo.",
    forms: "Cápsula ou comprimido, conforme apresentação disponível na rede.",
    cids: "Conferir no PCDT, na receita/relatório e na farmácia do SUS, pois os CIDs aceitos variam conforme indicação e fluxo local.",
    pcdt: "PCDT relacionado no site: Dor Crônica, quando a indicação for dor neuropática ou outra condição contemplada pelo protocolo.",
  },
  {
    name: "Carbamazepina",
    aliases: ["carbamazepina"],
    route: "Frequentemente disponível na assistência farmacêutica do SUS; o local de retirada depende do município/estado e da indicação.",
    documents: "Receita e documentos pessoais; confirmar se há exigência de laudo ou formulário para a indicação específica.",
    forms: "Comprimido e suspensão oral, conforme apresentação disponível na rede.",
    cids: "Conferir no PCDT, na receita/relatório e na farmácia do SUS, pois os CIDs aceitos variam conforme indicação e fluxo local.",
    pcdt: "PCDT relacionado no site: Dor Crônica para neuralgia do trigêmeo ou neuropatia dolorosa, quando aplicável.",
  },
  {
    name: "Amitriptilina",
    aliases: ["amitriptilina"],
    route: "Frequentemente disponível na farmácia básica municipal, conforme lista local.",
    documents: "Receita e documentos pessoais; confirmar disponibilidade e apresentação no município.",
    forms: "Comprimido, conforme apresentação disponível na rede.",
    cids: "Conferir na receita/relatório e na farmácia do SUS, pois pode não seguir fluxo CEAF.",
    pcdt: "Conferir PCDT da condição tratada quando a solicitação não for pela farmácia básica.",
  },
  {
    name: "Nortriptilina",
    aliases: ["nortriptilina"],
    route: "Pode estar disponível conforme lista local ou fluxo estadual. Confirmar na farmácia do SUS.",
    documents: "Receita e documentos pessoais; pode haver necessidade de relatório conforme indicação e apresentação.",
    forms: "Cápsula ou comprimido, conforme apresentação disponível na rede.",
    cids: "Conferir no PCDT, na receita/relatório e na farmácia do SUS, pois os CIDs aceitos variam conforme indicação e fluxo local.",
    pcdt: "Conferir PCDT da condição tratada quando houver solicitação por fluxo estadual ou especializado.",
  },
  {
    name: "Ondansetrona",
    aliases: ["ondansetrona", "ondansetron"],
    route: "Pode depender de protocolo, indicação e apresentação. Confirmar se o acesso local é hospitalar, municipal ou pelo CEAF.",
    documents: "Receita, relatório e documentos pessoais; LME/exames se a farmácia estadual exigir para a indicação.",
    forms: "Comprimido, solução oral ou solução injetável, conforme apresentação disponível na rede.",
    cids: "Conferir no PCDT, na receita/relatório e na farmácia do SUS, pois os CIDs aceitos variam conforme indicação e fluxo local.",
    pcdt: "Conferir PCDT/linha de cuidado da condição tratada e regra local para apresentação solicitada.",
  },
  {
    name: "Haloperidol",
    aliases: ["haloperidol"],
    route: "Frequentemente disponível no SUS por fluxo municipal ou serviço de referência, conforme apresentação.",
    documents: "Receita e documentos pessoais; confirmar exigências para medicamento controlado e apresentação disponível.",
    forms: "Comprimido, solução oral ou solução injetável, conforme apresentação disponível na rede.",
    cids: "Conferir na receita/relatório e na farmácia do SUS, pois pode não seguir fluxo CEAF.",
    pcdt: "Conferir PCDT da condição tratada quando houver solicitação por fluxo estadual ou especializado.",
  },
  {
    name: "Midazolam",
    aliases: ["midazolam"],
    route: "Uso geralmente restrito a serviços de saúde ou fluxos específicos, por ser medicamento controlado e de manejo supervisionado.",
    documents: "Confirmar com equipe e serviço de referência; não deve ser buscado sem orientação formal.",
    forms: "Solução injetável ou apresentação oral quando disponível; geralmente vinculada a serviço de saúde e monitorização.",
    cids: "Conferir com a equipe de referência, pois geralmente depende de protocolo institucional ou serviço de saúde.",
    pcdt: "Conferir protocolo institucional ou PCDT da condição tratada; geralmente depende de serviço de saúde.",
  },
  {
    name: "Dexametasona",
    aliases: ["dexametasona"],
    route: "Geralmente disponível na assistência farmacêutica do SUS, conforme apresentação e lista local.",
    documents: "Receita e documentos pessoais; confirmar apresentação disponível.",
    forms: "Comprimido, solução oral ou solução injetável, conforme apresentação disponível na rede.",
    cids: "Conferir na receita/relatório e na farmácia do SUS, pois pode não seguir fluxo CEAF.",
    pcdt: "Conferir PCDT da condição tratada se houver solicitação por fluxo especializado.",
  },
  {
    name: "Dipirona",
    aliases: ["dipirona", "metamizol"],
    route: "Geralmente disponível por farmácia básica, unidade de saúde ou serviço de referência, conforme apresentação local.",
    documents: "Receita quando exigida e documentos pessoais; confirmar regra local.",
    forms: "Comprimido, gotas/solução oral ou solução injetável, conforme apresentação disponível na rede.",
    cids: "Conferir na receita/relatório e na farmácia do SUS, pois geralmente não segue fluxo CEAF.",
    pcdt: "Geralmente não depende de PCDT/CEAF para uso comum; confirmar regra local.",
  },
  {
    name: "Metoclopramida",
    aliases: ["metoclopramida"],
    route: "Geralmente disponível na assistência farmacêutica do SUS ou em serviços de saúde, conforme apresentação.",
    documents: "Receita e documentos pessoais; confirmar disponibilidade local.",
    forms: "Comprimido, solução oral ou solução injetável, conforme apresentação disponível na rede.",
    cids: "Conferir na receita/relatório e na farmácia do SUS, pois pode não seguir fluxo CEAF.",
    pcdt: "Conferir PCDT da condição tratada se houver solicitação por fluxo especializado.",
  },
];

function formatOpioidDecimal(value, maximumFractionDigits = 1) {
  if (!Number.isFinite(value)) return "--";
  return value.toLocaleString("pt-BR", {
    maximumFractionDigits,
    minimumFractionDigits: value % 1 === 0 ? 0 : 1,
  });
}

function calculateOpioidConversion() {
  if (!opioidSource || !opioidSourceDose || !opioidTarget || !opioidReduction || !opioidConversionResult) return;

  const source = opioidConversionData[opioidSource.value];
  const target = opioidConversionData[opioidTarget.value];
  const sourceDose = Number(opioidSourceDose.value.replace?.(",", ".") ?? opioidSourceDose.value);
  const reduction = Number(opioidReduction.value);

  opioidConversionResult.classList.add("show");

  if (!source || !target || !Number.isFinite(sourceDose) || sourceDose <= 0) {
    opioidConversionResult.innerHTML = `
      <h3>Informe uma dose válida</h3>
      <p>Digite a dose total usada em 24 horas. Para fentanil transdérmico, informe a dose do adesivo em mcg/h. Metadona e buprenorfina exigem cálculo individualizado por especialista.</p>
    `;
    return;
  }

  const oralMorphineEquivalent = sourceDose * source.oralMorphineEquivalentFactor;
  const unreducedTargetDose = oralMorphineEquivalent / target.oralMorphineEquivalentFactor;
  const adjustedTargetDose = unreducedTargetDose * (1 - reduction);
  const rescueDose = target.isPatch ? null : adjustedTargetDose * 0.1;

  opioidConversionResult.innerHTML = `
    <h3>Resultado estimado</h3>
    <div class="opioid-result-grid">
      <div>
        <span>Equivalente em morfina oral</span>
        <strong>${formatOpioidDecimal(oralMorphineEquivalent, 1)} mg/24h</strong>
      </div>
      <div>
        <span>Dose equianalgésica de ${target.label}</span>
        <strong>${formatOpioidDecimal(unreducedTargetDose, target.isPatch ? 0 : 1)} ${target.unit}</strong>
      </div>
      <div>
        <span>Dose sugerida após redução de ${Math.round(reduction * 100)}%</span>
        <strong>${formatOpioidDecimal(adjustedTargetDose, target.isPatch ? 0 : 1)} ${target.unit}</strong>
      </div>
      <div>
        <span>Dose de resgate aproximada</span>
        <strong>${rescueDose === null ? "Definir separadamente" : `${formatOpioidDecimal(rescueDose, 1)} ${target.unit}`}</strong>
      </div>
    </div>
    <p>
      Arredonde para apresentações disponíveis e reavalie clinicamente. As tabelas de equivalência variam entre fontes,
      especialmente para opioides fracos, tapentadol, hidrocodona e fentanil transdérmico. Conversões envolvendo adesivo
      de fentanil exigem atenção ao tempo de início/retirada e necessidade de resgate durante a transição.
    </p>
  `;
}

const publicCeafMunicipalitiesByState = {
  AC: ["Rio Branco", "Cruzeiro do Sul", "Sena Madureira", "Tarauacá", "Feijó"],
  AL: ["Maceió", "Arapiraca", "Rio Largo", "Palmeira dos Índios", "União dos Palmares"],
  AP: ["Macapá", "Santana", "Laranjal do Jari", "Oiapoque", "Mazagão"],
  AM: ["Manaus", "Parintins", "Itacoatiara", "Manacapuru", "Coari", "Tefé", "Tabatinga"],
  BA: ["Salvador", "Feira de Santana", "Vitória da Conquista", "Camaçari", "Itabuna", "Juazeiro", "Lauro de Freitas", "Ilhéus", "Jequié", "Barreiras"],
  CE: ["Fortaleza", "Caucaia", "Juazeiro do Norte", "Maracanaú", "Sobral", "Crato", "Itapipoca", "Maranguape", "Iguatu", "Quixadá"],
  DF: ["Brasília"],
  ES: ["Vitória", "Vila Velha", "Serra", "Cariacica", "Cachoeiro de Itapemirim", "Linhares", "São Mateus", "Colatina"],
  GO: ["Goiânia", "Aparecida de Goiânia", "Anápolis", "Rio Verde", "Águas Lindas de Goiás", "Luziânia", "Valparaíso de Goiás", "Trindade", "Catalão"],
  MA: ["São Luís", "Imperatriz", "São José de Ribamar", "Timon", "Caxias", "Codó", "Paço do Lumiar", "Açailândia", "Bacabal"],
  MT: ["Cuiabá", "Várzea Grande", "Rondonópolis", "Sinop", "Tangará da Serra", "Cáceres", "Sorriso", "Lucas do Rio Verde", "Barra do Garças"],
  MS: ["Campo Grande", "Dourados", "Três Lagoas", "Corumbá", "Ponta Porã", "Naviraí", "Nova Andradina", "Aquidauana"],
  MG: ["Belo Horizonte", "Uberlândia", "Contagem", "Juiz de Fora", "Betim", "Montes Claros", "Ribeirão das Neves", "Uberaba", "Governador Valadares", "Ipatinga", "Divinópolis"],
  PA: ["Belém", "Ananindeua", "Santarém", "Marabá", "Parauapebas", "Castanhal", "Abaetetuba", "Cametá", "Altamira", "Tucuruí"],
  PB: ["João Pessoa", "Campina Grande", "Santa Rita", "Patos", "Bayeux", "Sousa", "Cajazeiras", "Cabedelo"],
  PR: ["Curitiba", "Londrina", "Maringá", "Ponta Grossa", "Cascavel", "São José dos Pinhais", "Foz do Iguaçu", "Colombo", "Guarapuava"],
  PE: ["Recife", "Jaboatão dos Guararapes", "Olinda", "Caruaru", "Petrolina", "Paulista", "Cabo de Santo Agostinho", "Camaragibe", "Garanhuns"],
  PI: ["Teresina", "Parnaíba", "Picos", "Piripiri", "Floriano", "Campo Maior", "Barras"],
  RJ: ["Rio de Janeiro", "São Gonçalo", "Duque de Caxias", "Nova Iguaçu", "Niterói", "Belford Roxo", "Campos dos Goytacazes", "São João de Meriti", "Petrópolis", "Volta Redonda"],
  RN: ["Natal", "Mossoró", "Parnamirim", "São Gonçalo do Amarante", "Macaíba", "Ceará-Mirim", "Caicó"],
  RS: ["Porto Alegre", "Caxias do Sul", "Canoas", "Pelotas", "Santa Maria", "Gravataí", "Viamão", "Novo Hamburgo", "São Leopoldo", "Rio Grande"],
  RO: ["Porto Velho", "Ji-Paraná", "Ariquemes", "Vilhena", "Cacoal", "Rolim de Moura", "Guajará-Mirim"],
  RR: ["Boa Vista", "Rorainópolis", "Caracaraí", "Pacaraima", "Mucajaí"],
  SC: ["Florianópolis", "Joinville", "Blumenau", "São José", "Chapecó", "Itajaí", "Criciúma", "Jaraguá do Sul", "Lages"],
  SP: ["São Paulo", "Guarulhos", "Campinas", "São Bernardo do Campo", "Santo André", "São José dos Campos", "Osasco", "Ribeirão Preto", "Sorocaba", "Santos", "Guarujá", "São Vicente", "Praia Grande"],
  SE: ["Aracaju", "Nossa Senhora do Socorro", "Lagarto", "Itabaiana", "São Cristóvão", "Estância"],
  TO: ["Palmas", "Araguaína", "Gurupi", "Porto Nacional", "Paraíso do Tocantins", "Colinas do Tocantins"],
};

function setCookieConsent(value) {
  try {
    localStorage.setItem(cookieConsentKey, value);
  } catch {
    // Mantém o aviso fechado mesmo se o navegador bloquear armazenamento local.
  }
  if (cookieBanner) {
    cookieBanner.hidden = true;
  }
}

function initCookieBanner() {
  if (!cookieBanner) return;

  let consent = "";
  try {
    consent = localStorage.getItem(cookieConsentKey) || "";
  } catch {
    consent = "";
  }

  cookieBanner.hidden = Boolean(consent);
  acceptCookiesButton?.addEventListener("click", () => setCookieConsent("accepted"));
  declineCookiesButton?.addEventListener("click", () => setCookieConsent("declined"));
}

function formatVisitDate(timestamp) {
  const date = new Date(Number(timestamp));
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function renderVisitCounter(count, lastVisit) {
  if (!visitCounter) return;

  const safeCount = Number.isFinite(count) && count >= 0 ? count : 0;
  visitCounter.textContent = safeCount.toLocaleString("pt-BR");
  visitCounter.closest(".visit-counter")?.classList.add("is-active");

  if (visitCounterMeta) {
    visitCounterMeta.textContent = safeCount > 0 ? "Neste navegador" : "Neste navegador | contador zerado";
  }
}

function updateVisitCounter() {
  if (!visitCounter) return;

  try {
    visitCounterLegacyKeys.forEach((key) => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });

    const alreadyCountedThisSession = sessionStorage.getItem(visitCounterSessionKey) === "1";
    const storedCount = Number.parseInt(localStorage.getItem(visitCounterKey) || "0", 10);
    const previousCount = Number.isFinite(storedCount) ? storedCount : 0;
    const storedLastVisit = Number.parseInt(localStorage.getItem(visitCounterLastVisitKey) || "0", 10);
    const lastVisit = Number.isFinite(storedLastVisit) ? storedLastVisit : 0;
    const now = Date.now();
    const canCountNewVisit = !alreadyCountedThisSession && (!lastVisit || now - lastVisit >= visitCounterWindowMs);
    const nextCount = canCountNewVisit ? previousCount + 1 : previousCount;

    if (canCountNewVisit) {
      localStorage.setItem(visitCounterKey, String(nextCount));
      localStorage.setItem(visitCounterLastVisitKey, String(now));
      sessionStorage.setItem(visitCounterSessionKey, "1");
    }

    renderVisitCounter(nextCount, localStorage.getItem(visitCounterLastVisitKey) || "");
  } catch {
    renderVisitCounter(0, "");
  }
}

updateVisitCounter();
initCookieBanner();

window.addEventListener("storage", (event) => {
  if (event.key !== visitCounterKey && event.key !== visitCounterLastVisitKey) return;

  try {
    const count = Number.parseInt(localStorage.getItem(visitCounterKey) || "0", 10);
    renderVisitCounter(Number.isFinite(count) ? count : 0, localStorage.getItem(visitCounterLastVisitKey) || "");
  } catch {
    renderVisitCounter(0, "");
  }
});
const symptomTabs = [
  { id: "manejo-dor", label: "Dor" },
  { id: "tosse", label: "Tosse" },
  { id: "dispneia", label: "Dispneia" },
  { id: "nauseas", label: "Náuseas" },
  { id: "vomitos", label: "Vômitos" },
  { id: "constipacao", label: "Constipação" },
  { id: "diarreia", label: "Diarreia" },
  { id: "depressao", label: "Depressão" },
  { id: "ansiedade", label: "Ansiedade" },
  { id: "delirium", label: "Delirium" },
  { id: "insonia", label: "Insônia" },
  { id: "fadiga", label: "Fadiga" },
  { id: "hiporexia", label: "Hiporexia" },
  { id: "xerostomia", label: "Xerostomia" },
  { id: "sialorreia", label: "Sialorreia" },
  { id: "babacao", label: "Babação" },
];
const symptomTabIds = new Set(symptomTabs.map((tab) => tab.id));
const routeTabs = [
  { id: "via-oral", label: "Via oral" },
  { id: "hipodermoclise", label: "Hipodermóclise" },
  { id: "via-endovenosa", label: "Via endovenosa" },
  { id: "via-sublingual-bucal", label: "Via sublingual/bucal" },
  { id: "via-retal", label: "Via retal" },
  { id: "sonda-gastrostomia", label: "Sonda nasoenteral / gastrostomia" },
];
const routeTabIds = new Set(routeTabs.map((tab) => tab.id));
const painState = {
  stepOneAnswered: false,
  redFlags: [],
  mechanism: null,
  phenotype: null,
  intensity: "mild",
};

const coughState = {
  stepOneAnswered: false,
  alerts: [],
  type: "productive",
  factors: [],
};

const dyspneaState = {
  stepOneAnswered: false,
  alerts: [],
  intensity: "mrc0",
  factors: [],
};

const fatigueState = {
  stepOneAnswered: false,
  alerts: [],
  intensity: "mild",
  factors: [],
};

const anorexiaState = {
  stepOneAnswered: false,
  alerts: [],
  stage: "precachexia",
  factors: [],
};

const identificationState = {
  simplified: null,
  simplifiedItems: [],
  simplifiedNone: false,
  simplifiedDoubt: false,
  spict: null,
  spictItems: [],
  spictNone: false,
  spictDoubt: false,
  surprise: null,
};

const capacityState = {
  risk: "low",
  riskItems: [],
  choiceItems: [],
  understandingItems: [],
  appreciationItems: [],
  reasoningItems: [],
  domains: {
    choice: null,
    understanding: null,
    appreciation: null,
    reasoning: null,
  },
};

const prescriptionState = {
  population: null,
  route: null,
  routeAnswered: false,
  symptomIntensities: {},
  symptoms: [],
  painTypes: [],
  coughTypes: [],
  nonpharm: [],
  medications: [],
  phytotherapy: [],
};

const prescriptionLabels = {
  population: {
    adult: "Adulto",
    pediatric: "Pediátrico",
  },
  routes: {
    oral: "Oral",
    sublingual: "Sublingual/bucal",
    subcutaneous: "Hipodermóclise/subcutânea",
    intravenous: "Endovenosa",
    rectal: "Retal",
    tube: "Sonda/Gastrostomia",
  },
  intensity: {
    mild: "Leve",
    moderate: "Moderada",
    severe: "Intensa",
    crisis: "Crise/fim de vida",
  },
  symptoms: {
    pain: "Dor",
    dyspnea: "Dispneia",
    cough: "Tosse",
    nauseaVomiting: "Náuseas/vômitos",
    constipation: "Constipação",
    diarrhea: "Diarreia",
    anxiety: "Ansiedade",
    delirium: "Delirium",
    secretions: "Secreções/sororoca",
    fatigue: "Fadiga",
    anorexiaCachexia: "Síndrome de anorexia-caquexia",
  },
  nonpharm: {
    positioning: "Posicionamento, conforto no leito e conservação de energia.",
    fanBreathing: "Ventilação/fan na face, respiração guiada e ambiente calmo.",
    oralCare: "Higiene oral, umidificação e cuidado de próteses.",
    bowelPlan: "Plano intestinal, hidratação proporcional e rotina de evacuação.",
    diet: "Dieta fracionada, textura adaptada, preferências alimentares e metas realistas.",
    communication: "Comunicação com família, validação de medo e plano de crise compartilhado.",
  },
  painTypes: {
    somatic: "Nociceptiva somática",
    visceral: "Nociceptiva visceral",
    neuropathic: "Neuropática",
    nociplastic: "Nociplástica",
  },
  coughTypes: {
    productive: "Com secreção",
    dry: "Sem secreção",
    refractory: "Refratária",
  },
};

const prescriptionMedicationOptions = {
  pain: [
    { id: "pain-dipyrone", label: "Dipirona", detail: "Dor leve/moderada: 500 mg a 1 g VO/SC/EV a cada 6 h, conforme via disponível e protocolo local.", routes: ["oral", "subcutaneous", "intravenous", "tube"], intensities: ["mild", "moderate"] },
    { id: "pain-paracetamol", label: "Paracetamol", detail: "Dor leve: 500 mg a 750 mg VO/retal ou por sonda a cada 6 h.", routes: ["oral", "rectal", "tube"], intensities: ["mild"], painTypes: ["somatic", "visceral"] },
    { id: "pain-ibuprofen", label: "Ibuprofeno", detail: "Dor nociceptiva com componente inflamatório: 200 mg a 400 mg VO/retal a cada 6 a 8 h se seguro.", routes: ["oral", "rectal"], intensities: ["mild", "moderate"], painTypes: ["somatic"] },
    { id: "pain-codeine", label: "Codeína", detail: "Dor moderada: 15 mg a 30 mg VO/retal a cada 4 a 6 h, se apropriado.", routes: ["oral", "rectal", "tube"], intensities: ["moderate"], painTypes: ["somatic", "visceral"] },
    { id: "pain-morphine", label: "Morfina", detail: "Dor moderada/intensa: considerar 2,5 mg a 5 mg VO/retal ou 1 mg a 2 mg SC/EV, titulando resposta e segurança.", routes: ["oral", "subcutaneous", "intravenous", "rectal", "tube"], intensities: ["moderate", "severe", "crisis"] },
    { id: "pain-amitriptyline", label: "Amitriptilina", detail: "Dor neuropática/nociplástica: 10 mg VO à noite como posologia de referência em pessoa frágil ou idosa.", routes: ["oral", "tube"], intensities: ["mild", "moderate", "severe"], painTypes: ["neuropathic", "nociplastic"] },
    { id: "pain-gabapentin", label: "Gabapentina", detail: "Dor neuropática/nociplástica: 100 mg a 300 mg VO à noite como posologia de referência, ajustando por idade e função renal.", routes: ["oral", "tube"], intensities: ["mild", "moderate", "severe"], painTypes: ["neuropathic", "nociplastic"] },
    { id: "ped-pain-paracetamol", label: "Paracetamol pediátrico", detail: "Dor leve: 10 a 15 mg/kg/dose VO, retal ou por sonda a cada 6 h; respeitar dose máxima por peso, idade e função hepática.", routes: ["oral", "rectal", "tube"], intensities: ["mild"], painTypes: ["somatic", "visceral"], populations: ["pediatric"] },
    { id: "ped-pain-ibuprofen", label: "Ibuprofeno pediátrico", detail: "Dor leve/moderada com componente inflamatório: 5 a 10 mg/kg/dose VO a cada 6 a 8 h; evitar em desidratação, insuficiência renal, sangramento, plaquetopenia ou risco gastrointestinal.", routes: ["oral", "tube"], intensities: ["mild", "moderate"], painTypes: ["somatic"], populations: ["pediatric"] },
    { id: "ped-pain-morphine", label: "Morfina pediátrica de liberação imediata", detail: "Dor moderada/intensa: 0,1 a 0,2 mg/kg/dose VO ou por sonda a cada 4 h como início usual; iniciar mais baixo em lactentes, fragilidade, insuficiência renal/hepática ou uso de sedativos.", routes: ["oral", "tube"], intensities: ["moderate", "severe", "crisis"], populations: ["pediatric"] },
    { id: "ped-pain-gabapentin", label: "Gabapentina pediátrica", detail: "Dor neuropática ou hipersensibilidade: iniciar 5 mg/kg/dose VO ou por sonda à noite ou a cada 12 h; titular lentamente conforme resposta, sonolência e função renal.", routes: ["oral", "tube"], intensities: ["mild", "moderate", "severe"], painTypes: ["neuropathic", "nociplastic"], populations: ["pediatric"] },
  ],
  dyspnea: [
    { id: "dyspnea-morphine", label: "Opioide para dispneia", detail: "Dispneia moderada/intensa: morfina 2,5 mg a 5 mg VO ou 1 mg a 2 mg SC/EV como posologia de referência, com reavaliação.", routes: ["oral", "subcutaneous", "intravenous", "tube"], intensities: ["moderate", "severe", "crisis"] },
    { id: "dyspnea-bronchodilator", label: "Broncodilatador se broncoespasmo", detail: "Considerar salbutamol ou ipratrópio inalatório/nebulização se sibilância ou DPOC/asma.", routes: ["oral", "tube"], intensities: ["mild", "moderate", "severe", "crisis"] },
    { id: "dyspnea-benzodiazepine", label: "Ansiolítico se pânico associado", detail: "Dispneia intensa/crise com ansiedade: considerar benzodiazepínico em baixa dose, com monitorização de sedação.", routes: ["oral", "subcutaneous", "tube"], intensities: ["severe", "crisis"] },
    { id: "ped-dyspnea-salbutamol", label: "Salbutamol inalatório pediátrico", detail: "Se sibilância ou broncoespasmo: 2 a 4 jatos com espaçador, podendo repetir conforme gravidade e protocolo; monitorar tremor, taquicardia e agitação.", routes: ["oral", "tube"], intensities: ["mild", "moderate", "severe", "crisis"], populations: ["pediatric"] },
    { id: "ped-dyspnea-ipratropium", label: "Brometo de ipratrópio inalatório pediátrico", detail: "Broncoespasmo associado à dispneia: 250 mcg por nebulização a cada 6 a 8 h em crianças pequenas ou 500 mcg em maiores, conforme idade, gravidade e protocolo local.", routes: ["oral", "tube"], intensities: ["mild", "moderate", "severe", "crisis"], populations: ["pediatric"] },
    { id: "ped-dyspnea-morphine", label: "Morfina pediátrica para dispneia", detail: "Dispneia persistente com sofrimento importante em maiores de 6 meses: 0,05 a 0,1 mg/kg/dose VO ou por sonda a cada 4 h se necessário; titular com cautela e monitorar sedação/respiração.", routes: ["oral", "tube"], intensities: ["moderate", "severe", "crisis"], populations: ["pediatric"] },
  ],
  cough: [
    { id: "cough-codeine", label: "Antitussivo opioide", detail: "Tosse moderada/intensa, seca ou refratária: considerar codeína 10 mg a 20 mg VO a cada 4 a 6 h se apropriado.", routes: ["oral", "rectal", "tube"], intensities: ["moderate", "severe", "crisis"], coughTypes: ["dry", "refractory"] },
    { id: "cough-ipratropium", label: "Ipratrópio se secreção/broncoespasmo", detail: "Tosse com secreção/broncorreia ou broncoespasmo: considerar brometo de ipratrópio inalatório/nebulização.", routes: ["oral", "tube"], intensities: ["mild", "moderate", "severe", "crisis"], coughTypes: ["productive"] },
    { id: "ped-cough-salbutamol", label: "Salbutamol inalatório pediátrico", detail: "Tosse associada a sibilância ou broncoespasmo: 2 a 4 jatos com espaçador, podendo repetir conforme gravidade e protocolo; monitorar tremor, taquicardia e agitação.", routes: ["oral", "tube"], intensities: ["mild", "moderate", "severe", "crisis"], coughTypes: ["dry", "refractory"], populations: ["pediatric"] },
    { id: "ped-cough-ipratropium", label: "Brometo de ipratrópio inalatório pediátrico", detail: "Tosse com secreção/broncorreia ou broncoespasmo: 250 mcg por nebulização a cada 6 a 8 h em crianças pequenas ou 500 mcg em maiores, conforme idade, gravidade e protocolo local.", routes: ["oral", "tube"], intensities: ["mild", "moderate", "severe", "crisis"], coughTypes: ["productive"], populations: ["pediatric"] },
  ],
  nauseaVomiting: [
    { id: "nausea-metoclopramide", label: "Metoclopramida", detail: "Náuseas/vômitos leves/moderados: 10 mg VO/SC/EV/retal a cada 8 h, evitando se obstrução completa ou sintomas extrapiramidais.", routes: ["oral", "subcutaneous", "intravenous", "rectal", "tube"], intensities: ["mild", "moderate"] },
    { id: "nausea-haloperidol", label: "Haloperidol", detail: "Náusea persistente, química/metabólica ou associada a delirium: 0,5 mg a 1 mg VO/SC/retal à noite ou a cada 12 h.", routes: ["oral", "subcutaneous", "rectal", "tube"], intensities: ["moderate", "severe", "crisis"] },
    { id: "nausea-ondansetron", label: "Ondansetrona", detail: "Náusea/vômito moderado/intenso: considerar 4 mg a 8 mg VO/EV a cada 8 a 12 h quando indicado; observar constipação.", routes: ["oral", "intravenous", "tube"], intensities: ["moderate", "severe"] },
    { id: "ped-nausea-ondansetron", label: "Ondansetrona pediátrica", detail: "Náuseas/vômitos moderados/intensos: 0,15 mg/kg/dose VO, EV ou por sonda a cada 8 h se necessário; dose máxima usual 8 mg por dose; monitorar constipação e intervalo QT.", routes: ["oral", "intravenous", "tube"], intensities: ["moderate", "severe", "crisis"], populations: ["pediatric"] },
    { id: "ped-nausea-metoclopramide", label: "Metoclopramida pediátrica", detail: "Náusea/vômito com suspeita de gastroparesia ou estase gástrica: 0,1 a 0,15 mg/kg/dose VO, EV, SC ou por sonda a cada 6 a 8 h; evitar em obstrução completa e risco extrapiramidal.", routes: ["oral", "subcutaneous", "intravenous", "tube"], intensities: ["mild", "moderate", "severe"], populations: ["pediatric"] },
    { id: "ped-nausea-haloperidol", label: "Haloperidol pediátrico", detail: "Náusea/vômito persistente por mecanismo químico/metabólico ou associado a delirium: 0,01 a 0,02 mg/kg/dose VO, SC ou por sonda a cada 12 a 24 h; monitorar sedação, efeitos extrapiramidais e QT.", routes: ["oral", "subcutaneous", "tube"], intensities: ["moderate", "severe", "crisis"], populations: ["pediatric"] },
  ],
  constipation: [
    { id: "constipation-laxative", label: "Laxativo de rotina", detail: "Constipação leve/moderada: associar laxativo estimulante e/ou osmótico conforme padrão intestinal, hidratação e opioide.", routes: ["oral", "tube"], intensities: ["mild", "moderate"] },
    { id: "constipation-glycerol", label: "Glicerol retal", detail: "Constipação intensa: considerar glicerol por via retal se não houver contraindicação local.", routes: ["rectal"], intensities: ["severe", "crisis"] },
    { id: "constipation-rectal", label: "Enema ou medida retal se impactação", detail: "Constipação intensa ou suspeita de fecaloma: considerar solução retal de glicerol ou remoção, respeitando conforto, plaquetas e mucosa.", routes: ["rectal"], intensities: ["severe", "crisis"] },
  ],
  diarrhea: [
    { id: "diarrhea-hydration", label: "Reposição proporcional", detail: "Diarreia moderada/intensa: repor líquidos e eletrólitos conforme objetivo de cuidado; investigar laxativos, antibióticos e impactação.", routes: ["oral", "subcutaneous", "intravenous", "tube"], intensities: ["moderate", "severe", "crisis"] },
    { id: "diarrhea-codeine", label: "Codeína em caso selecionado", detail: "Diarreia persistente em caso selecionado: considerar codeína em baixa dose, observando sedação, constipação e náuseas.", routes: ["oral", "rectal", "tube"], intensities: ["moderate", "severe"] },
    { id: "ped-diarrhea-ors", label: "Solução de reidratação oral pediátrica", detail: "Diarreia ou vômitos com objetivo de hidratação proporcional: ofertar pequenos volumes frequentes, ajustando por sede, perdas, tolerância e objetivo de cuidado.", routes: ["oral", "tube"], intensities: ["mild", "moderate", "severe"], populations: ["pediatric"] },
  ],
  anxiety: [
    { id: "anxiety-diazepam", label: "Diazepam", detail: "Ansiedade intensa ou crise selecionada: considerar diazepam 5 mg a 10 mg, com monitoramento de sedação, respiração e delirium.", routes: ["oral", "rectal", "tube"], intensities: ["moderate", "severe", "crisis"] },
    { id: "anxiety-midazolam", label: "Midazolam se crise/refratariedade", detail: "Ansiedade em crise/refratária: considerar midazolam SC/EV conforme protocolo e monitorização clínica.", routes: ["subcutaneous", "intravenous"], intensities: ["crisis"] },
  ],
  delirium: [
    { id: "delirium-haloperidol", label: "Haloperidol", detail: "Delirium moderado/intenso: 0,5 mg a 1 mg VO/SC/retal a cada 12 a 24 h, titulando por sintomas e efeitos adversos.", routes: ["oral", "subcutaneous", "rectal", "tube"], intensities: ["moderate", "severe", "crisis"] },
    { id: "delirium-quetiapine", label: "Quetiapina se via oral possível", detail: "Delirium leve/moderado em caso selecionado: considerar 12,5 mg a 25 mg VO à noite.", routes: ["oral", "tube"], intensities: ["mild", "moderate"] },
  ],
  secretions: [
    { id: "secretions-atropine", label: "Atropina", detail: "Secreções moderadas/intensas ou sororoca: considerar sulfato de atropina conforme via disponível, protocolo local e tolerabilidade.", routes: ["subcutaneous"], intensities: ["moderate", "severe", "crisis"] },
    { id: "ped-secretions-atropine", label: "Atropina 1% colírio por via sublingual", detail: "Sialorreia ou secreções incômodas: 1 gota sublingual a cada 6 a 8 h se indicado; monitorar boca seca, retenção urinária, constipação, taquicardia e espessamento de secreções.", routes: ["sublingual"], intensities: ["moderate", "severe", "crisis"], populations: ["pediatric"] },
  ],
  fatigue: [
    { id: "fatigue-dexamethasone", label: "Corticosteroide em contexto selecionado", detail: "Fadiga intensa/fim de vida: considerar dexametasona 2 mg a 4 mg pela manhã por curto período se meta definida.", routes: ["oral", "subcutaneous", "intravenous", "tube"], intensities: ["severe", "crisis"] },
  ],
  anorexiaCachexia: [
    { id: "anorexia-dexamethasone", label: "Corticosteroide em contexto selecionado", detail: "Síndrome de anorexia-caquexia moderada/intensa: considerar dexametasona 2 mg a 4 mg pela manhã por curto período se benefício esperado.", routes: ["oral", "subcutaneous", "intravenous", "tube"], intensities: ["moderate", "severe"] },
    { id: "anorexia-comfort", label: "Sem fármaco de rotina na fase final", detail: "Crise/fim de vida: priorizar conforto alimentar e boca úmida; medicamento apenas se houver sintoma-alvo claro.", routes: ["oral", "subcutaneous", "rectal", "tube"], intensities: ["crisis"] },
  ],
};

const prescriptionPhytotherapyOptions = {
  pain: [
    {
      id: "phyto-pain-harpagophytum",
      label: "Garra-do-diabo",
      detail:
        "Dor musculoesquelética/nociceptiva somática leve a moderada: 1 cápsula/comprimido VO a cada 8 a 12 h, conforme apresentação padronizada. Evitar em úlcera péptica ativa, gestação e cautela com anticoagulantes.",
      routes: ["oral"],
      intensities: ["mild", "moderate"],
      painTypes: ["somatic"],
      populations: ["adult"],
    },
  ],
  cough: [
    {
      id: "phyto-cough-guaco",
      label: "Guaco",
      detail:
        "Tosse leve com ou sem secreção, como adjuvante: xarope VO conforme concentração disponível, geralmente 5 mL a 10 mL até 3 vezes ao dia. Não atrasar avaliação de dispneia, febre, hipoxemia ou infecção.",
      routes: ["oral"],
      intensities: ["mild"],
      coughTypes: ["productive", "dry"],
      populations: ["adult"],
    },
  ],
  nauseaVomiting: [
    {
      id: "phyto-nausea-peppermint",
      label: "Hortelã-pimenta",
      detail:
        "Náusea ou desconforto abdominal leve sem sinais de alarme: infusão de 1 a 2 g em 150 mL de água, 2 a 3 vezes ao dia. Evitar em refluxo importante, obstrução biliar ou hipersensibilidade.",
      routes: ["oral"],
      intensities: ["mild"],
      populations: ["adult"],
    },
  ],
  constipation: [
    {
      id: "phyto-constipation-plantago",
      label: "Plantago ovata",
      detail:
        "Constipação leve com ingestão hídrica possível: usar VO conforme apresentação padronizada, sempre com líquidos e reavaliação de distensão, dor ou suspeita de obstrução.",
      routes: ["oral"],
      intensities: ["mild"],
      populations: ["adult"],
    },
  ],
};

const prescriptionNonpharmOptions = {
  pain: {
    base: [
      { id: "pain-education", text: "Explicar mecanismo provável da dor, metas realistas de alívio e plano de reavaliação." },
      { id: "pain-positioning", text: "Ajustar posicionamento, proteção de áreas dolorosas, calor/frio local quando apropriado e evitar repouso absoluto prolongado." },
    ],
    severe: [
      { id: "pain-urgent-plan", text: "Definir plano de resgate, sinais de alerta e contato rápido se dor intensa persistir." },
    ],
    crisis: [
      { id: "pain-crisis", text: "Priorizar conforto imediato, reduzir estímulos, presença contínua e reavaliação breve da resposta." },
    ],
  },
  dyspnea: {
    base: [
      { id: "dyspnea-position", text: "Sentar ou elevar cabeceira, afrouxar roupas, reduzir estímulos e orientar respiração lenta." },
      { id: "dyspnea-fan", text: "Usar ventilação/fan direcionado para face e ambiente arejado." },
    ],
    severe: [
      { id: "dyspnea-comfort", text: "Aplicar plano de crise para dispneia, presença calma e comunicação curta com paciente/família." },
    ],
    crisis: [
      { id: "dyspnea-crisis", text: "Priorizar conforto, acionar suporte, posicionar, fan na face e evitar deslocamentos desnecessários." },
    ],
  },
  cough: {
    base: [
      { id: "cough-hydration", text: "Umidificar vias aéreas, ajustar decúbito e revisar gatilhos como refluxo, aspiração e poeira." },
    ],
    severe: [
      { id: "cough-secretions", text: "Se tosse com secreção, favorecer tosse efetiva, higiene brônquica suave e drenagem postural conforme tolerância." },
    ],
    crisis: [
      { id: "cough-alert", text: "Se tosse causa exaustão, sangramento ou dispneia intensa, interromper rotina e orientar avaliação dirigida." },
    ],
  },
  nauseaVomiting: {
    base: [
      { id: "nausea-diet", text: "Oferecer pequenas porções, alimentos frios ou mornos, evitar odores fortes e revisar constipação/medicações." },
    ],
    severe: [
      { id: "nausea-hydration", text: "Avaliar hidratação proporcional, risco de obstrução, distensão e necessidade de ajuste rápido do plano." },
    ],
    crisis: [
      { id: "nausea-crisis", text: "Suspender dieta forçada, proteger via aérea, orientar família e avaliar sinais de obstrução ou broncoaspiração." },
    ],
  },
  constipation: {
    base: [
      { id: "constipation-routine", text: "Organizar rotina intestinal, privacidade, mobilidade possível, líquidos conforme tolerância e revisão de opioides." },
    ],
    severe: [
      { id: "constipation-fecaloma", text: "Pesquisar fecaloma, dor abdominal, náuseas/vômitos e escape fecal antes de intensificar laxativos." },
    ],
    crisis: [
      { id: "constipation-obstruction", text: "Se distensão importante, vômitos ou parada de gases/fezes, considerar obstrução e interromper fluxo habitual." },
    ],
  },
  diarrhea: {
    base: [
      { id: "diarrhea-care", text: "Revisar laxativos, dieta, antibióticos, hidratação proporcional e proteção de pele perineal." },
    ],
    severe: [
      { id: "diarrhea-dehydration", text: "Monitorar sinais de desidratação, delirium, queda funcional e necessidade de reposição proporcional." },
    ],
    crisis: [
      { id: "diarrhea-alert", text: "Se sangue, febre, dor importante ou desidratação, orientar avaliação dirigida antes de antidiarreico." },
    ],
  },
  anxiety: {
    base: [
      { id: "anxiety-presence", text: "Presença calma, escuta ativa, reduzir estímulos, orientar respiração e explicar o plano em frases curtas." },
    ],
    severe: [
      { id: "anxiety-crisis-plan", text: "Combinar plano de crise, identificar gatilhos, envolver cuidador de referência e reavaliar dispneia/dor." },
    ],
    crisis: [
      { id: "anxiety-safety", text: "Garantir segurança, reduzir pessoas no ambiente, manter voz baixa e acionar equipe se risco ou sofrimento extremo." },
    ],
  },
  delirium: {
    base: [
      { id: "delirium-orientation", text: "Reorientação gentil, óculos/aparelho auditivo, rotina sono-vigília, hidratação proporcional e reduzir ruído." },
    ],
    severe: [
      { id: "delirium-safety", text: "Prevenir quedas, retirar riscos do ambiente, evitar contenção sempre que possível e revisar causas reversíveis." },
    ],
    crisis: [
      { id: "delirium-crisis", text: "Se agitação com risco, manter segurança, poucos interlocutores, explicar à família e acionar suporte." },
    ],
  },
  secretions: {
    base: [
      { id: "secretions-position", text: "Decúbito lateral, higiene oral frequente, reduzir fluidos se piora de secreção e evitar aspiração repetida sem benefício." },
    ],
    severe: [
      { id: "secretions-family", text: "Explicar à família que sororoca costuma ser mais angustiante para quem escuta do que para a pessoa inconsciente." },
    ],
    crisis: [
      { id: "secretions-comfort", text: "Priorizar posicionamento, conforto e comunicação familiar; evitar medidas invasivas desproporcionais." },
    ],
  },
  fatigue: {
    base: [
      { id: "fatigue-energy", text: "Conservação de energia, priorizar atividades significativas, alternar repouso e atividade leve possível." },
    ],
    severe: [
      { id: "fatigue-causes", text: "Revisar anemia, infecção, dor, sono, depressão, medicações e carga de cuidado." },
    ],
    crisis: [
      { id: "fatigue-comfort", text: "Em fase final, alinhar metas com família e evitar exigência de atividade, alimentação ou reabilitação desproporcional." },
    ],
  },
  anorexiaCachexia: {
    base: [
      { id: "anorexia-preferences", text: "Fracionar pequenas porções, priorizar preferências, textura segura e reduzir pressão familiar para comer." },
    ],
    severe: [
      { id: "anorexia-family", text: "Explicar síndrome de anorexia-caquexia, alinhar metas de conforto e revisar causas reversíveis como boca seca, náusea e constipação." },
    ],
    crisis: [
      { id: "anorexia-end", text: "Na fase final, não forçar dieta; focar boca úmida, conforto, rituais familiares e explicação clara." },
    ],
  },
};

const pediatricSymptomFlowState = {};

const pediatricSymptomFlowConfigs = {
  pain: {
    title: "Fluxo decisório interativo da dor",
    stepLabel: "Padrão predominante",
    defaultContext: "somatic",
    alerts: [
      "Dor intensa de início súbito ou progressão rápida",
      "Rebaixamento, sonolência incomum ou sinais de toxicidade medicamentosa",
      "Déficit neurológico novo, febre, rigidez de nuca, trauma ou suspeita de fratura",
      "Dor associada a dispneia intensa, abdome agudo, sangramento ou instabilidade",
    ],
    contexts: [
      { value: "somatic", label: "Nociceptiva somática" },
      { value: "visceral", label: "Nociceptiva visceral" },
      { value: "neuropathic", label: "Neuropática" },
      { value: "complex", label: "Complexa ou refratária" },
    ],
    recommendations: {
      somatic: {
        nonpharm: "Posicionar, proteger a área dolorosa, usar calor/frio quando apropriado, reduzir estímulos e definir meta de alívio com a criança/família.",
        meds: "Dor leve: paracetamol 10 a 15 mg/kg/dose VO/retal a cada 6 h. Se componente inflamatório e baixo risco: ibuprofeno 5 a 10 mg/kg/dose VO a cada 6 a 8 h. Dor moderada/intensa: morfina de liberação imediata 0,1 a 0,2 mg/kg/dose VO a cada 4 h, com titulação e monitorização.",
      },
      visceral: {
        nonpharm: "Avaliar constipação, distensão, náuseas, retenção urinária e posição de conforto; evitar manipulações desnecessárias.",
        meds: "Dor leve: paracetamol 10 a 15 mg/kg/dose VO/retal a cada 6 h. Dor moderada/intensa: morfina de liberação imediata 0,1 a 0,2 mg/kg/dose VO a cada 4 h, com cautela e reavaliação. Se houver cólica/espasmo, discutir antiespasmódico conforme protocolo pediátrico local.",
      },
      neuropathic: {
        nonpharm: "Evitar estímulos dolorosos, roupas apertadas e mobilização brusca; mapear alodinia, parestesia, choque ou queimação.",
        meds: "Considerar gabapentina 5 mg/kg/dose VO à noite ou a cada 12 h, com titulação lenta conforme resposta, sonolência e função renal; associar analgésico de base se houver componente nociceptivo.",
      },
      complex: {
        nonpharm: "Reavaliar mecanismo, adesão, via, dose, constipação por opioide, medo familiar e sofrimento global; definir plano de resgate.",
        meds: "Se dor moderada/intensa ou refratária, priorizar avaliação especializada. Conferir peso, dose máxima, função renal/hepática e necessidade de opioide, adjuvante ou via alternativa.",
      },
    },
  },
  dyspnea: {
    title: "Fluxo decisório interativo da dispneia",
    stepLabel: "Situação predominante",
    defaultContext: "bronchospasm",
    alerts: [
      "Estridor, cianose, apneia, exaustão ou tiragem intensa",
      "Saturação muito baixa com sofrimento, rebaixamento ou convulsão",
      "Suspeita de aspiração, pneumotórax, sepse ou crise respiratória aguda",
      "Dispneia rapidamente progressiva sem plano de crise definido",
    ],
    contexts: [
      { value: "bronchospasm", label: "Sibilância/broncoespasmo" },
      { value: "secretions", label: "Secreção ou broncorreia" },
      { value: "persistent", label: "Dispneia persistente" },
      { value: "crisis", label: "Crise de dispneia" },
    ],
    recommendations: {
      bronchospasm: {
        nonpharm: "Elevar cabeceira, manter cuidador de referência, reduzir estímulos e orientar respiração calma conforme tolerância.",
        meds: "Se sibilância/broncoespasmo: salbutamol 2 a 4 jatos com espaçador; considerar brometo de ipratrópio 250 mcg por nebulização a cada 6 a 8 h em crianças pequenas ou 500 mcg em maiores, conforme protocolo.",
      },
      secretions: {
        nonpharm: "Posicionar em decúbito lateral ou cabeceira elevada, higiene oral, hidratação proporcional e evitar aspiração repetida sem benefício.",
        meds: "Se houver broncoespasmo associado, considerar ipratrópio conforme idade e protocolo. Se secreções de vias aéreas superiores forem predominantes, avaliar fluxo de sialorreia/secreções.",
      },
      persistent: {
        nonpharm: "Fan/ventilação na face se tolerado, ambiente calmo, pausas para fala/alimentação e plano familiar de reavaliação.",
        meds: "Em maiores de 6 meses com sofrimento persistente: morfina 0,05 a 0,1 mg/kg/dose VO a cada 4 h se necessário; titular com cautela e monitorar sedação/respiração.",
      },
      crisis: {
        nonpharm: "Interromper atividades, posicionar, acalmar ambiente, chamar apoio e aplicar plano de crise previamente pactuado.",
        meds: "Usar medicações de crise previamente prescritas e proporcionais ao objetivo de cuidado. Se não houver plano ou houver instabilidade, interromper fluxo e solicitar avaliação imediata.",
      },
    },
  },
  cough: {
    title: "Fluxo decisório interativo da tosse",
    stepLabel: "Tipo de tosse",
    defaultContext: "productive",
    alerts: [
      "Hemoptise, engasgo importante ou suspeita de aspiração",
      "Tosse com dispneia intensa, cianose, exaustão ou estridor",
      "Febre alta, queda importante do estado geral ou dor torácica intensa",
    ],
    contexts: [
      { value: "productive", label: "Com secreção" },
      { value: "dry", label: "Sem secreção" },
      { value: "refractory", label: "Refratária" },
      { value: "bronchospasm", label: "Com broncoespasmo" },
    ],
    recommendations: {
      productive: {
        nonpharm: "Favorecer tosse efetiva sem exaurir a criança, ajustar posição, higiene oral, hidratação proporcional e revisão de aspiração/refluxo.",
        meds: "Se houver broncorreia ou broncoespasmo, considerar ipratrópio inalatório/nebulização conforme idade e protocolo. Evitar suprimir tosse produtiva sem avaliar retenção de secreções.",
      },
      dry: {
        nonpharm: "Reduzir irritantes, revisar refluxo, gotejamento pós-nasal, medicamentos, ambiente seco e impacto no sono.",
        meds: "Priorizar causa provável e conforto. Antitussivo opioide em pediatria deve ser individualizado e geralmente exige avaliação especializada.",
      },
      refractory: {
        nonpharm: "Rever causas persistentes: aspiração, broncoespasmo, refluxo, infecção, tumor, ansiedade e secreções.",
        meds: "Se tosse refratária com sofrimento importante, discutir manejo especializado; considerar broncodilatador quando houver sibilância e plano individual quando a tosse for seca e exaustiva.",
      },
      bronchospasm: {
        nonpharm: "Posicionar, reduzir esforço, observar frequência respiratória e resposta a broncodilatador prévio.",
        meds: "Salbutamol 2 a 4 jatos com espaçador; se secreção/broncoespasmo, ipratrópio 250 mcg por nebulização em crianças pequenas ou 500 mcg em maiores, conforme protocolo.",
      },
    },
  },
  sialorrhea: {
    title: "Fluxo decisório interativo da sialorreia",
    stepLabel: "Fator predominante",
    defaultContext: "dysphagia",
    alerts: [
      "Engasgos repetidos, aspiração ou desconforto respiratório",
      "Desidratação, boca muito seca, secreção muito espessa ou rolhas",
      "Retenção urinária, constipação intensa, taquicardia ou delirium após anticolinérgico",
    ],
    contexts: [
      { value: "dysphagia", label: "Disfagia/aspiração" },
      { value: "neurologic", label: "Doença neurológica" },
      { value: "skin", label: "Impacto em pele/conforto" },
      { value: "thick", label: "Secreção espessa" },
    ],
    recommendations: {
      dysphagia: {
        nonpharm: "Revisar textura, postura durante alimentação, higiene oral, proteção de pele e risco de aspiração.",
        meds: "Se sialorreia persistir com desconforto: atropina 1% colírio por via sublingual, 1 gota a cada 6 a 8 h se indicado; monitorar efeitos anticolinérgicos.",
      },
      neurologic: {
        nonpharm: "Ajustar posicionamento, proteção de pele, rotina de higiene oral e plano com cuidador para secreções.",
        meds: "Considerar atropina 1% sublingual 1 gota a cada 6 a 8 h quando benefício esperado superar risco de boca seca e secreção espessa.",
      },
      skin: {
        nonpharm: "Proteger lábios, queixo e pescoço, trocar tecidos úmidos, manter higiene suave e reduzir irritação.",
        meds: "Medicamento só se houver desconforto relevante, aspiração ou impacto funcional; considerar atropina sublingual conforme tolerância.",
      },
      thick: {
        nonpharm: "Evitar intensificar anticolinérgico; priorizar umidificação, higiene oral e hidratação proporcional.",
        meds: "Se secreção ficou espessa após atropina ou outro anticolinérgico, reduzir/suspender e reavaliar. Evitar nova dose antes de avaliação clínica.",
      },
    },
  },
  nausea: {
    title: "Fluxo decisório interativo das náuseas",
    stepLabel: "Mecanismo provável",
    defaultContext: "gastric",
    alerts: [
      "Suspeita de obstrução intestinal, distensão importante ou dor abdominal intensa",
      "Sonolência, cefaleia intensa, vômitos em jato ou suspeita de hipertensão intracraniana",
      "Desidratação, sangue, bile persistente ou piora rápida",
    ],
    contexts: [
      { value: "gastric", label: "Gastroparesia/estase" },
      { value: "chemical", label: "Química/metabólica" },
      { value: "constipation", label: "Constipação associada" },
      { value: "anxiety", label: "Ansiedade/odores/alimentação" },
    ],
    recommendations: {
      gastric: {
        nonpharm: "Fracionar volumes, reduzir odores, revisar dieta, posição pós-alimentação e medicamentos que retardam esvaziamento gástrico.",
        meds: "Metoclopramida 0,1 a 0,15 mg/kg/dose VO/EV/SC a cada 6 a 8 h se não houver obstrução completa ou risco extrapiramidal.",
      },
      chemical: {
        nonpharm: "Revisar fármacos, infecção, uremia, hipercalcemia, constipação e hidratação proporcional ao objetivo.",
        meds: "Ondansetrona 0,15 mg/kg/dose VO/EV a cada 8 h, dose máxima usual 8 mg por dose; ou haloperidol 0,01 a 0,02 mg/kg/dose VO/SC a cada 12 a 24 h em caso selecionado.",
      },
      constipation: {
        nonpharm: "Pesquisar evacuação, fecaloma, dor abdominal e escape fecal; tratar constipação antes de escalar antiemético.",
        meds: "Usar antiemético conforme mecanismo e plano intestinal proporcional; evitar metoclopramida se houver suspeita de obstrução completa.",
      },
      anxiety: {
        nonpharm: "Ambiente calmo, alimentos frios ou mornos, pequenas porções, cuidado com odores e presença de cuidador de referência.",
        meds: "Se náusea persistir, escolher antiemético conforme mecanismo provável; ondansetrona pode ser considerada quando indicado e disponível.",
      },
    },
  },
  vomiting: {
    title: "Fluxo decisório interativo dos vômitos",
    stepLabel: "Situação predominante",
    defaultContext: "intermittent",
    alerts: [
      "Vômitos persistentes com desidratação, prostração ou piora rápida",
      "Vômitos biliosos, sangue, distensão importante ou parada de gases/fezes",
      "Cefaleia intensa, sonolência, vômitos em jato ou alteração neurológica",
    ],
    contexts: [
      { value: "intermittent", label: "Intermitente/leve" },
      { value: "persistent", label: "Persistente" },
      { value: "obstruction", label: "Suspeita de obstrução" },
      { value: "feeding", label: "Relacionado à alimentação" },
    ],
    recommendations: {
      intermittent: {
        nonpharm: "Ofertar pequenos volumes, reduzir odores, pausar dieta se piorar desconforto e revisar medicamentos.",
        meds: "Ondansetrona 0,15 mg/kg/dose VO/EV a cada 8 h se necessário; monitorar constipação e intervalo QT.",
      },
      persistent: {
        nonpharm: "Avaliar hidratação proporcional, aspiração, constipação, distensão, cefaleia, dor e impacto no conforto.",
        meds: "Escolher antiemético pelo mecanismo: ondansetrona, metoclopramida se estase sem obstrução, ou haloperidol em caso selecionado químico/metabólico.",
      },
      obstruction: {
        nonpharm: "Interromper alimentação forçada, proteger via aérea, avaliar distensão/dor e discutir objetivo de cuidado.",
        meds: "Interromper fluxo habitual e solicitar avaliação dirigida. Evitar metoclopramida se obstrução completa for possível.",
      },
      feeding: {
        nonpharm: "Reduzir volume, fracionar, ajustar textura/velocidade, revisar refluxo e evitar insistência alimentar desproporcional.",
        meds: "Se suspeita de estase gástrica sem obstrução, metoclopramida 0,1 a 0,15 mg/kg/dose a cada 6 a 8 h pode ser considerada.",
      },
    },
  },
  diarrhea: {
    title: "Fluxo decisório interativo da diarreia",
    stepLabel: "Causa provável",
    defaultContext: "medication",
    alerts: [
      "Sangue, febre alta, dor abdominal intensa ou distensão",
      "Desidratação, sonolência, queda importante do estado geral ou piora rápida",
      "Suspeita de impactação fecal com escape ou obstrução",
    ],
    contexts: [
      { value: "medication", label: "Laxativos/antibióticos/dieta" },
      { value: "infectious", label: "Suspeita infecciosa" },
      { value: "overflow", label: "Escape por fecaloma" },
      { value: "skin", label: "Lesão de pele associada" },
    ],
    recommendations: {
      medication: {
        nonpharm: "Revisar laxativos, antibióticos, dieta, fórmula, sorbitol e hidratação proporcional.",
        meds: "Solução de reidratação oral em pequenos volumes frequentes conforme sede, perdas, tolerância e objetivo de cuidado.",
      },
      infectious: {
        nonpharm: "Higiene de mãos, proteção de pele, hidratação proporcional e monitorização de febre, sangue e dor.",
        meds: "Evitar antidiarreico automático; priorizar avaliação dirigida se houver febre, sangue, dor importante ou desidratação.",
      },
      overflow: {
        nonpharm: "Pesquisar fecaloma, distensão, dor, náuseas/vômitos e escape fecal antes de tratar como diarreia simples.",
        meds: "Evitar antidiarreico; tratar impactação conforme avaliação clínica, conforto e segurança da mucosa.",
      },
      skin: {
        nonpharm: "Higiene suave, secagem cuidadosa, trocas frequentes, barreira cutânea e redução de atrito.",
        meds: "Óxido de zinco tópico pode ser aplicado em camada fina a cada troca se houver dermatite por umidade.",
      },
    },
  },
};

const prescriptionRouteMedicationDetails = {
  "pain-dipyrone": {
    oral: "Dipirona 500 mg a 1 g VO a cada 6 h.",
    subcutaneous: "Dipirona 500 mg a 1 g por via SC a cada 6 h, conforme protocolo local e tolerância do sítio.",
    intravenous: "Dipirona 500 mg a 1 g EV a cada 6 h, conforme protocolo local e monitoramento.",
    tube: "Dipirona 500 mg a 1 g por sonda/gastrostomia a cada 6 h, diluir e lavar a sonda antes e após.",
  },
  "pain-paracetamol": {
    oral: "Paracetamol 500 mg a 750 mg VO a cada 6 h.",
    rectal: "Paracetamol 500 mg a 750 mg por via retal a cada 6 h, se apresentação compatível.",
    tube: "Paracetamol 500 mg a 750 mg por sonda/gastrostomia a cada 6 h, diluir e lavar a sonda antes e após.",
  },
  "pain-ibuprofen": {
    oral: "Ibuprofeno 200 mg a 400 mg VO a cada 6 a 8 h, se baixo risco renal, gástrico e cardiovascular.",
    rectal: "Ibuprofeno 200 mg a 400 mg por via retal a cada 6 a 8 h, se apresentação compatível e sem contraindicação.",
  },
  "pain-codeine": {
    oral: "Codeína 15 mg a 30 mg VO a cada 4 a 6 h, se apropriado; monitorar constipação, náusea e sedação.",
    rectal: "Codeína 15 mg a 30 mg por via retal a cada 4 a 6 h, considerando absorção variável e monitoramento clínico.",
    tube: "Codeína 15 mg a 30 mg por sonda/gastrostomia a cada 4 a 6 h, se apresentação compatível; lavar a sonda antes e após.",
  },
  "pain-morphine": {
    oral: "Morfina 2,5 mg a 5 mg VO como posologia de referência, com reavaliação e titulação conforme resposta.",
    subcutaneous: "Morfina 1 mg a 2 mg SC como posologia de referência, com reavaliação e titulação conforme resposta.",
    intravenous: "Morfina 1 mg a 2 mg EV como posologia de referência em ambiente monitorado, com reavaliação e titulação conforme resposta.",
    rectal: "Morfina 2,5 mg a 5 mg por via retal como posologia de referência, considerando absorção variável e titulação conforme resposta.",
    tube: "Morfina 2,5 mg a 5 mg por sonda/gastrostomia como posologia de referência, diluir e lavar a sonda antes e após.",
  },
  "pain-amitriptyline": {
    oral: "Amitriptilina 10 mg VO à noite como posologia de referência em pessoa idosa/frágil; monitorar sedação, boca seca, retenção urinária e quedas.",
    tube: "Amitriptilina 10 mg por sonda/gastrostomia à noite apenas se apresentação compatível; confirmar possibilidade de trituração.",
  },
  "pain-gabapentin": {
    oral: "Gabapentina 100 mg a 300 mg VO à noite como posologia de referência; ajustar por idade, sonolência e função renal.",
    tube: "Gabapentina 100 mg a 300 mg por sonda/gastrostomia à noite se apresentação compatível; lavar a sonda antes e após.",
  },
  "dyspnea-morphine": {
    oral: "Morfina 2,5 mg a 5 mg VO para dispneia moderada/intensa, com reavaliação.",
    subcutaneous: "Morfina 1 mg a 2 mg SC para dispneia moderada/intensa, com reavaliação.",
    intravenous: "Morfina 1 mg a 2 mg EV para dispneia moderada/intensa em ambiente monitorado, com reavaliação.",
    tube: "Morfina 2,5 mg a 5 mg por sonda/gastrostomia para dispneia, diluir e lavar a sonda antes e após.",
  },
  "dyspnea-bronchodilator": {
    oral: "Se broncoespasmo, preferir via inalatória/nebulização; esta opção não é prescrição oral direta.",
    tube: "Se broncoespasmo, preferir via inalatória/nebulização; esta opção não é administrada por sonda.",
  },
  "dyspnea-benzodiazepine": {
    oral: "Diazepam 5 mg VO em dispneia com pânico/ansiedade intensa, se apropriado; monitorar sedação e delirium.",
    subcutaneous: "Midazolam SC em baixa dose conforme protocolo local se crise de dispneia com ansiedade importante.",
    tube: "Diazepam por sonda/gastrostomia apenas se apresentação compatível; monitorar sedação e delirium.",
  },
  "cough-codeine": {
    oral: "Codeína 10 mg a 20 mg VO a cada 4 a 6 h se tosse seca/refratária e uso for apropriado.",
    rectal: "Codeína 10 mg a 20 mg por via retal a cada 4 a 6 h se tosse seca/refratária, considerando absorção variável.",
    tube: "Codeína 10 mg a 20 mg por sonda/gastrostomia a cada 4 a 6 h se apresentação compatível; lavar a sonda antes e após.",
  },
  "cough-ipratropium": {
    oral: "Se secreção/broncoespasmo, preferir ipratrópio por via inalatória/nebulização; esta opção não é prescrição oral direta.",
    tube: "Se secreção/broncoespasmo, preferir ipratrópio por via inalatória/nebulização; esta opção não é administrada por sonda.",
  },
  "nausea-metoclopramide": {
    oral: "Metoclopramida 10 mg VO a cada 8 h, evitando se obstrução completa ou sintomas extrapiramidais.",
    subcutaneous: "Metoclopramida 10 mg SC a cada 8 h, evitando se obstrução completa ou sintomas extrapiramidais.",
    intravenous: "Metoclopramida 10 mg EV a cada 8 h, evitando se obstrução completa ou sintomas extrapiramidais.",
    rectal: "Metoclopramida 10 mg por via retal a cada 8 h, evitando se obstrução completa ou sintomas extrapiramidais.",
    tube: "Metoclopramida 10 mg por sonda/gastrostomia a cada 8 h, diluir e lavar a sonda antes e após.",
  },
  "nausea-haloperidol": {
    oral: "Haloperidol 0,5 mg a 1 mg VO à noite ou a cada 12 h, titulando resposta.",
    subcutaneous: "Haloperidol 0,5 mg a 1 mg SC à noite ou a cada 12 h, titulando resposta.",
    rectal: "Haloperidol 0,5 mg a 1 mg por via retal à noite ou a cada 12 h, considerando absorção variável.",
    tube: "Haloperidol 0,5 mg a 1 mg por sonda/gastrostomia à noite ou a cada 12 h, se apresentação compatível.",
  },
  "nausea-ondansetron": {
    oral: "Ondansetrona 4 mg a 8 mg VO a cada 8 a 12 h quando indicada; observar constipação.",
    intravenous: "Ondansetrona 4 mg a 8 mg EV a cada 8 a 12 h quando indicada; observar constipação e intervalo QT.",
    tube: "Ondansetrona 4 mg a 8 mg por sonda/gastrostomia a cada 8 a 12 h, se apresentação compatível; observar constipação.",
  },
  "constipation-laxative": {
    oral: "Usar opção presente na RENAME conforme padrão intestinal, como lactulose, óleo mineral, sulfato de magnésio ou Plantago ovata.",
    tube: "Usar laxativo presente na RENAME por sonda/gastrostomia apenas se apresentação compatível; diluir e lavar a sonda antes e após.",
  },
  "constipation-glycerol": {
    rectal: "Glicerol por via retal se constipação intensa e sem contraindicação local.",
  },
  "constipation-rectal": {
    rectal: "Supositório de glicerina, enema ou remoção retal se fecaloma, respeitando conforto, plaquetas e mucosa.",
  },
  "diarrhea-hydration": {
    oral: "Reposição oral proporcional de líquidos e eletrólitos conforme tolerância e objetivo de cuidado.",
    subcutaneous: "Hidratação SC proporcional se via oral insuficiente e objetivo de cuidado justificar.",
    intravenous: "Reposição EV proporcional de líquidos e eletrólitos quando houver indicação clínica, acesso venoso e monitoramento.",
    tube: "Reposição hídrica por sonda/gastrostomia conforme tolerância, risco de broncoaspiração e objetivo de cuidado.",
  },
  "diarrhea-codeine": {
    oral: "Codeína em baixa dose VO em caso selecionado, observando sedação, constipação e náuseas.",
    rectal: "Codeína por via retal em caso selecionado, considerando absorção variável e monitoramento clínico.",
    tube: "Codeína por sonda/gastrostomia em caso selecionado, se apresentação compatível; lavar a sonda antes e após.",
  },
  "anxiety-diazepam": {
    oral: "Diazepam 5 mg VO em crise selecionada; monitorar sedação, respiração e risco de delirium.",
    rectal: "Diazepam 5 mg a 10 mg por via retal em crise selecionada; monitorar sedação, respiração e risco de delirium.",
    tube: "Diazepam por sonda/gastrostomia apenas se apresentação compatível; monitorar sedação e respiração.",
  },
  "anxiety-midazolam": {
    subcutaneous: "Midazolam SC em crise/refratariedade conforme protocolo local e monitorização clínica.",
    intravenous: "Midazolam EV em crise/refratariedade apenas em ambiente monitorado e conforme protocolo local.",
  },
  "delirium-haloperidol": {
    oral: "Haloperidol 0,5 mg a 1 mg VO a cada 12 a 24 h, titulando por sintomas e efeitos adversos.",
    subcutaneous: "Haloperidol 0,5 mg a 1 mg SC a cada 12 a 24 h, titulando por sintomas e efeitos adversos.",
    rectal: "Haloperidol 0,5 mg a 1 mg por via retal a cada 12 a 24 h, considerando absorção variável.",
    tube: "Haloperidol 0,5 mg a 1 mg por sonda/gastrostomia a cada 12 a 24 h, se apresentação compatível.",
  },
  "delirium-quetiapine": {
    oral: "Quetiapina 12,5 mg a 25 mg VO à noite em caso selecionado.",
    tube: "Quetiapina por sonda/gastrostomia apenas se a apresentação puder ser administrada por sonda; confirmar antes de triturar.",
  },
  "secretions-atropine": {
    subcutaneous: "Sulfato de atropina conforme protocolo local para secreções/sororoca; monitorar efeitos anticolinérgicos.",
  },
  "fatigue-dexamethasone": {
    oral: "Dexametasona 2 mg a 4 mg VO pela manhã por curto período se meta definida.",
    subcutaneous: "Dexametasona 2 mg a 4 mg SC pela manhã por curto período conforme protocolo local.",
    intravenous: "Dexametasona 2 mg a 4 mg EV pela manhã por curto período conforme protocolo local.",
    tube: "Dexametasona 2 mg a 4 mg por sonda/gastrostomia pela manhã, se apresentação compatível.",
  },
  "anorexia-dexamethasone": {
    oral: "Dexametasona 2 mg a 4 mg VO pela manhã por curto período se benefício esperado.",
    subcutaneous: "Dexametasona 2 mg a 4 mg SC pela manhã por curto período conforme protocolo local.",
    intravenous: "Dexametasona 2 mg a 4 mg EV pela manhã por curto período conforme protocolo local.",
    tube: "Dexametasona 2 mg a 4 mg por sonda/gastrostomia pela manhã, se apresentação compatível.",
  },
  "anorexia-comfort": {
    oral: "Não há fármaco oral de rotina; priorizar conforto alimentar, boca úmida e sintoma-alvo claro.",
    subcutaneous: "Não há fármaco SC de rotina; usar via SC apenas para sintoma-alvo claro.",
    rectal: "Não há fármaco retal de rotina para síndrome de anorexia-caquexia em fim de vida.",
    tube: "Evitar alimentação ou medicamentos por sonda sem benefício proporcional; priorizar conforto e objetivo de cuidado.",
  },
};

const mechanismRecommendations = {
  nociceptive: {
    label: "nociceptiva",
    text:
      "Confirmar impacto funcional, iniciar medidas não medicamentosas e considerar analgésicos não opioides, observando contraindicações, resposta clínica e eventos adversos.",
    actions: [
      "Registrar intensidade, função, sono, humor e tratamentos prévios.",
      "Associar educação, atividade física possível e estratégias de autocuidado.",
      "Considerar AINE apenas quando indicado e seguro para o perfil clínico.",
    ],
  },
  neuropathic: {
    label: "neuropática",
    text:
      "Pesquisar descritores neuropáticos, examinar sensibilidade e considerar adjuvantes analgésicos conforme perfil clínico e tolerabilidade.",
    actions: [
      "Aplicar DN4 ou LANSS quando houver dúvida sobre componente neuropático.",
      "Considerar anticonvulsivantes ou antidepressivos usados para dor neuropática.",
      "Titular gradualmente e monitorar sedação, tontura, quedas e interações.",
    ],
  },
  nociplastic: {
    label: "nociplástica",
    text:
      "Priorizar abordagem multimodal, educação e reabilitação possível; opioides são desencorajados e relaxante muscular não é recomendado para esse mecanismo.",
    actions: [
      "Avaliar sono, humor, fadiga, catastrofização e sensibilização central.",
      "Considerar ISRSN, gabapentinoides ou antidepressivos tricíclicos quando apropriado.",
      "Definir metas funcionais pequenas e reavaliar adesão e tolerabilidade.",
    ],
  },
  mixed: {
    label: "mista",
    text:
      "Integrar os componentes fenotípicos predominantes e priorizar medidas conforme os mecanismos de maior peso, metas de cuidado e tolerabilidade.",
    actions: [
      "Revisar quais fenótipos estão contribuindo mais para a dor.",
      "Combinar estratégias de manejo de forma proporcional aos componentes identificados.",
      "Reavaliar resposta funcional, eventos adversos e necessidade de ajuste do plano.",
    ],
  },
};

const intensityLabels = {
  mild: "leve",
  moderate: "moderada",
  severe: "forte",
};

const medicationGroups = {
  simpleAnalgesics: [
    "Paracetamol: 500 mg, 1 a 2 comprimidos, 3 a 4 vezes/dia.",
    "Dipirona: 500 mg, 1 a 2 comprimidos, até 4 vezes/dia.",
  ],
  antiInflammatories: [
    "Ibuprofeno: 200 a 600 mg, 3 a 4 vezes/dia.",
    "Naproxeno: 250 mg, 1 a 2 vezes/dia.",
    "Omeprazol: 10 a 20 mg antes do café da manhã quando houver indicação de gastroproteção.",
  ],
  neuropathicAdjuvants: [
    "Amitriptilina: 25 mg/dia; em idosos, 10 mg/dia.",
    "Nortriptilina: 25 mg/dia; em idosos, 10 a 25 mg/dia.",
    "Clomipramina: 10 mg/dia.",
    "Gabapentina: 300 mg à noite ou 300 mg 3 vezes/dia, conforme tolerabilidade e função renal.",
    "Carbamazepina: 200 a 400 mg/dia; em idosos, 100 mg 2 vezes/dia.",
    "Fenitoína: 100 mg, 3 vezes/dia.",
    "Ácido valproico/valproato de sódio: 250 mg/dia.",
    "Lidocaína tópica: considerar em dor neuropática periférica localizada.",
  ],
  nociplasticAdjuvants: [
    "Amitriptilina: 25 mg/dia; em idosos, 10 mg/dia.",
    "Nortriptilina: 25 mg/dia; em idosos, 10 a 25 mg/dia.",
    "Clomipramina: 10 mg/dia.",
    "Gabapentina: 300 mg à noite ou 300 mg 3 vezes/dia, conforme tolerabilidade e função renal.",
  ],
  opioids: [
    "Codeína: 30 mg, 3 a 4 vezes/dia; em idosos, 15 mg a cada 4 h.",
    "Morfina oral de ação curta: 5 mg a cada 4 h.",
  ],
};

const medicationPlanMap = {
  nociceptive: {
    mild: ["simpleAnalgesics", "antiInflammatories"],
    moderate: ["simpleAnalgesics", "antiInflammatories", "opioids"],
    severe: ["simpleAnalgesics", "antiInflammatories", "opioids"],
  },
  neuropathic: {
    mild: ["neuropathicAdjuvants", "simpleAnalgesics"],
    moderate: ["neuropathicAdjuvants", "simpleAnalgesics", "antiInflammatories"],
    severe: ["neuropathicAdjuvants", "simpleAnalgesics", "antiInflammatories", "opioids"],
  },
  nociplastic: {
    mild: ["nociplasticAdjuvants"],
    moderate: ["nociplasticAdjuvants", "simpleAnalgesics"],
    severe: ["nociplasticAdjuvants", "simpleAnalgesics"],
  },
  mixed: {
    mild: ["simpleAnalgesics", "neuropathicAdjuvants"],
    moderate: ["simpleAnalgesics", "antiInflammatories", "neuropathicAdjuvants"],
    severe: ["simpleAnalgesics", "antiInflammatories", "neuropathicAdjuvants", "opioids"],
  },
};

const medicationGroupLabels = {
  simpleAnalgesics: "Analgésicos simples/não opioides",
  antiInflammatories: "AINEs e gastroproteção quando indicada",
  neuropathicAdjuvants: "Adjuvantes para componente neuropático",
  nociplasticAdjuvants: "Adjuvantes para componente nociplástico",
  opioids: "Opioides quando dor moderada/forte, refratária ou contexto paliativo justificar",
};

const medicationAssociationGuidance = {
  nociceptive: {
    mild:
      "Grupo de medicamentos sugerido: iniciar com analgésico simples/não opioide. Associar AINE apenas se houver componente inflamatório e baixo risco renal, gástrico e cardiovascular.",
    moderate:
      "Grupos de medicamentos sugeridos: analgésico simples/não opioide + AINE se indicado. Considerar opioide leve apenas se dor moderada persistir apesar de estratégia inicial adequada.",
    severe:
      "Grupos de medicamentos sugeridos: analgésico simples/não opioide + AINE se seguro + opioide quando dor forte ou refratária justificar, com reavaliação estreita.",
  },
  neuropathic: {
    mild:
      "Grupos de medicamentos sugeridos: adjuvante para dor neuropática. Associar analgésico simples se houver componente nociceptivo concomitante.",
    moderate:
      "Grupos de medicamentos sugeridos: adjuvante neuropático + analgésico simples se componente nociceptivo. Associar AINE apenas se houver inflamação ou dor musculoesquelética associada.",
    severe:
      "Grupos de medicamentos sugeridos: adjuvante neuropático + analgésico simples/AINE se componente nociceptivo + opioide apenas se dor forte refratária ou contexto paliativo justificar.",
  },
  nociplastic: {
    mild:
      "Grupo de medicamentos sugerido: adjuvante para dor nociplástica quando medicamento for necessário; priorizar menor carga medicamentosa eficaz.",
    moderate:
      "Grupos de medicamentos sugeridos: adjuvante para dor nociplástica + analgésico simples se houver dor periférica associada. Evitar opioide como rotina.",
    severe:
      "Grupos de medicamentos sugeridos: adjuvante para dor nociplástica + analgésico simples se componente periférico coexistir; dor forte persistente pede revisão diagnóstica e plano multimodal.",
  },
  mixed: {
    mild:
      "Grupos de medicamentos sugeridos: analgésico simples para componente nociceptivo + adjuvante se houver componente neuropático/nociplástico relevante.",
    moderate:
      "Grupos de medicamentos sugeridos: analgésico simples + AINE se inflamatório + adjuvante conforme componente neuropático/nociplástico predominante.",
    severe:
      "Grupos de medicamentos sugeridos: analgésico simples + AINE se seguro + adjuvante para componente neuropático/nociplástico + opioide se dor forte refratária justificar.",
  },
};

function getMedicationPlan(mechanism, intensity, phenotype) {
  const groupKeys = [...(medicationPlanMap[mechanism]?.[intensity] || [])];

  return {
    guidance: medicationAssociationGuidance[mechanism]?.[intensity],
    groups: groupKeys.map((key) => ({
      title: medicationGroupLabels[key],
      options: medicationGroups[key],
    })),
    safety: [
      "Não usar todas as opções em conjunto: selecionar uma estratégia, titular gradualmente e atribuir resposta/eventos adversos.",
      "Segurança antes de prescrever: revisar alergias, idade, gestação, função renal/hepática, risco gastrointestinal/cardiovascular, interações, opioides em uso, constipação, sedação e disponibilidade na RENAME/local.",
      "Na dor nociplástica, opioides são desencorajados e relaxantes musculares não são recomendados como rotina.",
    ],
  };
}

const nonMedicationPlanMap = {
  nociceptive: {
    mild: [
      "Tratamento não medicamentoso: educação em dor, manutenção de atividade possível, ergonomia, pacing e metas funcionais graduais.",
      "Considerar fisioterapia estruturada, fortalecimento, mobilidade, alongamento, calor/frio ou TENS conforme localização, função e resposta.",
    ],
    moderate: [
      "Tratamento não medicamentoso: combinar fisioterapia/exercício estruturado com educação em dor e plano de autocuidado.",
      "Se houver medo de movimento, incapacidade ou evitação, associar TCC, mindfulness ou abordagem psicológica focada em enfrentamento.",
    ],
    severe: [
      "Tratamento não medicamentoso: revisar sinais de alerta, perda funcional e necessidade de avaliação presencial antes de intensificar atividades.",
      "Após segurança clínica, usar plano graduado com fisioterapia, metas pequenas e suporte psicossocial para reduzir sofrimento e incapacidade.",
    ],
  },
  neuropathic: {
    mild: [
      "Tratamento não medicamentoso: educação sobre dor neuropática, proteção da área sensível, dessensibilização gradual e cuidado com pele.",
      "Considerar fisioterapia, TENS ou terapia ocupacional se houver limitação funcional, alteração sensitiva ou impacto em atividades.",
    ],
    moderate: [
      "Tratamento não medicamentoso: associar reabilitação funcional, estratégias de dessensibilização e suporte psicológico se houver sofrimento ou evitação.",
      "Avaliar sono, humor, segurança para marcha, quedas e adaptação de atividades.",
    ],
    severe: [
      "Tratamento não medicamentoso: dor neuropática forte pede revisão diagnóstica, exame neurológico dirigido e plano de segurança.",
      "Combinar reabilitação, suporte psicológico e manejo de sono/fadiga, com encaminhamento especializado quando houver refratariedade.",
    ],
  },
  nociplastic: {
    mild: [
      "Tratamento não medicamentoso: priorizar educação em dor, atividade física gradual, higiene do sono, manejo de estresse e metas funcionais.",
      "Evitar repouso prolongado; trabalhar retorno progressivo às atividades com pacing.",
    ],
    moderate: [
      "Tratamento não medicamentoso: programa multimodal com exercício/fisioterapia estruturada + TCC, mindfulness ou aceitação e compromisso.",
      "Abordar catastrofização, fadiga, sono, humor, medo de movimento e participação social.",
    ],
    severe: [
      "Tratamento não medicamentoso: dor nociplástica forte sugere plano multimodal intensivo, com metas pequenas, suporte psicológico e reavaliação frequente.",
      "Revisar diagnóstico, sinais de alerta, sofrimento psíquico e barreiras de adesão antes de aumentar carga medicamentosa.",
    ],
  },
  mixed: {
    mild: [
      "Tratamento não medicamentoso: selecionar intervenções conforme os componentes predominantes, combinando educação, atividade gradual e autocuidado.",
      "Mapear qual componente mais limita função para escolher a primeira meta terapêutica.",
    ],
    moderate: [
      "Tratamento não medicamentoso: programa multimodal proporcional aos fenótipos identificados, com fisioterapia/exercício e suporte psicológico quando indicado.",
      "Reavaliar função, sono, humor, adesão e barreiras sociais ao cuidado.",
    ],
    severe: [
      "Tratamento não medicamentoso: dor mista forte pede revisão integrada, metas de curto prazo e eventual avaliação multiprofissional/especializada.",
      "Combinar reabilitação, suporte psicossocial e medidas de conforto, sem atrasar investigação de sinais de alerta.",
    ],
  },
};

function getNonMedicationActions(mechanism, intensity) {
  return [
    "Tratamento não medicamentoso sugerido:",
    ...(nonMedicationPlanMap[mechanism]?.[intensity] || []),
    "Desfechos a acompanhar: intensidade, função, sono, humor, autonomia, qualidade de vida e adesão.",
  ];
}

const phytotherapyPlanMap = {
  nociceptive: [
    "Fitoterapia: pode ser considerada como complemento em dor musculoesquelética/inflamatória leve a moderada, quando houver produto seguro, identificação correta e acompanhamento.",
    "Opções presentes na Rename, como garra-do-diabo e salgueiro, exigem individualização, revisão de contraindicações e risco de interação.",
  ],
  neuropathic: [
    "Fitoterapia: não deve substituir investigação de lesão neural nem tratamento neuropático quando indicado.",
    "Se houver uso de plantas, registrar produto, dose, origem e monitorar sedação, tontura, alergia, interação e impacto funcional.",
  ],
  nociplastic: [
    "Fitoterapia: pode ser considerada apenas como apoio a sintomas associados, como sono, tensão ou bem-estar, dentro de plano multimodal.",
    "Priorizar educação, exercício gradual e estratégias psicológicas; evitar prometer efeito analgésico direto consistente.",
  ],
  mixed: [
    "Fitoterapia: individualizar conforme o componente predominante e revisar todos os produtos já usados pela pessoa.",
    "Evitar misturas sem identificação, automedicação prolongada e associação com anticoagulantes, sedativos, AINEs ou múltiplos fármacos sem revisão.",
  ],
};

const phytotherapyDoseMap = {
  nociceptive: [
    "Garra-do-diabo: iniciar com produto padronizado equivalente a 30 mg/dia de harpagosídeo; em apresentações de 480 mg, usar 1 comprimido VO 2 vezes ao dia quando essa equivalência estiver no rótulo ou na formulação.",
    "Salgueiro: iniciar com extrato padronizado contendo 60 mg de salicina, 1 comprimido VO 1 vez ao dia; evitar associação com salicilatos, anticoagulantes ou antiagregantes sem avaliação clínica.",
  ],
  neuropathic: [
    "Não há posologia fitoterápica específica sugerida para dor neuropática neste fluxo; se houver uso de produto vegetal, registrar dose, apresentação e monitorar interações.",
  ],
  nociplastic: [
    "Não há posologia fitoterápica analgésica específica sugerida para dor nociplástica neste fluxo; priorizar plano multimodal e usar fitoterapia apenas para sintoma-alvo definido.",
  ],
  mixed: [
    "Se houver componente musculoesquelético/inflamatório predominante: garra-do-diabo, produto padronizado equivalente a 30 mg/dia de harpagosídeo; em apresentações de 480 mg, 1 comprimido VO 2 vezes ao dia quando compatível com a formulação.",
    "Se houver indicação e baixo risco de interação: salgueiro, extrato padronizado contendo 60 mg de salicina, 1 comprimido VO 1 vez ao dia; evitar em risco hemorrágico, doença ulcerosa, doença renal, anticoagulação, gestação e alergia a salicilatos.",
  ],
};

function getPhytotherapyActions(mechanism, intensity) {
  const extra =
    intensity === "severe"
      ? "Se a dor for forte, fitoterapia não deve atrasar reavaliação clínica, analgesia proporcional ou encaminhamento quando necessário."
      : "Definir prazo de teste, benefício esperado e critérios de suspensão.";

  return [
    "Fitoterapia, quando apropriada:",
    ...(phytotherapyPlanMap[mechanism] || []),
    "Posologias, quando indicado e disponível:",
    ...(phytotherapyDoseMap[mechanism] || []),
    "Antes de usar: perguntar sobre chás, garrafadas, pomadas, cápsulas, tinturas e produtos comprados sem prescrição.",
    extra,
  ];
}

const painPhenotypeTreatmentProfiles = {
  somatic: {
    focus: "Dor nociceptiva somática: priorizar função, mobilidade, tratamento de componente inflamatório/mecânico e analgesia simples como base.",
    nonMedication: [
      "Direcionar fisioterapia, exercício terapêutico, calor/frio, TENS, ergonomia e metas graduais conforme estrutura dolorosa e tolerância.",
    ],
    medication: [
      "Iniciar com analgésico simples; associar AINE apenas se houver componente inflamatório e baixo risco renal, gástrico e cardiovascular.",
    ],
  },
  visceral: {
    focus: "Dor nociceptiva visceral: procurar distensão, espasmo, obstrução, constipação, retenção urinária, ascite ou causa orgânica tratável.",
    nonMedication: [
      "Ajustar posição, alimentação, evacuação, manejo de constipação/retenção e conforto abdominal conforme causa provável e objetivo de cuidado.",
    ],
    medication: [
      "Usar analgésico simples como base; se dor em cólica/espasmo, considerar antiespasmódico disponível no serviço e protocolo local; se moderada/forte, avaliar opioide proporcional.",
    ],
  },
  neuropathic: {
    focus: "Dor neuropática: tratar componente somatossensorial com adjuvante e evitar depender apenas de analgésico simples ou opioide.",
    nonMedication: [
      "Proteger área alodínica, dessensibilizar gradualmente, adaptar atividades e avaliar marcha, quedas, sono e humor.",
    ],
    medication: [
      "Escolher um adjuvante inicial, como antidepressivo tricíclico ou anticonvulsivante, titular devagar e monitorar sedação, tontura, quedas e função renal.",
    ],
  },
  nociplastic: {
    focus: "Dor nociplástica: priorizar abordagem multimodal, educação, sono, atividade gradual e sofrimento emocional; evitar opioide como rotina.",
    nonMedication: [
      "Combinar educação em dor, pacing, atividade física gradual, higiene do sono, TCC/mindfulness quando disponível e metas pequenas de função.",
    ],
    medication: [
      "Quando medicamento for necessário, preferir adjuvante com menor carga eficaz; evitar escalonamento de opioide sem revisão diagnóstica.",
    ],
  },
  mixed: {
    focus: "Dor mista: selecionar os componentes que mais explicam sofrimento e incapacidade, evitando somar todos os medicamentos ao mesmo tempo.",
    nonMedication: [
      "Definir a primeira meta funcional e combinar reabilitação, educação, apoio emocional e medidas de conforto conforme componente predominante.",
    ],
    medication: [
      "Combinar analgésico simples, adjuvante e opioide apenas quando cada grupo tiver alvo claro; introduzir uma mudança por vez sempre que possível.",
    ],
  },
};

function buildCombinedPainDecision(mechanism, intensity, phenotype) {
  const profileKey = phenotype || mechanism;
  const profile = painPhenotypeTreatmentProfiles[profileKey] || painPhenotypeTreatmentProfiles[mechanism];

  return {
    focus: [profile.focus],
    nonMedication: profile.nonMedication,
    medication: profile.medication,
  };
}

function createResultItem(text) {
  const item = document.createElement("li");
  item.textContent = text;
  return item;
}

function createResultSection(title, items, modifier) {
  const section = document.createElement("li");
  section.className = `result-section result-section--${modifier}`;

  const heading = document.createElement("h4");
  heading.textContent = title;

  const list = document.createElement("ul");
  list.replaceChildren(...items.map(createResultItem));

  section.replaceChildren(heading, list);
  return section;
}

function splitPrefixedAction(actions, prefix) {
  const fullPrefix = `${prefix}:`;
  const match = actions.find((action) => action.startsWith(fullPrefix));
  if (!match) return [];
  return [match.slice(fullPrefix.length).trim()];
}

function createMedicationSection(plan) {
  const section = document.createElement("li");
  section.className = "result-section result-section--medication";

  const heading = document.createElement("h4");
  heading.textContent = "Tratamento medicamentoso: opções e posologias";

  const guidance = document.createElement("p");
  guidance.className = "result-section-guidance";
  guidance.textContent = plan.guidance;

  const groups = document.createElement("div");
  groups.className = "medication-group-grid";
  groups.replaceChildren(
    ...plan.groups.map((group) => {
      const card = document.createElement("article");
      card.className = "medication-group-card";

      const cardTitle = document.createElement("h5");
      cardTitle.textContent = group.title;

      const list = document.createElement("ul");
      list.replaceChildren(...group.options.map(createResultItem));

      card.replaceChildren(cardTitle, list);
      return card;
    })
  );

  const safety = document.createElement("ul");
  safety.className = "medication-safety-list";
  safety.replaceChildren(...plan.safety.map(createResultItem));

  section.replaceChildren(heading, guidance, groups, safety);
  return section;
}

const redFlagActions = {
  oncologic: "Investigar causa oncológica ou progressão de doença: exame dirigido, revisão de histórico, sinais sistêmicos e encaminhamento/avaliação prioritária conforme contexto.",
  neurologic: "Realizar avaliação neurológica imediata; déficit progressivo, alteração esfincteriana ou anestesia em sela exigem avaliação urgente.",
  infection: "Avaliar foco infeccioso e sinais sistêmicos; considerar exames e encaminhamento urgente se febre, imunossupressão ou instabilidade clínica.",
  fracture: "Suspender escalonamento isolado de analgesia e avaliar possibilidade de fratura, especialmente após trauma, osteoporose ou uso crônico de corticoide.",
  night: "Reavaliar etiologia da dor em repouso/noturna ou de piora rápida; considerar investigação dirigida antes de seguir fluxo analgésico habitual.",
  distress: "Priorizar plano de segurança, suporte ao cuidador, contato com equipe responsável e avaliação presencial se houver incapacidade súbita ou risco no domicílio.",
};

const coughAlertActions = {
  hemoptysis:
    "Interromper fluxo: avaliar hemoptise e risco de sangramento, revisar anticoagulantes/antiagregantes, estabilidade clínica, volume do sangramento e necessidade de avaliação presencial ou urgência.",
  respiratoryDistress:
    "Interromper fluxo: priorizar avaliação imediata de via aérea, oxigenação, dispneia intensa, estridor ou exaustão respiratória.",
  infection:
    "Interromper fluxo: investigar infecção respiratória, febre, secreção purulenta, imunossupressão e necessidade de antibiótico/exames conforme meta de cuidado.",
  aspiration:
    "Interromper fluxo: avaliar disfagia, broncoaspiração, segurança alimentar, posicionamento, consistências e necessidade de fonoaudiologia ou avaliação presencial.",
  chestPain:
    "Interromper fluxo: avaliar dor torácica, síncope, taquicardia ou suspeita de tromboembolismo antes de manejar apenas como tosse comum.",
};

const coughTypePlans = {
  productive: {
    title: "Tosse produtiva",
    text: "Priorizar eliminação segura de secreções e conforto respiratório, evitando supressão rotineira quando a tosse é útil.",
    actions: [
      "Causa provável: secreção, infecção, bronquiectasia, broncoaspiração, doença pulmonar obstrutiva ou fraqueza com tosse pouco eficaz.",
      "Conduta não medicamentosa: cabeceira elevada, hidratação proporcional, higiene oral, umidificação se ressecamento e higiene brônquica/fisioterapia quando confortável.",
      "Conduta medicamentosa: se secreção espessa e houver benefício esperado, considerar nebulização com cloreto de sódio 0,9%; se broncoespasmo associado, considerar salbutamol ou brometo de ipratrópio conforme prescrição e disponibilidade.",
      "Evitar antitussivo de rotina se a tosse estiver eliminando secreção de forma eficaz.",
    ],
  },
  dry: {
    title: "Tosse seca ou irritativa",
    text: "Buscar irritação de via aérea e causas reversíveis antes de suprimir o sintoma.",
    actions: [
      "Causa provável: irritação de via aérea, refluxo, gotejamento pós-nasal, broncoespasmo, medicamento em uso, tumor ou inflamação.",
      "Conduta não medicamentosa: reduzir fumaça, poeira, odores fortes e ar seco; elevar cabeceira se piora ao deitar; revisar tabagismo e medicamentos.",
      "Conduta medicamentosa: se tosse seca persistente gerar desconforto e não houver secreção útil, considerar codeína 10 mg VO a cada 6 horas como posologia de referência; titular para 10 mg a 20 mg até de 4/4 a 6/6 horas conforme resposta e tolerabilidade.",
      "Monitorar sonolência, constipação, náuseas, retenção urinária e interação com outros depressores do sistema nervoso central.",
    ],
  },
  secretions: {
    title: "Tosse com secreção excessiva",
    text: "Diferenciar secreção que precisa ser eliminada de secreção terminal ou excesso de secreção com tosse ineficaz.",
    actions: [
      "Causa provável: broncorreia, tosse ineficaz, disfagia, broncoaspiração, secreção terminal ou acúmulo por fraqueza.",
      "Conduta não medicamentosa: reposicionar, reduzir decúbito plano, cuidar da boca e associar higiene brônquica apenas se for confortável e proporcional.",
      "Conduta medicamentosa: se broncorreia ou componente obstrutivo, considerar brometo de ipratrópio por nebulização conforme prescrição; se secreção terminal com sofrimento, considerar atropina conforme via disponível e protocolo local.",
      "Monitorar boca seca, retenção urinária, delirium, constipação e espessamento excessivo de secreções.",
    ],
  },
  refractory: {
    title: "Tosse refratária",
    text: "Revisar causas tratáveis, carga de sofrimento e necessidade de abordagem combinada.",
    actions: [
      "Causa provável: tumor endobrônquico, derrame pleural, obstrução de via aérea, infecção, refluxo, gotejamento pós-nasal, IECA, broncoespasmo ou múltiplos fatores combinados.",
      "Conduta não medicamentosa: revisar gatilhos, posição, alimentação, aspiração, sono, dor e dispneia; pactuar objetivo realista de alívio.",
      "Conduta medicamentosa: se predominar tosse seca/irritativa e não houver secreção útil, considerar codeína 10 mg VO a cada 6 horas como posologia de referência, com titulação gradual conforme resposta.",
      "Se persistir sofrimento apesar das medidas proporcionais, discutir avaliação especializada, ajuste de metas e abordagem de causa obstrutiva, pleural ou tumoral quando compatível com o plano de cuidado.",
    ],
  },
};

const coughFactorActions = {
  ineffective: "Ajuste por fator associado: se a tosse for ineficaz, priorizar higiene brônquica, drenagem postural e fisioterapia respiratória quando confortáveis; evitar antitussivo diante de secreção retida importante.",
  bronchospasm: "Ajuste por fator associado: se houver broncoespasmo, revisar técnica inalatória e considerar salbutamol ou brometo de ipratrópio conforme prescrição, protocolo e disponibilidade.",
  refluxPostnasal: "Ajuste por fator associado: se houver refluxo ou gotejamento pós-nasal, elevar cabeceira, evitar refeições volumosas antes de deitar e tratar a causa provável conforme avaliação clínica.",
  acei: "Ajuste por fator associado: se houver uso de IECA, discutir substituição com a equipe responsável antes de escalonar antitussivo.",
  tumorPleural: "Ajuste por fator associado: se houver doença tumoral, pleural ou obstrutiva, revisar proporcionalidade de investigação, corticoide, abordagem de derrame/obstrução e metas de cuidado.",
};

const coughFactorTreatmentModifiers = {
  ineffective: {
    nonMedication: [
      "Como há tosse ineficaz ou acúmulo de secreção, priorizar higiene brônquica, drenagem postural e fisioterapia respiratória quando confortáveis.",
    ],
    medication: [
      "Evitar codeína ou outro antitussivo se houver secreção retida importante, pois a supressão pode piorar retenção e broncoaspiração.",
    ],
  },
  bronchospasm: {
    nonMedication: ["Checar técnica inalatória/nebulização, gatilhos ambientais e resposta prévia a broncodilatador."],
    medication: [
      "Associar broncodilatador quando houver sibilos ou broncoespasmo: salbutamol conforme prescrição/protocolo ou brometo de ipratrópio 20 a 40 gotas por nebulização como posologia de referência, quando indicado.",
    ],
  },
  refluxPostnasal: {
    nonMedication: [
      "Se houver refluxo ou gotejamento pós-nasal, elevar cabeceira, evitar refeições volumosas antes de deitar e revisar rinossinusite, secreção nasal e alimentação.",
    ],
    medication: ["Tratar refluxo, rinossinusite ou gotejamento conforme avaliação clínica antes de intensificar antitussivo."],
  },
  acei: {
    nonMedication: ["Relacionar início da tosse com introdução ou aumento de inibidor da enzima conversora de angiotensina."],
    medication: ["Discutir substituição do IECA com a equipe responsável; não escalonar antitussivo antes dessa revisão se a tosse for compatível."],
  },
  tumorPleural: {
    nonMedication: ["Alinhar investigação e intervenção ao objetivo de cuidado, sofrimento atual e possibilidade real de reversão."],
    medication: [
      "Se componente tumoral, pleural ou obstrutivo gerar tosse irritativa com sofrimento, considerar codeína 10 mg VO a cada 6 horas como posologia de referência quando não houver secreção útil.",
      "Discutir abordagem proporcional de derrame pleural, obstrução de via aérea ou inflamação conforme contexto clínico.",
    ],
  },
};

function buildCombinedCoughTreatment(plan, factors) {
  const decision = {
    cause: splitPrefixedAction(plan.actions, "Causa provável"),
    nonMedication: splitPrefixedAction(plan.actions, "Conduta não medicamentosa"),
    medication: splitPrefixedAction(plan.actions, "Conduta medicamentosa"),
    steps: [],
    notes: plan.actions.filter(
      (action) =>
        !action.startsWith("Causa provável:") &&
        !action.startsWith("Conduta não medicamentosa:") &&
        !action.startsWith("Conduta medicamentosa:")
    ),
  };

  factors.forEach((factor) => {
    const modifier = coughFactorTreatmentModifiers[factor];
    if (!modifier) return;
    decision.nonMedication.push(...modifier.nonMedication);
    decision.medication.push(...modifier.medication);
  });

  if (factors.includes("ineffective") && (plan.title.includes("produtiva") || plan.title.includes("secreção"))) {
    decision.notes.push("Decisão combinada: secreção presente com tosse ineficaz favorece mobilização de secreção e cautela com supressão da tosse.");
  }

  if (factors.includes("bronchospasm") && (plan.title.includes("seca") || plan.title.includes("refratária"))) {
    decision.notes.push("Decisão combinada: broncoespasmo associado deve ser tratado antes de considerar a tosse apenas como refratária.");
  }

  if (factors.includes("refluxPostnasal") && plan.title.includes("seca")) {
    decision.notes.push("Decisão combinada: tosse seca com piora ao deitar sugere tratar refluxo/gotejamento antes de aumentar antitussivo.");
  }

  if (plan.title.includes("produtiva")) {
    decision.steps.push(
      "Etapa 1: confirmar se a tosse está eliminando secreção de forma eficaz e afastar sinais de alerta.",
      "Etapa 2: iniciar medidas de posicionamento, hidratação proporcional, higiene oral e mobilização de secreções.",
      factors.includes("bronchospasm")
        ? "Etapa 3: se houver broncoespasmo, associar broncodilatador conforme prescrição; evitar antitussivo se houver secreção retida."
        : "Etapa 3: se secreção espessa persistir, considerar nebulização com cloreto de sódio 0,9% quando houver benefício esperado."
    );
  } else if (plan.title.includes("seca")) {
    decision.steps.push(
      "Etapa 1: reduzir gatilhos irritativos e revisar refluxo, gotejamento pós-nasal, broncoespasmo, tabagismo e medicamentos.",
      factors.includes("acei")
        ? "Etapa 2: se houver IECA, discutir substituição antes de escalar antitussivo."
        : "Etapa 2: tratar fator associado selecionado antes de intensificar antitussivo, quando houver causa provável.",
      "Etapa 3: se persistir tosse seca com sofrimento e sem secreção útil, considerar codeína 10 mg VO a cada 6 horas e reavaliar tolerabilidade."
    );
  } else if (plan.title.includes("secreção excessiva")) {
    decision.steps.push(
      "Etapa 1: diferenciar secreção eliminável de secreção terminal/sororoca e verificar se a tosse é eficaz.",
      "Etapa 2: reposicionar, cuidar da boca e usar higiene brônquica apenas se for confortável.",
      "Etapa 3: se broncorreia ou broncoespasmo, considerar ipratrópio; se secreção terminal com sofrimento, considerar atropina conforme via e protocolo."
    );
  } else if (plan.title.includes("refratária")) {
    decision.steps.push(
      "Etapa 1: revisar causas tratáveis e fatores associados selecionados, principalmente broncoespasmo, refluxo/gotejamento, IECA e doença pleural/obstrutiva.",
      "Etapa 2: otimizar medidas não medicamentosas e tratamento da causa provável antes de chamar a tosse de refratária.",
      "Etapa 3: se predominar tosse seca/irritativa sem secreção útil, considerar codeína 10 mg VO a cada 6 horas e discutir avaliação especializada se sofrimento persistir."
    );
  }

  return decision;
}

const dyspneaAlertActions = {
  severeDistress:
    "Interromper fluxo: priorizar avaliação imediata de via aérea, ventilação, oxigenação e sofrimento respiratório intenso.",
  newHypoxemia:
    "Interromper fluxo: avaliar hipoxemia nova ou progressiva, necessidade de oxigênio, causa reversível e segurança do local de cuidado.",
  chestPain:
    "Interromper fluxo: investigar dor torácica, síncope, taquicardia ou suspeita de tromboembolismo antes de seguir manejo sintomático habitual.",
  infection:
    "Interromper fluxo: avaliar infecção respiratória, febre, secreção purulenta, imunossupressão e necessidade de exames/antibiótico conforme meta de cuidado.",
  consciousness:
    "Interromper fluxo: avaliar rebaixamento, delirium, proteção de via aérea e risco de broncoaspiração, com suporte presencial conforme gravidade.",
};

const dyspneaIntensityPlans = {
  mrc0: {
    title: "mMRC/MRC 0: dispneia apenas com exercício intenso",
    text: "Sem limitação funcional relevante nas atividades habituais. Priorizar avaliação basal, educação e prevenção de piora.",
    actions: [
      "Registrar intensidade basal, gatilhos, padrão temporal e fatores de alívio.",
      "Orientar conservação de energia, atividade possível e pausas antes de esforços maiores.",
      "Rever broncoespasmo, anemia, descondicionamento, secreções, ansiedade e medicamentos.",
    ],
  },
  mrc1: {
    title: "mMRC/MRC 1: dispneia ao apressar o passo ou subir leve inclinação",
    text: "Limitação leve aos esforços. Priorizar medidas não farmacológicas e tratamento da causa provável.",
    actions: [
      "Planejar ritmo de atividade, pausas, posicionamento e respiração lenta durante esforço.",
      "Usar ventilador ou fluxo de ar frio na face se houver alívio percebido.",
      "Tratar causa provável quando proporcional: broncoespasmo, anemia, secreções, ansiedade ou descondicionamento.",
    ],
  },
  mrc2: {
    title: "mMRC/MRC 2: anda mais devagar ou para ao caminhar no próprio ritmo",
    text: "Limitação funcional moderada. Combinar medidas de conforto, conservação de energia e tratamento da causa provável.",
    actions: [
      "Associar posição, ventilador na face, conservação de energia, pausas e fisioterapia respiratória quando confortável.",
      "Oxigênio deve ser usado se houver hipoxemia ou benefício clínico claro.",
      "Em pessoa virgem de opioide, considerar codeína 30 mg VO de 6/6 h ou 4/4 h quando apropriado.",
    ],
  },
  mrc3: {
    title: "mMRC/MRC 3: para após cerca de 100 metros ou poucos minutos no plano",
    text: "Limitação importante. Reavaliar rapidamente causa, sofrimento, necessidade de resgate e segurança do plano domiciliar.",
    actions: [
      "Manter presença calma, reduzir estímulos, posicionar e usar ventilador/oxigênio conforme indicação.",
      "Considerar morfina 5 mg VO ou 2 mg EV/SC de 6/6 h ou 4/4 h, com titulação cuidadosa.",
      "Se já usa opioide, considerar aumento de 25% da dose basal e resgate de 10% a 15% da dose total diária para exacerbações.",
    ],
  },
  mrc4: {
    title: "mMRC/MRC 4: muito dispneico para sair de casa ou ao vestir-se/despir-se",
    text: "Limitação grave. Avaliar suporte, conforto, resgate, plano de urgência e possibilidade de refratariedade.",
    actions: [
      "Aplicar COMFORT: chamar ajuda, observar causas, medicar conforme prescrição, fan na face, oxigênio se indicado, relaxamento e reavaliação da resposta.",
      "Considerar morfina 5 mg VO ou 2 mg EV/SC de 6/6 h ou 4/4 h se dispneia moderada/intensa e prescrição for apropriada.",
      "Se dispneia grave persistir apesar de medidas proporcionais, discutir refratariedade e possibilidade de sedação paliativa no contexto adequado.",
    ],
  },
};

const dyspneaFactorActions = {
  hypoxemia: "Perfil associado: hipoxemia. Usar oxigênio quando houver indicação ou benefício clínico claro, com reavaliação do conforto.",
  bronchospasm: "Perfil associado: broncoespasmo. Revisar broncodilatadores, técnica inalatória e causas precipitantes.",
  secretions: "Perfil associado: secreções. Considerar posicionamento, higiene brônquica proporcional e antissecretório em sororoca ou excesso de secreção.",
  anxiety: "Perfil associado: ansiedade/pânico. Acolher, orientar respiração, manter presença calma e considerar benzodiazepínico quando ansiedade amplifica a dispneia.",
  functional: "Perfil associado: esforço/fadiga. Aplicar técnicas de conservação de energia, pausas, adaptação de atividades e fisioterapia quando possível.",
  refractory: "Perfil associado: refratariedade. Revisar medidas já otimizadas, meta de cuidado e critérios para sedação paliativa se sofrimento for intolerável.",
};

const fatigueAlertActions = {
  acuteDecline:
    "Interromper fluxo: avaliar piora súbita ou rápida da fadiga, queda funcional, nova incapacidade para autocuidado e necessidade de avaliação presencial.",
  infection:
    "Interromper fluxo: investigar infecção, febre, imunossupressão, sinais sistêmicos e necessidade de exames ou antibiótico conforme meta de cuidado.",
  bleedingAnemia:
    "Interromper fluxo: avaliar sangramento, anemia sintomática, hipotensão, tontura, síncope e necessidade de conduta presencial.",
  delirium:
    "Interromper fluxo: avaliar delirium, sonolência nova, rebaixamento de consciência, retenção urinária, constipação, infecção e medicamentos sedativos.",
  cardiorespiratory:
    "Interromper fluxo: avaliar dor torácica, dispneia intensa, dessaturação, taquicardia, tromboembolismo, insuficiência cardíaca ou instabilidade clínica.",
};

const fatigueIntensityPlans = {
  mild: {
    title: "Fadiga leve",
    text: "Há impacto funcional pequeno. Priorizar educação, rastreio de causas modificáveis e plano simples de conservação de energia.",
    actions: [
      "Registrar intensidade de 0 a 10, padrão diário, atividades afetadas e meta funcional escolhida pela pessoa.",
      "Orientar pausas programadas, priorização de tarefas importantes e alternância entre atividade e repouso.",
      "Estimular atividade física leve e segura quando possível, evitando repouso absoluto prolongado.",
    ],
  },
  moderate: {
    title: "Fadiga moderada",
    text: "Há limitação relevante de atividades. Combinar investigação dirigida, manejo de sintomas associados e reabilitação proporcional.",
    actions: [
      "Definir uma meta funcional realista para a semana, como banho com menos exaustão, caminhar dentro de casa ou participar de uma atividade significativa.",
      "Tratar causas associadas e ajustar rotina com conservação de energia, higiene do sono e suporte de fisioterapia/terapia ocupacional quando possível.",
      "Rever medicamentos sedativos e polifarmácia com a equipe responsável antes de acrescentar novas medicações.",
    ],
  },
  severe: {
    title: "Fadiga intensa",
    text: "Há alto impacto funcional ou sofrimento importante. Reavaliar reversibilidade, segurança, carga medicamentosa e proporcionalidade das intervenções.",
    actions: [
      "Pesquisar causas potencialmente reversíveis de maior impacto: anemia sintomática, infecção, desidratação, distúrbios metabólicos, dor, dispneia e delirium.",
      "Reduzir demandas, simplificar cuidados, proteger energia para prioridades da pessoa e envolver família/cuidador no plano.",
      "Considerar teste farmacológico apenas em caso selecionado, com meta objetiva, prazo curto e monitoramento rigoroso de efeitos adversos.",
    ],
  },
};

const fatigueFactorActions = {
  painDyspnea:
    "Fator associado: sintomas não controlados. Tratar dor, dispneia, náusea, constipação, anorexia ou outro sintoma predominante antes de atribuir tudo à fadiga.",
  sleepMood:
    "Fator associado: sono e sofrimento emocional. Revisar higiene do sono, ansiedade, depressão, medo, sofrimento espiritual e necessidade de apoio psicológico ou abordagem familiar.",
  medications:
    "Fator associado: medicamentos. Revisar opioides, benzodiazepínicos, anticonvulsivantes, antidepressivos, anti-histamínicos, antieméticos sedativos e interações.",
  metabolic:
    "Fator associado: condição clínica reversível. Considerar investigação proporcional de anemia, desidratação, infecção, hipercalcemia, insuficiência renal/hepática, alteração tireoidiana e baixa ingesta.",
  deconditioning:
    "Fator associado: descondicionamento. Planejar mobilização possível, exercícios leves, fisioterapia, terapia ocupacional, adaptação ambiental e prevenção de perda adicional de força.",
};

const anorexiaAlertActions = {
  obstruction:
    "Interromper fluxo: avaliar suspeita de obstrução intestinal, vômitos persistentes, distensão, dor, eliminação de fezes/gases e necessidade de avaliação presencial.",
  dehydrationDelirium:
    "Interromper fluxo: avaliar desidratação, delirium, sonolência nova, retenção urinária, constipação, infecção, medicamentos e segurança do cuidado atual.",
  dysphagiaAspiration:
    "Interromper fluxo: suspender ofertas inseguras, avaliar disfagia/broncoaspiração, ajustar consistência e considerar fonoaudiologia ou avaliação presencial.",
  rapidDecline:
    "Interromper fluxo: reavaliar queda funcional acelerada, perda ponderal rápida, reversibilidade, prognóstico e necessidade de suporte multiprofissional.",
  metabolicInfection:
    "Interromper fluxo: investigar causa clínica potencialmente reversível grave, como infecção, hipercalcemia, insuficiência renal/hepática, distúrbio endócrino ou desidratação.",
};

const anorexiaStagePlans = {
  precachexia: {
    title: "Pré-caquexia",
    text: "Há perda ponderal inicial, anorexia ou sinais metabólicos precoces. A prioridade é reconhecer o risco, tratar fatores modificáveis e acompanhar evolução.",
    nonPharmacological: [
      "Registrar peso atual, peso habitual, percentual de perda, ingesta aproximada, sintomas associados, funcionalidade e meta de cuidado.",
      "Tratar sintomas que reduzem ingesta: náusea, constipação, dor, candidíase oral, xerostomia, mucosite, refluxo, depressão e dispneia.",
      "Associar aconselhamento nutricional precoce: pequenas refeições frequentes, alimentos preferidos, maior densidade calórica/proteica e adaptação de consistência.",
    ],
    pharmacological: [
      "Não iniciar estimulante do apetite de rotina; priorizar tratamento medicamentoso apenas das causas reversíveis identificadas.",
      "Revisar medicamentos que reduzem apetite ou aumentam náusea, constipação, sonolência ou boca seca.",
    ],
  },
  cachexia: {
    title: "Caquexia",
    text: "Há síndrome multifatorial com perda de peso ou massa muscular e risco de perda funcional. O plano deve combinar controle de sintomas, suporte nutricional proporcional e metas realistas.",
    nonPharmacological: [
      "Explicar que a caquexia é multifatorial e frequentemente não reverte apenas com aumento de calorias.",
      "Considerar aconselhamento nutricional e suplementos orais se houver aceitação, expectativa de benefício funcional e ausência de carga excessiva.",
      "Definir metas funcionais realistas, como conforto ao comer, redução de sofrimento familiar e manutenção de atividades significativas possíveis.",
    ],
    pharmacological: [
      "Se houver objetivo claro de curto prazo, considerar corticosteroide por tempo limitado, ponderando hiperglicemia, delirium, miopatia, retenção hídrica e outros riscos.",
      "Opções presentes na RENAME: prednisona 40 mg/dia ou dexametasona 8 mg/dia, conforme indicação, riscos e protocolo local.",
    ],
  },
  refractoryCachexia: {
    title: "Caquexia refratária",
    text: "Há doença avançada com catabolismo ativo, baixa responsividade a intervenções, funcionalidade reduzida e prognóstico limitado. A meta principal passa a ser conforto.",
    nonPharmacological: [
      "Evitar metas centradas em ganho ponderal; oferecer pequenas quantidades se desejadas e respeitar recusa alimentar.",
      "Priorizar higiene oral, alívio de sede, ambiente calmo, manejo de náusea, secreções, boca seca e desconforto.",
      "Revisar proporcionalidade de suplementos, hidratação ou nutrição artificial caso a caso, alinhando decisões com conforto, preferências e objetivo do cuidado.",
    ],
    pharmacological: [
      "Evitar estimulantes do apetite quando não houver expectativa de benefício funcional ou sintomático relevante.",
      "Usar medicamentos apenas para alívio de sintomas associados, como náusea, dor, dispneia, secreções, constipação, delirium ou ansiedade, conforme necessidade clínica.",
    ],
  },
};

const anorexiaFactorActions = {
  giSymptoms: {
    nonPharmacological:
      "Sintomas gastrointestinais: fracionar refeições, reduzir odores, adaptar volume e consistência, orientar hidratação possível e observar relação com constipação, refluxo ou saciedade precoce.",
    pharmacological:
      "Tratar sintoma predominante conforme avaliação: antiemético para náusea/vômito, laxativo para constipação, antidiarreico quando indicado ou antisecretório/procinético conforme causa provável.",
  },
  oralDysphagia: {
    nonPharmacological:
      "Alterações orais ou disfagia: intensificar higiene oral, umidificação, lubrificação, adaptação de consistência e estratégia segura de oferta; considerar fonoaudiologia quando houver objetivo claro.",
    pharmacological:
      "Tratar causas específicas quando presentes, como candidíase, mucosite dolorosa, xerostomia, refluxo ou dor oral, com medicamentos compatíveis com via disponível e tolerabilidade.",
  },
  symptomsMood: {
    nonPharmacological:
      "Sintomas e sofrimento: alinhar metas, reduzir pressão para comer, acolher sofrimento espiritual/emocional e ajustar rotina para refeições em horários de maior conforto.",
    pharmacological:
      "Otimizar controle de dor, dispneia, depressão, ansiedade, delirium ou outro sintoma limitante antes de atribuir a baixa ingesta apenas à caquexia.",
  },
  medicationsMetabolic: {
    nonPharmacological:
      "Medicamentos ou causas clínicas: revisar lista completa, hidratação possível, sinais de infecção, constipação, desidratação e exames proporcionais à meta de cuidado.",
    pharmacological:
      "Ajustar ou suspender, quando apropriado, fármacos que pioram apetite, náusea, boca seca, constipação ou sonolência; tratar causas metabólicas reversíveis conforme objetivo assistencial.",
  },
  familyPressure: {
    nonPharmacological:
      "Pressão familiar: realizar conversa estruturada, explicar que perda de apetite pode fazer parte da evolução da doença e substituir disputa alimentar por oferta cuidadosa e prazer possível.",
    pharmacological:
      "Evitar prescrever estimulante do apetite apenas para reduzir angústia familiar; considerar medicamento somente quando houver meta sintomática clara para a pessoa.",
  },
};

const phenotypeLabels = {
  somatic: "Nociceptiva somática",
  visceral: "Nociceptiva visceral",
  neuropathic: "Neuropática",
  nociplastic: "Nociplástica",
  mixed: "Dor mista",
};

const phenotypeDescriptions = {
  somatic:
    "Predomínio de dor localizada em estruturas somáticas, como músculo, articulação, osso, pele ou ferida, geralmente modulada por movimento, carga ou palpação.",
  visceral:
    "Predomínio de dor profunda, mal delimitada, relacionada a distensão, contração ou acometimento de órgãos internos, podendo vir com sintomas autonômicos.",
  neuropathic:
    "Predomínio de descritores e sinais compatíveis com lesão ou disfunção do sistema somatossensorial, como queimação, choque, parestesias, dormência ou déficit sensitivo.",
  nociplastic:
    "Predomínio de sensibilização e amplificação da dor, com distribuição difusa, hipersensibilidade, impacto funcional e influência de sono, fadiga, humor ou contexto.",
  mixed:
    "Apresentação com características relevantes de dois ou mais fenótipos no mesmo caso. O manejo deve priorizar os componentes de maior peso e reavaliar a resposta por metas funcionais.",
};

const radarAxes = [
  { key: "somatic", label: "Somática", angle: -90, labelX: 160, labelY: 16, valueX: 160, valueY: 32, anchor: "middle" },
  { key: "neuropathic", label: "Neuropática", angle: 0, labelX: 238, labelY: 135, valueX: 238, valueY: 152, anchor: "start" },
  { key: "nociplastic", label: "Nociplástica", angle: 90, labelX: 160, labelY: 272, valueX: 160, valueY: 288, anchor: "middle" },
  { key: "visceral", label: "Visceral", angle: 180, labelX: 82, labelY: 135, valueX: 82, valueY: 152, anchor: "end" },
];

function closeDialog() {
  if (!dialog) return;
  dialog.classList.add("hidden");
  document.body.classList.remove("dialog-open");
}

function scrollActiveControlsIntoView() {
  window.requestAnimationFrame(() => {
    document.querySelectorAll(".tabs .tab-trigger.active, .subtabs .subtab-trigger.active").forEach((control) => {
      control.scrollIntoView({ block: "nearest", inline: "nearest" });
    });
  });
}

function updateSeoMetadata(tabId) {
  const activeLabel = document.querySelector(`.tab-trigger[data-tab="${tabId}"]`)?.textContent?.trim() || "Abordagem Paliativa";
  const title = tabId === "boas-vindas" ? "iCare - Abordagem Paliativa | Guia prático para o SUS" : `${activeLabel} | iCare - Abordagem Paliativa`;
  const descriptionByTab = {
    "nao-profissionais": "Conteúdo em linguagem simples sobre abordagem paliativa para pacientes, familiares, cuidadores e comunidade.",
    "medicamentos-componente-especializado": "Orientações sobre medicamentos do Componente Especializado da Assistência Farmacêutica, documentos, busca por medicamento e localização de CEAF.",
    conceitos: "Definições, princípios e conceitos essenciais de abordagem paliativa e cuidados paliativos no SUS.",
    "politica-nacional-cuidados-paliativos": "Resumo prático da Política Nacional de Cuidados Paliativos, pontos da RAS, equipes previstas e implicações para a atenção primária.",
    "papel-profissionais": "Atribuições de profissionais da equipe multiprofissional na abordagem paliativa, com normas e referências profissionais.",
    "identificacao-ras": "Critérios, indicadores e fluxo de identificação de pessoas com necessidades paliativas na Rede de Atenção à Saúde.",
    avaliacao: "Ferramentas de avaliação inicial, sintomas, funcionalidade, PPS e abordagem paliativa completa.",
    sintomas: "Controle de sintomas em abordagem paliativa, incluindo dor, dispneia, tosse, náuseas, constipação, delirium, ansiedade e outros sintomas.",
    prescricao: "Apoio à prescrição em abordagem paliativa conforme público, via de administração, sintomas e intensidade.",
  };
  const description =
    descriptionByTab[tabId] ||
    `Conteúdo prático sobre ${activeLabel.toLowerCase()} no contexto da abordagem paliativa para o serviço público de saúde.`;
  const canonicalUrl = `https://icare-abordagempaliativa.com.br/#${tabId}`;

  document.title = title;
  document.querySelector('meta[name="description"]')?.setAttribute("content", description);
  document.querySelector('meta[property="og:title"]')?.setAttribute("content", title);
  document.querySelector('meta[property="og:description"]')?.setAttribute("content", description);
  document.querySelector('meta[property="og:url"]')?.setAttribute("content", canonicalUrl);
  document.querySelector('meta[name="twitter:title"]')?.setAttribute("content", title);
  document.querySelector('meta[name="twitter:description"]')?.setAttribute("content", description);
}

function openTab(tabId, focusPanel = true, audienceMode = null) {
  const targetPanel = document.getElementById(tabId);
  const activeTabId = symptomTabIds.has(tabId) ? "sintomas" : routeTabIds.has(tabId) ? "vias-alternativas" : tabId;
  const showPublicAudience = audienceMode === "public" || (audienceMode !== "professional" && publicAudienceTabs.has(tabId));
  document.body.classList.toggle("public-audience", showPublicAudience);

  tabs.forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.tab === activeTabId);
  });

  panels.forEach((panel) => {
    panel.classList.toggle("active", panel.id === tabId);
  });

  updateSymptomTabs(tabId);
  updateRouteTabs(tabId);
  updateSeoMetadata(activeTabId);
  scrollActiveControlsIntoView();

  history.replaceState(null, "", `#${tabId}`);

  if (focusPanel) {
    targetPanel?.scrollIntoView({ behavior: "smooth", block: "start" });
    targetPanel?.focus({ preventScroll: true });
  }
}

document.addEventListener("click", (event) => {
  if (event.target.closest(".tab-trigger, .subtab-trigger")) {
    scrollActiveControlsIntoView();
  }
});

if (dialog) {
  dialog.classList.remove("hidden");
  document.body.classList.add("dialog-open");
}

acceptButton?.addEventListener("click", () => {
  closeDialog();
  openTab("conceitos");
});
declineButton?.addEventListener("click", () => {
  closeDialog();
  openTab("nao-profissionais");
});

document.querySelectorAll("[data-open-audience-tab]").forEach((button) => {
  button.addEventListener("click", () => openTab(button.dataset.openAudienceTab));
});

function normalizePublicCeafTerm(value) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function getPublicCeafDocumentsHtml() {
  return `
    <p><strong>Primeira solicitação:</strong></p>
    <ul>
      <li>LME preenchido e assinado conforme o PCDT. Links: <a href="https://www.gov.br/saude/pt-br/composicao/sectics/daf/ceaf/faq/o-que-e-laudo-para" target="_blank" rel="noreferrer">o que é LME</a>, <a href="https://www.gov.br/saude/pt-br/composicao/sectics/daf/ceaf/faq/quem-deve-preencher-o-lme" target="_blank" rel="noreferrer">quem deve preencher o LME</a> e <a href="https://www.gov.br/saude/pt-br/composicao/sectics/daf/ceaf/faq/onde-encontro-o-modelo-do" target="_blank" rel="noreferrer">modelo do LME</a>.</li>
      <li>Receita dentro da validade, com nome genérico, apresentação, dose, via, frequência e quantidade prevista pelo PCDT ou pela prescrição clínica.</li>
      <li>Documento de identificação, CPF ou CNS e comprovante de residência, conforme regra local.</li>
      <li>Relatório médico, exames, escalas, CID e critérios de inclusão/exclusão exigidos pelo PCDT ou pela farmácia estadual.</li>
    </ul>
    <p><strong>Renovação:</strong></p>
    <ul>
      <li>Novo receituário e novo LME quando exigidos para continuidade do tratamento conforme PCDT.</li>
      <li>Exames de monitoramento, relatório de resposta, avaliação de segurança ou documentos atualizados quando o PCDT exigir.</li>
      <li>Conferir validade do LME e prazo para renovar antes de acabar o medicamento. Links: <a href="https://www.gov.br/saude/pt-br/composicao/sectics/daf/ceaf/faq" target="_blank" rel="noreferrer">FAQ do CEAF</a>, <a href="https://www.gov.br/saude/pt-br/composicao/sectics/daf/ceaf/faq/qual-a-validade-do-lme" target="_blank" rel="noreferrer">validade do LME</a> e <a href="https://www.gov.br/saude/pt-br/composicao/sectics/daf/ceaf/faq/onde-devo-fazer-a-solicitacao" target="_blank" rel="noreferrer">onde solicitar ou renovar</a>.</li>
    </ul>
  `;
}

function renderPublicCeafMedicationResults(query = "") {
  const container = document.querySelector("#publicCeafMedicationResults");
  if (!container) return;

  const normalizedQuery = normalizePublicCeafTerm(query);
  if (!normalizedQuery) {
    container.innerHTML = `
      <article>
        <h3>Digite para buscar</h3>
        <p>O resultado aparecerá aqui com orientação geral sobre farmácia básica, componente especializado ou necessidade de confirmar no serviço de saúde.</p>
      </article>
    `;
    return;
  }

  const matches = publicCeafMedicationList.filter((item) =>
    item.aliases.some((alias) => normalizePublicCeafTerm(alias).includes(normalizedQuery))
  );

  if (!matches.length) {
    container.innerHTML = `
      <article>
        <h3>Medicamento não encontrado</h3>
        <p>Confirme o nome genérico com a equipe de saúde e procure a Unidade Básica de Saúde ou farmácia do SUS para saber o caminho de acesso.</p>
      </article>
    `;
    return;
  }

  container.innerHTML = matches
    .map(
      (item) => `
        <article>
          <h3>${item.name}</h3>
          <p><strong>Caminho provável:</strong> ${item.route}</p>
          <p><strong>PCDT relacionado:</strong> ${item.pcdt} <a href="https://www.gov.br/saude/pt-br/assuntos/pcdt" target="_blank" rel="noreferrer">Consultar PCDTs do Ministério da Saúde</a>.</p>
          <p><strong>Formas farmacêuticas disponíveis:</strong> ${item.forms}</p>
          <p><strong>Indicado para os CIDs:</strong> ${item.cids} <a href="https://www.gov.br/conitec/pt-br/protocolos-clinicos-e-diretrizes-terapeuticas" target="_blank" rel="noreferrer">Consultar medicamentos por CID e PCDT</a>.</p>
          <p><strong>Documentos:</strong></p>
          <ul>
            <li>${item.documents}</li>
          </ul>
          ${getPublicCeafDocumentsHtml()}
        </article>
      `
    )
    .join("");
}

document.querySelector("#publicCeafMedicationSearch")?.addEventListener("input", (event) => {
  renderPublicCeafMedicationResults(event.target.value);
});

function renderPublicCeafLocator() {
  const container = document.querySelector("#publicCeafLocatorResults");
  if (!container) return;

  container.innerHTML = `
    <article>
      <h3>Informe uma localização</h3>
      <p>Digite um endereço para abrir links de busca no mapa e em páginas oficiais.</p>
    </article>
  `;
}

function getPublicCeafOfficialAddressSearchHtml(locationText) {
  const safeLocation = String(locationText || "").trim() || "Brasil";
  const officialAddressQuery = encodeURIComponent(
    `site:.gov.br CEAF "Farmácia de Alto Custo" "endereço" "unidade" ${safeLocation}`
  );
  const healthDepartmentQuery = encodeURIComponent(
    `Secretaria Estadual de Saúde CEAF "endereços" "Farmácia de Alto Custo" ${safeLocation}`
  );

  return `
    <h3>Endereços em sites oficiais</h3>
    <p>Use estas buscas para localizar páginas oficiais com unidades, polos, farmácias especializadas e endereços próximos à localização informada.</p>
    <p><a href="https://www.google.com/search?q=${officialAddressQuery}" target="_blank" rel="noreferrer">Buscar endereços oficiais de CEAF próximas</a></p>
    <p><a href="https://www.google.com/search?q=${healthDepartmentQuery}" target="_blank" rel="noreferrer">Buscar na Secretaria de Saúde responsável</a></p>
    <p><a href="https://www.gov.br/saude/pt-br/composicao/sectics/daf/ceaf/faq/onde-devo-fazer-a-solicitacao" target="_blank" rel="noreferrer">Orientação oficial do Ministério da Saúde</a></p>
  `;
}

function renderPublicCeafAddressLocator(address = "") {
  const container = document.querySelector("#publicCeafLocatorResults");
  if (!container) return;

  const safeAddress = address.trim();
  if (!safeAddress) {
    renderPublicCeafLocator();
    return;
  }

  const mapsQuery = encodeURIComponent(`CEAF Farmácia Alto Custo Farmácia Especializada perto de ${safeAddress}`);
  const directionsDestination = encodeURIComponent("CEAF Farmácia Alto Custo Farmácia Especializada");
  const origin = encodeURIComponent(safeAddress);
  const officialQuery = encodeURIComponent(`CEAF Farmácia Alto Custo ${safeAddress} Secretaria de Saúde`);

  container.innerHTML = `
    <article>
      <h3>CEAF mais próxima sugerida</h3>
      <p>Busca baseada no endereço informado. O mapa exibirá unidades próximas; selecione a primeira opção compatível com CEAF/Farmácia de Alto Custo.</p>
      <p><a href="https://www.google.com/maps/search/?api=1&query=${mapsQuery}" target="_blank" rel="noreferrer">Ver CEAF mais próxima no mapa</a></p>
    </article>
    <article>
      <h3>Traçar rota</h3>
      <p>Abra a rota usando o endereço digitado como ponto de partida.</p>
      <p><a href="https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${directionsDestination}&travelmode=driving" target="_blank" rel="noreferrer">Abrir rota até a CEAF mais próxima</a></p>
    </article>
    <article>
      <h3>Busca complementar</h3>
      <p>Procure também por páginas oficiais da Secretaria de Saúde relacionadas ao endereço informado.</p>
      <p><a href="https://www.google.com/search?q=${officialQuery}" target="_blank" rel="noreferrer">Buscar páginas oficiais</a></p>
    </article>
    <article>
      ${getPublicCeafOfficialAddressSearchHtml(safeAddress)}
    </article>
  `;
}

function clearPublicCeafLocator() {
  const manualAddress = document.querySelector("#publicCeafAddress");
  if (manualAddress) manualAddress.value = "";
  renderPublicCeafLocator();
}

document.querySelector("#publicCeafAddress")?.addEventListener("input", (event) => {
  renderPublicCeafAddressLocator(event.target.value);
});
document.querySelector("#publicCeafClear")?.addEventListener("click", clearPublicCeafLocator);

function createSymptomSubtabs(activeId = "sintomas") {
  const wrapper = document.createElement("div");
  wrapper.className = "subtabs symptom-tabs";
  wrapper.setAttribute("aria-label", "Subabas de controle de sintomas");

  symptomTabs.forEach((item) => {
    const button = document.createElement("button");
    button.className = "subtab-trigger";
    button.type = "button";
    button.dataset.symptomTab = item.id;
    button.textContent = item.label;
    button.classList.toggle("active", item.id === activeId);
    button.addEventListener("click", () => openTab(item.id));
    wrapper.append(button);
  });

  return wrapper;
}

function createRouteSubtabs(activeId = "vias-alternativas") {
  const wrapper = document.createElement("div");
  wrapper.className = "subtabs route-tabs";
  wrapper.setAttribute("aria-label", "Subabas de vias de administração");

  routeTabs.forEach((item) => {
    const button = document.createElement("button");
    button.className = "subtab-trigger";
    button.type = "button";
    button.dataset.routeTab = item.id;
    button.textContent = item.label;
    button.classList.toggle("active", item.id === activeId);
    button.addEventListener("click", () => openTab(item.id));
    wrapper.append(button);
  });

  return wrapper;
}

function mountSymptomSubtabs() {
  const containers = [document.querySelector("#sintomas .symptom-tabs")];
  symptomTabs.forEach((item) => {
    const panel = document.getElementById(item.id);
    if (!panel) return;
    const existing = panel.querySelector(":scope > .symptom-tabs");
    if (existing) {
      containers.push(existing);
      return;
    }
    const tabsElement = createSymptomSubtabs(item.id);
    const heading = panel.querySelector("h2");
    if (heading) {
      heading.insertAdjacentElement("afterend", tabsElement);
    } else {
      panel.prepend(tabsElement);
    }
    containers.push(tabsElement);
  });

  containers.filter(Boolean).forEach((container) => {
    if (!container.dataset.mounted && !container.children.length) {
      container.replaceChildren(...createSymptomSubtabs().childNodes);
      container.dataset.mounted = "true";
    }
  });
}

function updateSymptomTabs(activeId = "sintomas") {
  document.querySelectorAll("[data-symptom-tab]").forEach((button) => {
    button.classList.toggle("active", button.dataset.symptomTab === activeId);
  });
}

function mountRouteSubtabs() {
  const containers = [document.querySelector("#vias-alternativas .route-tabs")];
  routeTabs.forEach((item) => {
    const panel = document.getElementById(item.id);
    if (!panel) return;
    const existing = panel.querySelector(":scope > .route-tabs");
    if (existing) {
      containers.push(existing);
      return;
    }
    const tabsElement = createRouteSubtabs(item.id);
    const heading = panel.querySelector("h2");
    if (heading) {
      heading.insertAdjacentElement("afterend", tabsElement);
    } else {
      panel.prepend(tabsElement);
    }
    containers.push(tabsElement);
  });

  containers.filter(Boolean).forEach((container) => {
    if (!container.dataset.mounted && !container.children.length) {
      container.replaceChildren(...createRouteSubtabs().childNodes);
      container.dataset.mounted = "true";
    }
  });
}

function updateRouteTabs(activeId = "vias-alternativas") {
  document.querySelectorAll("[data-route-tab]").forEach((button) => {
    button.classList.toggle("active", button.dataset.routeTab === activeId);
  });
}

mountSymptomSubtabs();
mountRouteSubtabs();

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const audienceMode = tab.classList.contains("audience-public-tab") ? "public" : "professional";
    openTab(tab.dataset.tab, true, audienceMode);
  });
});

function openConceptSubtab(targetId, focusPanel = true) {
  const targetPanel = document.getElementById(targetId);

  document.querySelectorAll("[data-concept-subtab]").forEach((subtab) => {
    subtab.classList.toggle("active", subtab.dataset.conceptSubtab === targetId);
  });

  document.querySelectorAll(".concept-subpanel").forEach((panel) => {
    panel.classList.toggle("active", panel.id === targetId);
  });

  history.replaceState(null, "", `#${targetId}`);

  if (focusPanel) {
    targetPanel?.scrollIntoView({ behavior: "smooth", block: "start" });
    targetPanel?.focus({ preventScroll: true });
  }
}

document.querySelectorAll("[data-concept-subtab]").forEach((button) => {
  button.addEventListener("click", () => {
    openConceptSubtab(button.dataset.conceptSubtab);
  });
});

function openProfessionalsSubtab(targetId, focusPanel = true) {
  const targetPanel = document.getElementById(targetId);

  document.querySelectorAll("[data-professionals-subtab]").forEach((subtab) => {
    subtab.classList.toggle("active", subtab.dataset.professionalsSubtab === targetId);
  });

  document.querySelectorAll(".professionals-subpanel").forEach((panel) => {
    panel.classList.toggle("active", panel.id === targetId);
  });

  history.replaceState(null, "", `#${targetId}`);

  if (focusPanel) {
    targetPanel?.scrollIntoView({ behavior: "smooth", block: "start" });
    targetPanel?.focus({ preventScroll: true });
  }
}

document.querySelectorAll("[data-professionals-subtab]").forEach((button) => {
  button.addEventListener("click", () => {
    openProfessionalsSubtab(button.dataset.professionalsSubtab);
  });
});

function openPainSubtab(targetId, focusPanel = true) {
  const targetPanel = document.getElementById(targetId);

  document.querySelectorAll("[data-pain-subtab]").forEach((subtab) => {
    subtab.classList.toggle("active", subtab.dataset.painSubtab === targetId);
  });

  document.querySelectorAll(".pain-subpanel").forEach((panel) => {
    panel.classList.toggle("active", panel.id === targetId);
  });

  history.replaceState(null, "", `#${targetId}`);

  if (focusPanel) {
    targetPanel?.scrollIntoView({ behavior: "smooth", block: "start" });
    targetPanel?.focus({ preventScroll: true });
  }
}

document.querySelectorAll("[data-pain-subtab]").forEach((button) => {
  button.addEventListener("click", () => {
    openPainSubtab(button.dataset.painSubtab);
  });
});

function openOpioidSubtab(targetId, focusPanel = true) {
  const targetPanel = document.getElementById(targetId);

  document.querySelectorAll("[data-opioid-subtab]").forEach((subtab) => {
    subtab.classList.toggle("active", subtab.dataset.opioidSubtab === targetId);
  });

  document.querySelectorAll(".opioid-subpanel").forEach((panel) => {
    panel.classList.toggle("active", panel.id === targetId);
  });

  history.replaceState(null, "", `#${targetId}`);

  if (focusPanel) {
    targetPanel?.scrollIntoView({ behavior: "smooth", block: "start" });
    targetPanel?.focus({ preventScroll: true });
  }
}

document.querySelectorAll("[data-opioid-subtab]").forEach((button) => {
  button.addEventListener("click", () => {
    openOpioidSubtab(button.dataset.opioidSubtab);
  });
});

const opioidRiskToolWeights = {
  familyAlcohol: { female: 1, male: 3 },
  familyIllegal: { female: 2, male: 3 },
  familyPrescription: { female: 4, male: 4 },
  personalAlcohol: { female: 3, male: 3 },
  personalIllegal: { female: 4, male: 4 },
  personalPrescription: { female: 5, male: 5 },
  age16to45: { female: 1, male: 1 },
  sexualAbuse: { female: 3, male: 0 },
  psychAddOcdBipolarSchizophrenia: { female: 2, male: 2 },
  psychDepression: { female: 1, male: 1 },
};

function updateOpioidRiskTool() {
  const result = document.querySelector("#opioidRiskToolResult");
  if (!result) return;

  const sex = document.querySelector('input[name="ortSex"]:checked')?.value;
  const selectedItems = Array.from(document.querySelectorAll("[data-ort-item]:checked"));

  if (!sex) {
    result.innerHTML = `
      <h3>Resultado pendente</h3>
      <p>Selecione o sexo conforme a tabela original para calcular o Opioid Risk Tool.</p>
    `;
    return;
  }

  const score = selectedItems.reduce((total, input) => {
    const item = input.dataset.ortItem;
    return total + (opioidRiskToolWeights[item]?.[sex] || 0);
  }, 0);

  let category = "baixo risco";
  let guidance =
    "Manter educação, plano terapêutico claro, prescrição organizada, prevenção de eventos adversos e reavaliação habitual.";

  if (score >= 8) {
    category = "alto risco";
    guidance =
      "Reforçar acompanhamento próximo, prescrição por profissional/equipe de referência, revisão de sedativos, avaliação de saúde mental ou uso de substâncias e discussão com equipe especializada quando possível.";
  } else if (score >= 4) {
    category = "risco moderado";
    guidance =
      "Combinar metas, orientar cuidador/família quando apropriado, reduzir duplicidade de prescrições, reavaliar em intervalos menores e revisar fatores modificáveis.";
  }

  const selectedText = selectedItems.length
    ? `${selectedItems.length} fator(es) selecionado(s).`
    : "Nenhum fator de risco selecionado.";

  result.innerHTML = `
    <h3>${score} ponto(s) - ${category}</h3>
    <p>${selectedText}</p>
    <p>${guidance}</p>
    <p>O escore deve ser interpretado junto da indicação clínica, prognóstico, funcionalidade, rede de apoio, disponibilidade local e objetivos de cuidado.</p>
  `;
}

document.querySelectorAll('input[name="ortSex"], [data-ort-item]').forEach((input) => {
  input.addEventListener("change", updateOpioidRiskTool);
});

updateOpioidRiskTool();

function getOpioidFlowValue(name) {
  return document.querySelector(`input[name="${name}"]:checked`)?.value || "";
}

function updateOpioidIntoxicationFlow() {
  const result = document.querySelector("#opioidIntoxicationFlowResult");
  if (!result) return;

  const breathing = getOpioidFlowValue("opioidFlowBreathing");
  const consciousness = getOpioidFlowValue("opioidFlowConsciousness");
  const risks = Array.from(document.querySelectorAll("[data-opioid-flow-risk]:checked")).map((item) => item.dataset.opioidFlowRisk);
  const hasHighRisk = risks.some((item) => ["sedatives", "longacting", "frailty"].includes(item));
  const hasWithdrawalRisk = risks.includes("withdrawal");
  const isTherapeuticUse = risks.includes("therapeutic") || hasWithdrawalRisk;

  let severity = "Leve";
  let conduct = "Suspender nova dose, revisar opioide/sedativos, observar de perto, orientar cuidador e reavaliar frequentemente.";
  let naloxone = "Naloxona geralmente não é necessária se a pessoa está despertável e respira de forma eficaz.";

  if (breathing === "critical") {
    severity = "Crítica";
    conduct = "Acionar SAMU/urgência, iniciar suporte básico/avançado, ventilar imediatamente e não atrasar oxigênio ou manobras de via aérea.";
    naloxone = "Se disponível e sem atrasar ventilação: naloxona 2 mg IV; repetir/titular conforme resposta e protocolo.";
  } else if (breathing === "severe" || consciousness === "coma") {
    severity = "Grave";
    conduct = "Acionar SAMU/urgência, proteger via aérea, oferecer oxigênio e ventilação assistida se respiração ineficaz; preparar observação por recorrência.";
    naloxone = "Naloxona 0,4 mg a 2 mg IV, IM ou SC; repetir a cada 2 a 3 min se necessário, até resposta adequada ou dose total de 10 mg, conforme bula/protocolo.";
  } else if (breathing === "moderate" || consciousness === "somnolent") {
    severity = hasHighRisk ? "Moderada com alto risco" : "Moderada";
    conduct = "Chamar ajuda, monitorar frequência respiratória, padrão ventilatório, consciência e saturação quando disponível; revisar opioide, resgates e sedativos.";
    naloxone = isTherapeuticUse
      ? "Se houver depressão respiratória progressiva: diluir naloxona 400 microgramas em 10 mL de cloreto de sódio 0,9%; administrar 0,5 mL, equivalente a 20 microgramas IV, a cada 2 min até ventilação adequada."
      : "Se houver piora respiratória ou rebaixamento: considerar naloxona titulada; em overdose aguda, usar esquema de 0,4 mg a 2 mg conforme protocolo.";
  }

  if (hasHighRisk && severity === "Leve") {
    severity = "Leve com fatores de risco";
    conduct = "Suspender nova dose, revisar fatores de risco, evitar sedativos, monitorar com maior frequência e definir retorno/contato de urgência.";
  }

  const riskText = risks.length
    ? "Fatores associados selecionados: " +
      risks
        .map((risk) => ({
          therapeutic: "uso terapêutico/paliativo",
          withdrawal: "uso crônico ou risco de abstinência",
          sedatives: "sedativos/álcool",
          longacting: "opioide de longa duração ou resgates repetidos",
          frailty: "fragilidade ou disfunção orgânica",
        }[risk]))
        .join(", ") +
      "."
    : "Nenhum fator associado adicional selecionado.";
  const withdrawalText = hasWithdrawalRisk
    ? "<p><strong>Risco de abstinência:</strong> evitar reversão abrupta quando houver ventilação espontânea; titular naloxona em microdoses, observar dor/agitação/vômitos e revisar plano analgésico após estabilização.</p>"
    : "";

  result.innerHTML = `
    <h3>Resultado: ${severity}</h3>
    <p><strong>Conduta imediata:</strong> ${conduct}</p>
    <p><strong>Naloxona:</strong> ${naloxone}</p>
    <p><strong>Contexto:</strong> ${riskText}</p>
    ${withdrawalText}
    <p><strong>Após resposta:</strong> manter observação, revisar causa da intoxicação, ajustar posologia e registrar plano de prevenção.</p>
  `;
}

document.querySelectorAll('input[name="opioidFlowBreathing"], input[name="opioidFlowConsciousness"], [data-opioid-flow-risk]').forEach((input) => {
  input.addEventListener("change", updateOpioidIntoxicationFlow);
});

updateOpioidIntoxicationFlow();

function openPublicCeafSubtab(targetId, focusPanel = true) {
  const targetPanel = document.getElementById(targetId);

  document.querySelectorAll("[data-public-ceaf-subtab]").forEach((subtab) => {
    subtab.classList.toggle("active", subtab.dataset.publicCeafSubtab === targetId);
  });

  document.querySelectorAll(".public-ceaf-subpanel").forEach((panel) => {
    panel.classList.toggle("active", panel.id === targetId);
  });

  history.replaceState(null, "", `#${targetId}`);

  if (focusPanel) {
    targetPanel?.scrollIntoView({ behavior: "smooth", block: "start" });
    targetPanel?.focus({ preventScroll: true });
  }
}

document.querySelectorAll("[data-public-ceaf-subtab]").forEach((button) => {
  button.addEventListener("click", () => {
    openPublicCeafSubtab(button.dataset.publicCeafSubtab);
  });
});

function openPncpSubtab(targetId, focusPanel = true) {
  const targetPanel = document.getElementById(targetId);

  document.querySelectorAll("[data-pncp-subtab]").forEach((subtab) => {
    subtab.classList.toggle("active", subtab.dataset.pncpSubtab === targetId);
  });

  document.querySelectorAll(".pncp-subpanel").forEach((panel) => {
    panel.classList.toggle("active", panel.id === targetId);
  });

  history.replaceState(null, "", `#${targetId}`);

  if (focusPanel) {
    targetPanel?.scrollIntoView({ behavior: "smooth", block: "start" });
    targetPanel?.focus({ preventScroll: true });
  }
}

document.querySelectorAll("[data-pncp-subtab]").forEach((button) => {
  button.addEventListener("click", () => {
    openPncpSubtab(button.dataset.pncpSubtab);
  });
});

function openIdentificationSubtab(targetId, focusPanel = true) {
  const targetPanel = document.getElementById(targetId);

  document.querySelectorAll("[data-identification-subtab]").forEach((subtab) => {
    subtab.classList.toggle("active", subtab.dataset.identificationSubtab === targetId);
  });

  document.querySelectorAll(".identification-subpanel").forEach((panel) => {
    panel.classList.toggle("active", panel.id === targetId);
  });

  history.replaceState(null, "", `#${targetId}`);

  if (focusPanel) {
    targetPanel?.scrollIntoView({ behavior: "smooth", block: "start" });
    targetPanel?.focus({ preventScroll: true });
  }
}

document.querySelectorAll("[data-identification-subtab]").forEach((button) => {
  button.addEventListener("click", () => {
    openIdentificationSubtab(button.dataset.identificationSubtab);
  });
});

function openAssessmentSubtab(targetId, focusPanel = true) {
  const targetPanel = document.getElementById(targetId);

  document.querySelectorAll("[data-assessment-subtab]").forEach((subtab) => {
    subtab.classList.toggle("active", subtab.dataset.assessmentSubtab === targetId);
  });

  document.querySelectorAll(".assessment-subpanel").forEach((panel) => {
    panel.classList.toggle("active", panel.id === targetId);
  });

  history.replaceState(null, "", `#${targetId}`);

  if (focusPanel) {
    targetPanel?.scrollIntoView({ behavior: "smooth", block: "start" });
    targetPanel?.focus({ preventScroll: true });
  }
}

document.querySelectorAll("[data-assessment-subtab]").forEach((button) => {
  button.addEventListener("click", () => {
    openAssessmentSubtab(button.dataset.assessmentSubtab);
  });
});

function openCompleteElementsSubtab(targetId, focusPanel = true) {
  const targetPanel = document.getElementById(targetId);

  document.querySelectorAll("[data-complete-elements-subtab]").forEach((subtab) => {
    subtab.classList.toggle("active", subtab.dataset.completeElementsSubtab === targetId);
  });

  document.querySelectorAll(".complete-elements-subpanel").forEach((panel) => {
    panel.classList.toggle("active", panel.id === targetId);
  });

  history.replaceState(null, "", `#${targetId}`);

  if (focusPanel) {
    targetPanel?.scrollIntoView({ behavior: "smooth", block: "start" });
    targetPanel?.focus({ preventScroll: true });
  }
}

document.querySelectorAll("[data-complete-elements-subtab]").forEach((button) => {
  button.addEventListener("click", () => {
    openCompleteElementsSubtab(button.dataset.completeElementsSubtab);
  });
});

function openPhasesSubtab(targetId, focusPanel = true) {
  const targetPanel = document.getElementById(targetId);

  document.querySelectorAll("[data-phases-subtab]").forEach((subtab) => {
    subtab.classList.toggle("active", subtab.dataset.phasesSubtab === targetId);
  });

  document.querySelectorAll(".phases-subpanel").forEach((panel) => {
    panel.classList.toggle("active", panel.id === targetId);
  });

  history.replaceState(null, "", `#${targetId}`);

  if (focusPanel) {
    targetPanel?.scrollIntoView({ behavior: "smooth", block: "start" });
    targetPanel?.focus({ preventScroll: true });
  }
}

document.querySelectorAll("[data-phases-subtab]").forEach((button) => {
  button.addEventListener("click", () => {
    openPhasesSubtab(button.dataset.phasesSubtab);
  });
});

function openBioethicsSubtab(targetId, focusPanel = true) {
  const targetPanel = document.getElementById(targetId);

  document.querySelectorAll("[data-bioethics-subtab]").forEach((subtab) => {
    subtab.classList.toggle("active", subtab.dataset.bioethicsSubtab === targetId);
  });

  document.querySelectorAll(".bioethics-subpanel").forEach((panel) => {
    panel.classList.toggle("active", panel.id === targetId);
  });

  history.replaceState(null, "", `#${targetId}`);

  if (focusPanel) {
    targetPanel?.scrollIntoView({ behavior: "smooth", block: "start" });
    targetPanel?.focus({ preventScroll: true });
  }
}

document.querySelectorAll("[data-bioethics-subtab]").forEach((button) => {
  button.addEventListener("click", () => {
    openBioethicsSubtab(button.dataset.bioethicsSubtab);
  });
});

function openCommunicationSubtab(targetId, focusPanel = true) {
  const targetPanel = document.getElementById(targetId);

  document.querySelectorAll("[data-communication-subtab]").forEach((subtab) => {
    subtab.classList.toggle("active", subtab.dataset.communicationSubtab === targetId);
  });

  document.querySelectorAll(".communication-subpanel").forEach((panel) => {
    panel.classList.toggle("active", panel.id === targetId);
  });

  history.replaceState(null, "", `#${targetId}`);

  if (focusPanel) {
    targetPanel?.scrollIntoView({ behavior: "smooth", block: "start" });
    targetPanel?.focus({ preventScroll: true });
  }
}

document.querySelectorAll("[data-communication-subtab]").forEach((button) => {
  button.addEventListener("click", () => {
    openCommunicationSubtab(button.dataset.communicationSubtab);
  });
});

function openPhytotherapySubtab(targetId, focusPanel = true) {
  const targetPanel = document.getElementById(targetId);

  document.querySelectorAll("[data-phytotherapy-subtab]").forEach((subtab) => {
    subtab.classList.toggle("active", subtab.dataset.phytotherapySubtab === targetId);
  });

  document.querySelectorAll(".phytotherapy-subpanel").forEach((panel) => {
    panel.classList.toggle("active", panel.id === targetId);
  });

  history.replaceState(null, "", `#${targetId}`);

  if (focusPanel) {
    targetPanel?.scrollIntoView({ behavior: "smooth", block: "start" });
    targetPanel?.focus({ preventScroll: true });
  }
}

document.querySelectorAll("[data-phytotherapy-subtab]").forEach((button) => {
  button.addEventListener("click", () => {
    openPhytotherapySubtab(button.dataset.phytotherapySubtab);
  });
});

function openPicsSubtab(targetId, focusPanel = true) {
  const targetPanel = document.getElementById(targetId);

  document.querySelectorAll("[data-pics-subtab]").forEach((subtab) => {
    subtab.classList.toggle("active", subtab.dataset.picsSubtab === targetId);
  });

  document.querySelectorAll(".pics-subpanel").forEach((panel) => {
    panel.classList.toggle("active", panel.id === targetId);
  });

  history.replaceState(null, "", `#${targetId}`);

  if (focusPanel) {
    targetPanel?.scrollIntoView({ behavior: "smooth", block: "start" });
    targetPanel?.focus({ preventScroll: true });
  }
}

document.querySelectorAll("[data-pics-subtab]").forEach((button) => {
  button.addEventListener("click", () => {
    openPicsSubtab(button.dataset.picsSubtab);
  });
});

function openSkinSubtab(targetId, focusPanel = true) {
  const targetPanel = document.getElementById(targetId);

  document.querySelectorAll("[data-skin-subtab]").forEach((subtab) => {
    subtab.classList.toggle("active", subtab.dataset.skinSubtab === targetId);
  });

  document.querySelectorAll(".skin-subpanel").forEach((panel) => {
    panel.classList.toggle("active", panel.id === targetId);
  });

  history.replaceState(null, "", `#${targetId}`);

  if (focusPanel) {
    targetPanel?.scrollIntoView({ behavior: "smooth", block: "start" });
    targetPanel?.focus({ preventScroll: true });
  }
}

document.querySelectorAll("[data-skin-subtab]").forEach((button) => {
  button.addEventListener("click", () => {
    openSkinSubtab(button.dataset.skinSubtab);
  });
});

function openEndOfLifeSubtab(targetId, focusPanel = true) {
  const targetPanel = document.getElementById(targetId);

  document.querySelectorAll("[data-endoflife-subtab]").forEach((subtab) => {
    subtab.classList.toggle("active", subtab.dataset.endoflifeSubtab === targetId);
  });

  document.querySelectorAll(".endoflife-subpanel").forEach((panel) => {
    panel.classList.toggle("active", panel.id === targetId);
  });

  history.replaceState(null, "", `#${targetId}`);

  if (focusPanel) {
    targetPanel?.scrollIntoView({ behavior: "smooth", block: "start" });
    targetPanel?.focus({ preventScroll: true });
  }
}

document.querySelectorAll("[data-endoflife-subtab]").forEach((button) => {
  button.addEventListener("click", () => {
    openEndOfLifeSubtab(button.dataset.endoflifeSubtab);
  });
});

function openCompassionSubtab(targetId, focusPanel = true) {
  const targetPanel = document.getElementById(targetId);

  document.querySelectorAll("[data-compassion-subtab]").forEach((subtab) => {
    subtab.classList.toggle("active", subtab.dataset.compassionSubtab === targetId);
  });

  document.querySelectorAll(".compassion-subpanel").forEach((panel) => {
    panel.classList.toggle("active", panel.id === targetId);
  });

  history.replaceState(null, "", `#${targetId}`);

  if (focusPanel) {
    targetPanel?.scrollIntoView({ behavior: "smooth", block: "start" });
    targetPanel?.focus({ preventScroll: true });
  }
}

document.querySelectorAll("[data-compassion-subtab]").forEach((button) => {
  button.addEventListener("click", () => {
    openCompassionSubtab(button.dataset.compassionSubtab);
  });
});

function openHomeDeathSubtab(targetId, focusPanel = true) {
  const targetPanel = document.getElementById(targetId);

  document.querySelectorAll("[data-home-death-subtab]").forEach((subtab) => {
    subtab.classList.toggle("active", subtab.dataset.homeDeathSubtab === targetId);
  });

  document.querySelectorAll(".homedeath-subpanel").forEach((panel) => {
    panel.classList.toggle("active", panel.id === targetId);
  });

  history.replaceState(null, "", `#${targetId}`);

  if (focusPanel) {
    targetPanel?.scrollIntoView({ behavior: "smooth", block: "start" });
    targetPanel?.focus({ preventScroll: true });
  }
}

document.querySelectorAll("[data-home-death-subtab]").forEach((button) => {
  button.addEventListener("click", () => {
    openHomeDeathSubtab(button.dataset.homeDeathSubtab);
  });
});

function openSelfCareSubtab(targetId, focusPanel = true) {
  const targetPanel = document.getElementById(targetId);

  document.querySelectorAll("[data-selfcare-subtab]").forEach((subtab) => {
    subtab.classList.toggle("active", subtab.dataset.selfcareSubtab === targetId);
  });

  document.querySelectorAll(".selfcare-subpanel").forEach((panel) => {
    panel.classList.toggle("active", panel.id === targetId);
  });

  history.replaceState(null, "", `#${targetId}`);

  if (focusPanel) {
    targetPanel?.scrollIntoView({ behavior: "smooth", block: "start" });
    targetPanel?.focus({ preventScroll: true });
  }
}

document.querySelectorAll("[data-selfcare-subtab]").forEach((button) => {
  button.addEventListener("click", () => {
    openSelfCareSubtab(button.dataset.selfcareSubtab);
  });
});

const burnoutLabels = [
  "0 - Nunca",
  "1 - Raramente",
  "2 - Algumas vezes",
  "3 - Frequentemente",
  "4 - Quase sempre",
];

function getBurnoutInterpretation(score, domains) {
  const highDomains = Object.values(domains).filter((value) => value >= 8).length;
  if (score >= 27 || highDomains >= 2) {
    return "Risco alto de burnout. Priorizar redução de carga quando possível, apoio institucional, supervisão, discussão com coordenação e avaliação de saúde mental se houver sofrimento persistente.";
  }
  if (score >= 15 || highDomains === 1) {
    return "Risco moderado. Revisar pausas, divisão de tarefas, debriefing, apoio entre pares e fatores organizacionais modificáveis.";
  }
  return "Baixo risco no momento. Manter pausas, apoio entre pares e reavaliação periódica.";
}

function updateBurnoutQuestionnaire() {
  const items = Array.from(document.querySelectorAll("[data-burnout-item]"));
  const scoreOutput = document.querySelector("#burnoutScore");
  const interpretationOutput = document.querySelector("#burnoutInterpretation");
  const domainsOutput = document.querySelector("#burnoutDomains");
  if (!items.length || !scoreOutput || !interpretationOutput || !domainsOutput) return;

  const domains = { exhaustion: 0, distance: 0, efficacy: 0 };
  items.forEach((select) => {
    const domain = select.dataset.burnoutItem;
    domains[domain] += Number(select.value || 0);
  });

  const score = domains.exhaustion + domains.distance + domains.efficacy;
  scoreOutput.textContent = `Pontuação: ${score}/36`;
  interpretationOutput.textContent = getBurnoutInterpretation(score, domains);
  domainsOutput.innerHTML = `
    <li>Exaustão: ${domains.exhaustion}/12</li>
    <li>Distanciamento/cinismo: ${domains.distance}/12</li>
    <li>Eficácia profissional reduzida: ${domains.efficacy}/12</li>
  `;
}

document.querySelectorAll("[data-burnout-item]").forEach((select) => {
  if (!select.options.length) {
    burnoutLabels.forEach((label, value) => {
      const option = document.createElement("option");
      option.value = String(value);
      option.textContent = label;
      select.append(option);
    });
  }
  select.addEventListener("change", updateBurnoutQuestionnaire);
});

updateBurnoutQuestionnaire();

function openCaregiverSubtab(targetId, focusPanel = true) {
  const targetPanel = document.getElementById(targetId);

  document.querySelectorAll("[data-caregiver-subtab]").forEach((subtab) => {
    subtab.classList.toggle("active", subtab.dataset.caregiverSubtab === targetId);
  });

  document.querySelectorAll(".caregiver-subpanel").forEach((panel) => {
    panel.classList.toggle("active", panel.id === targetId);
  });

  history.replaceState(null, "", `#${targetId}`);

  if (focusPanel) {
    targetPanel?.scrollIntoView({ behavior: "smooth", block: "start" });
    targetPanel?.focus({ preventScroll: true });
  }
}

document.querySelectorAll("[data-caregiver-subtab]").forEach((button) => {
  button.addEventListener("click", () => {
    openCaregiverSubtab(button.dataset.caregiverSubtab);
  });
});

const zaritLabels = [
  "0 - Nunca",
  "1 - Raramente",
  "2 - Algumas vezes",
  "3 - Frequentemente",
  "4 - Quase sempre",
];

function getZaritInterpretation(score) {
  if (score <= 20) {
    return "Sem sobrecarga ou sobrecarga mínima. Reavaliar periodicamente e manter orientação prática.";
  }
  if (score <= 40) {
    return "Sobrecarga leve a moderada. Revisar divisão de tarefas, descanso, rede de apoio e plano de crise.";
  }
  if (score <= 60) {
    return "Sobrecarga moderada a intensa. Priorizar suporte familiar, serviço social, atenção primária e reavaliação frequente.";
  }
  return "Sobrecarga intensa. Avaliar risco de colapso do cuidado, segurança no domicílio e necessidade de apoio multiprofissional rápido.";
}

function updateZaritScale() {
  const items = Array.from(document.querySelectorAll("[data-zarit-item]"));
  const scoreOutput = document.querySelector("#zaritScore");
  const interpretationOutput = document.querySelector("#zaritInterpretation");
  if (!items.length || !scoreOutput || !interpretationOutput) return;

  const score = items.reduce((total, select) => total + Number(select.value || 0), 0);
  scoreOutput.textContent = `Pontuação: ${score}/88`;
  interpretationOutput.textContent = getZaritInterpretation(score);
}

document.querySelectorAll("[data-zarit-item]").forEach((select) => {
  if (!select.options.length) {
    zaritLabels.forEach((label, value) => {
      const option = document.createElement("option");
      option.value = String(value);
      option.textContent = label;
      select.append(option);
    });
  }
  select.addEventListener("change", updateZaritScale);
});

updateZaritScale();

function openLegalSubtab(targetId, focusPanel = true) {
  const targetPanel = document.getElementById(targetId);

  document.querySelectorAll("[data-legal-subtab]").forEach((subtab) => {
    subtab.classList.toggle("active", subtab.dataset.legalSubtab === targetId);
  });

  document.querySelectorAll(".legal-subpanel").forEach((panel) => {
    panel.classList.toggle("active", panel.id === targetId);
  });

  history.replaceState(null, "", `#${targetId}`);

  if (focusPanel) {
    targetPanel?.scrollIntoView({ behavior: "smooth", block: "start" });
    targetPanel?.focus({ preventScroll: true });
  }
}

document.querySelectorAll("[data-legal-subtab]").forEach((button) => {
  button.addEventListener("click", () => {
    openLegalSubtab(button.dataset.legalSubtab);
  });
});

function openPlanningSubtab(targetId, focusPanel = true) {
  const targetPanel = document.getElementById(targetId);

  document.querySelectorAll("[data-planning-subtab]").forEach((subtab) => {
    subtab.classList.toggle("active", subtab.dataset.planningSubtab === targetId);
  });

  document.querySelectorAll(".planning-subpanel").forEach((panel) => {
    panel.classList.toggle("active", panel.id === targetId);
  });

  history.replaceState(null, "", `#${targetId}`);

  if (focusPanel) {
    targetPanel?.scrollIntoView({ behavior: "smooth", block: "start" });
    targetPanel?.focus({ preventScroll: true });
  }
}

document.querySelectorAll("[data-planning-subtab]").forEach((button) => {
  button.addEventListener("click", () => {
    openPlanningSubtab(button.dataset.planningSubtab);
  });
});

function openDecisionSubtab(targetId, focusPanel = true) {
  const targetPanel = document.getElementById(targetId);

  document.querySelectorAll("[data-decision-subtab]").forEach((subtab) => {
    subtab.classList.toggle("active", subtab.dataset.decisionSubtab === targetId);
  });

  document.querySelectorAll(".decision-subpanel").forEach((panel) => {
    panel.classList.toggle("active", panel.id === targetId);
  });

  history.replaceState(null, "", `#${targetId}`);

  if (focusPanel) {
    targetPanel?.scrollIntoView({ behavior: "smooth", block: "start" });
    targetPanel?.focus({ preventScroll: true });
  }
}

document.querySelectorAll("[data-decision-subtab]").forEach((button) => {
  button.addEventListener("click", () => {
    openDecisionSubtab(button.dataset.decisionSubtab);
  });
});

function setCapacityResult(title, text, actions) {
  const titleEl = document.querySelector("#capacityResultTitle");
  const textEl = document.querySelector("#capacityResultText");
  const actionsEl = document.querySelector("#capacityResultActions");

  if (titleEl) titleEl.textContent = title;
  if (textEl) textEl.textContent = text;
  if (actionsEl) {
    actionsEl.innerHTML = actions.map((action) => `<li>${action}</li>`).join("");
  }
}

function updateCapacityRiskFromChecks() {
  const selected = Array.from(document.querySelectorAll("[data-capacity-risk]:checked")).map((item) => item.dataset.capacityRisk);
  const none = document.querySelector("[data-capacity-risk-none]");
  capacityState.riskItems = selected;

  if (selected.includes("high")) {
    capacityState.risk = "high";
  } else if (selected.includes("moderate")) {
    capacityState.risk = "moderate";
  } else {
    capacityState.risk = "low";
    if (none) none.checked = none.checked || selected.length === 0;
  }

  const summary = document.querySelector("#capacityRiskSummary");
  const label = {
    low: "baixo risco/complexidade",
    moderate: "risco/complexidade moderado",
    high: "alto risco/complexidade",
  }[capacityState.risk];
  const detail = {
    low: "Sem itens selecionados, considerar checagem habitual dos quatro domínios.",
    moderate: "Exigir explicação mais cuidadosa, checagem de entendimento e registro claro.",
    high: "Exigir maior segurança na avaliação, considerar segunda avaliação, discussão multiprofissional ou apoio ético.",
  }[capacityState.risk];

  if (summary) {
    summary.innerHTML = `<strong>Classificação automática: ${label}.</strong><p>${detail}</p>`;
  }
}

function updateCapacityChoiceFromChecks() {
  const selected = Array.from(document.querySelectorAll("[data-capacity-choice]:checked")).map((item) => item.dataset.capacityChoice);
  const yesCount = selected.filter((value) => value === "yes").length;
  const hasNoItem = selected.includes("no");
  capacityState.choiceItems = selected;

  if (hasNoItem) {
    capacityState.domains.choice = "no";
  } else if (yesCount >= 3) {
    capacityState.domains.choice = "yes";
  } else if (yesCount > 0) {
    capacityState.domains.choice = "partial";
  } else {
    capacityState.domains.choice = null;
  }

  const summary = document.querySelector("#capacityChoiceSummary");
  const label = {
    yes: "sim",
    partial: "parcial",
    no: "não",
  }[capacityState.domains.choice] || "pendente";
  const detail = {
    yes: "A pessoa comunica uma escolha clara, consistente e ligada à decisão atual.",
    partial: "A pessoa comunica algum posicionamento, mas ainda precisa de apoio, confirmação ou nova checagem.",
    no: "Há falha relevante para comunicar uma escolha própria e compreensível; corrigir barreiras reversíveis e reavaliar quando possível.",
  }[capacityState.domains.choice] || "Selecione os itens observados para definir este domínio.";

  if (summary) {
    summary.innerHTML = `<strong>Classificação automática: ${label}.</strong><p>${detail}</p>`;
  }
}

function updateCapacityUnderstandingFromChecks() {
  const selected = Array.from(document.querySelectorAll("[data-capacity-understanding]:checked")).map((item) => item.dataset.capacityUnderstanding);
  const yesCount = selected.filter((value) => value === "yes").length;
  const hasNoItem = selected.includes("no");
  capacityState.understandingItems = selected;

  if (hasNoItem) {
    capacityState.domains.understanding = "no";
  } else if (yesCount >= 4) {
    capacityState.domains.understanding = "yes";
  } else if (yesCount > 0) {
    capacityState.domains.understanding = "partial";
  } else {
    capacityState.domains.understanding = null;
  }

  const summary = document.querySelector("#capacityUnderstandingSummary");
  const label = {
    yes: "sim",
    partial: "parcial",
    no: "não",
  }[capacityState.domains.understanding] || "pendente";
  const detail = {
    yes: "A pessoa compreende problema, opções, benefícios, riscos e consequências relevantes em linguagem própria.",
    partial: "A pessoa compreende parte das informações, mas precisa de reforço, simplificação ou nova checagem.",
    no: "Há falha relevante de compreensão; corrigir fatores reversíveis, adaptar comunicação e reavaliar antes de concluir.",
  }[capacityState.domains.understanding] || "Selecione os itens observados para definir este domínio.";

  if (summary) {
    summary.innerHTML = `<strong>Classificação automática: ${label}.</strong><p>${detail}</p>`;
  }
}

function updateCapacityAppreciationFromChecks() {
  const selected = Array.from(document.querySelectorAll("[data-capacity-appreciation]:checked")).map((item) => item.dataset.capacityAppreciation);
  const yesCount = selected.filter((value) => value === "yes").length;
  const hasNoItem = selected.includes("no");
  capacityState.appreciationItems = selected;

  if (hasNoItem) {
    capacityState.domains.appreciation = "no";
  } else if (yesCount >= 4) {
    capacityState.domains.appreciation = "yes";
  } else if (yesCount > 0) {
    capacityState.domains.appreciation = "partial";
  } else {
    capacityState.domains.appreciation = null;
  }

  const summary = document.querySelector("#capacityAppreciationSummary");
  const label = {
    yes: "sim",
    partial: "parcial",
    no: "não",
  }[capacityState.domains.appreciation] || "pendente";
  const detail = {
    yes: "A pessoa reconhece que a informação clínica se aplica ao próprio caso e às consequências pessoais da decisão.",
    partial: "A pessoa reconhece parte da situação, mas ainda precisa de conversa, exemplos concretos ou nova checagem.",
    no: "Há falha relevante de apreciação da própria situação; investigar fatores reversíveis, falsas crenças, coerção ou sofrimento intenso.",
  }[capacityState.domains.appreciation] || "Selecione os itens observados para definir este domínio.";

  if (summary) {
    summary.innerHTML = `<strong>Classificação automática: ${label}.</strong><p>${detail}</p>`;
  }
}

function updateCapacityReasoningFromChecks() {
  const selected = Array.from(document.querySelectorAll("[data-capacity-reasoning]:checked")).map((item) => item.dataset.capacityReasoning);
  const yesCount = selected.filter((value) => value === "yes").length;
  const hasNoItem = selected.includes("no");
  capacityState.reasoningItems = selected;

  if (hasNoItem) {
    capacityState.domains.reasoning = "no";
  } else if (yesCount >= 4) {
    capacityState.domains.reasoning = "yes";
  } else if (yesCount > 0) {
    capacityState.domains.reasoning = "partial";
  } else {
    capacityState.domains.reasoning = null;
  }

  const summary = document.querySelector("#capacityReasoningSummary");
  const label = {
    yes: "sim",
    partial: "parcial",
    no: "não",
  }[capacityState.domains.reasoning] || "pendente";
  const detail = {
    yes: "A pessoa compara opções, pondera consequências e justifica a escolha de modo coerente com seus valores.",
    partial: "A pessoa raciocina parcialmente sobre a decisão, mas precisa de apoio para comparar opções ou consequências.",
    no: "Há falha relevante de raciocínio para esta decisão; investigar fatores reversíveis, coerção, sofrimento intenso ou alteração cognitiva.",
  }[capacityState.domains.reasoning] || "Selecione os itens observados para definir este domínio.";

  if (summary) {
    summary.innerHTML = `<strong>Classificação automática: ${label}.</strong><p>${detail}</p>`;
  }
}

function renderCapacityResult() {
  updateCapacityRiskFromChecks();
  updateCapacityChoiceFromChecks();
  updateCapacityUnderstandingFromChecks();
  updateCapacityAppreciationFromChecks();
  updateCapacityReasoningFromChecks();

  const values = Object.values(capacityState.domains);
  const unanswered = values.filter(Boolean).length < values.length;
  const noCount = values.filter((value) => value === "no").length;
  const partialCount = values.filter((value) => value === "partial").length;
  const yesCount = values.filter((value) => value === "yes").length;
  const prepMissing = Array.from(document.querySelectorAll("[data-capacity-prep]")).filter((item) => !item.checked).length;
  const highRisk = capacityState.risk === "high";

  if (unanswered) {
    setCapacityResult("Complete os quatro domínios", "A conclusão aparecerá após selecionar uma resposta em cada domínio.", [
      "Avalie capacidade para a decisão específica e no momento atual.",
      "Use apoios de comunicação e corrija fatores reversíveis antes de concluir incapacidade quando possível.",
    ]);
    return;
  }

  if (noCount > 0 || partialCount >= 2 || (highRisk && partialCount > 0)) {
    setCapacityResult("Capacidade decisória possivelmente comprometida", "Há falha ou incerteza relevante em domínio essencial, especialmente considerando o risco/complexidade da decisão.", [
      "Tratar fatores reversíveis e repetir a avaliação se houver possibilidade de melhora.",
      "Envolver representante/diretivas antecipadas quando a pessoa não puder decidir.",
      "Para decisão de alto impacto, considerar segunda avaliação, equipe multiprofissional, psiquiatria/psicologia ou apoio ético institucional.",
      "Registrar qual domínio ficou comprometido e quais apoios foram utilizados.",
    ]);
    return;
  }

  if (partialCount === 1 || prepMissing > 0 || capacityState.risk === "moderate") {
    setCapacityResult("Capacidade provável, mas com necessidade de reforço", "A pessoa atende aos domínios centrais, mas há ponto parcial, preparo incompleto ou decisão de complexidade moderada.", [
      "Reforçar explicação em linguagem simples e pedir que a pessoa repita as informações essenciais.",
      "Documentar a decisão específica, riscos, benefícios, alternativas e coerência com valores.",
      "Se houver dúvida residual ou pressão familiar, reavaliar em curto prazo ou discutir com equipe.",
    ]);
    return;
  }

  if (yesCount === 4) {
    setCapacityResult("Capacidade decisória preservada para esta decisão", "A pessoa comunica escolha, compreende informações relevantes, aprecia a própria situação e raciocina sobre alternativas e consequências.", [
      "Registrar a conclusão no prontuário com a decisão avaliada e as respostas centrais da pessoa.",
      "Prosseguir com decisão compartilhada, respeitando autonomia e proporcionalidade terapêutica.",
      "Reavaliar capacidade se houver delirium, sedação, piora clínica ou mudança da decisão.",
    ]);
  }
}

document.querySelectorAll("[data-capacity-risk]").forEach((checkbox) => {
  checkbox.addEventListener("change", () => {
    if (checkbox.checked) {
      const none = document.querySelector("[data-capacity-risk-none]");
      if (none) none.checked = false;
    }
    renderCapacityResult();
  });
});

document.querySelector("[data-capacity-risk-none]")?.addEventListener("change", (event) => {
  if (event.target.checked) {
    document.querySelectorAll("[data-capacity-risk]").forEach((checkbox) => {
      checkbox.checked = false;
    });
  }
  renderCapacityResult();
});

document.querySelectorAll("[data-capacity-choice]").forEach((checkbox) => {
  checkbox.addEventListener("change", renderCapacityResult);
});

document.querySelectorAll("[data-capacity-understanding]").forEach((checkbox) => {
  checkbox.addEventListener("change", renderCapacityResult);
});

document.querySelectorAll("[data-capacity-appreciation]").forEach((checkbox) => {
  checkbox.addEventListener("change", renderCapacityResult);
});

document.querySelectorAll("[data-capacity-reasoning]").forEach((checkbox) => {
  checkbox.addEventListener("change", renderCapacityResult);
});

document.querySelectorAll("[data-capacity-domain]").forEach((group) => {
  group.querySelectorAll(".segment").forEach((button) => {
    button.addEventListener("click", () => {
      capacityState.domains[group.dataset.capacityDomain] = button.dataset.value;
      group.querySelectorAll(".segment").forEach((item) => {
        item.classList.toggle("active", item === button);
      });
      renderCapacityResult();
    });
  });
});

document.querySelectorAll("[data-capacity-prep]").forEach((checkbox) => {
  checkbox.addEventListener("change", renderCapacityResult);
});

function setPpsResult(title, text, actions) {
  const titleEl = document.querySelector("#ppsResultTitle");
  const textEl = document.querySelector("#ppsResultText");
  const actionsEl = document.querySelector("#ppsResultActions");

  if (titleEl) titleEl.textContent = title;
  if (textEl) textEl.textContent = text;
  if (actionsEl) {
    actionsEl.innerHTML = actions.map((action) => `<li>${action}</li>`).join("");
  }
}

const ppsRows = {
  100: {
    summary: "Deambulação completa; atividade normal e trabalho sem evidência de doença; autocuidado completo; ingesta normal; consciência completa.",
    actions: [
      "Registrar como funcionalidade preservada e usar a PPS como linha de base para comparação futura.",
      "Reavaliar periodicamente se surgirem sintomas, queda de atividade ou nova evidência de doença.",
    ],
  },
  90: {
    summary: "Deambulação completa; atividade normal e trabalho com alguma evidência de doença; autocuidado completo; ingesta normal; consciência completa.",
    actions: [
      "Registrar evidência de doença e impacto funcional ainda discreto.",
      "Manter plano de acompanhamento, controle de sintomas e orientação sobre sinais de mudança funcional.",
    ],
  },
  80: {
    summary: "Deambulação completa; atividade normal com esforço e alguma evidência de doença; autocuidado completo; ingesta normal ou reduzida; consciência completa.",
    actions: [
      "Investigar fadiga, redução de tolerância ao esforço e sintomas que estejam limitando atividades habituais.",
      "Pactuar conservação de energia, reabilitação proporcional e metas funcionais realistas.",
    ],
  },
  70: {
    summary: "Deambulação reduzida; incapaz para o trabalho normal; doença significativa; autocuidado completo; ingesta normal ou reduzida; consciência completa.",
    actions: [
      "Revisar perda de trabalho/atividade habitual, segurança para deslocamento e necessidade de suporte domiciliar inicial.",
      "Acompanhar tendência da PPS e alinhar metas de cuidado com pessoa e família.",
    ],
  },
  60: {
    summary: "Deambulação reduzida; incapaz para hobbies ou trabalho doméstico; doença significativa; assistência ocasional; ingesta normal ou reduzida; consciência completa ou períodos de confusão.",
    actions: [
      "Pesquisar necessidade de ajuda ocasional para banho, banheiro, transferências, alimentação e medicações.",
      "Planejar suporte do cuidador, prevenção de quedas e plano para intercorrências.",
    ],
  },
  50: {
    summary: "Maior parte do tempo sentado ou deitado; incapaz para qualquer trabalho; doença extensa; assistência considerável; ingesta normal ou reduzida; consciência completa ou períodos de confusão.",
    actions: [
      "Revisar suporte diário do cuidador, adaptação do domicílio, risco de internação e plano de urgência.",
      "Avaliar sintomas de maior impacto, segurança para transferências e necessidade de atenção domiciliar ou cuidado compartilhado.",
    ],
  },
  40: {
    summary: "Maior parte do tempo acamado; incapaz para a maioria das atividades; doença extensa; assistência quase completa; ingesta normal ou reduzida; consciência completa ou sonolência +/- confusão.",
    actions: [
      "Priorizar conforto, prevenção de lesões por pressão, higiene, mudança de decúbito e manejo de sintomas.",
      "Revisar proporcionalidade terapêutica, carga do cuidador e disponibilidade de medicações e insumos no domicílio.",
    ],
  },
  30: {
    summary: "Totalmente acamado; incapaz para qualquer atividade; doença extensa; dependência completa; ingesta normal ou reduzida; consciência completa ou sonolência +/- confusão.",
    actions: [
      "Organizar cuidado de alta dependência, higiene, pele, alimentação proporcional e plano de sintomas.",
      "Discutir objetivos de cuidado, limites terapêuticos, suporte familiar e sinais de processo ativo de morte.",
    ],
  },
  20: {
    summary: "Totalmente acamado; incapaz para qualquer atividade; doença extensa; dependência completa; ingesta mínima a pequenos goles; consciência completa ou sonolência +/- confusão.",
    actions: [
      "Reavaliar fim de vida, conforto, boca úmida, presença familiar e redução de intervenções sem benefício proporcional.",
      "Garantir plano de crise, medicações essenciais, orientação à família e contato da equipe.",
    ],
  },
  10: {
    summary: "Totalmente acamado; incapaz para qualquer atividade; doença extensa; dependência completa; cuidados com a boca; sonolento ou coma +/- confusão.",
    actions: [
      "Considerar processo ativo de morte e priorizar exclusivamente conforto, controle de sintomas e presença de pessoas significativas.",
      "Orientar família sobre sinais esperados, suspensão de medidas desproporcionais e plano para o momento do óbito.",
    ],
  },
  0: {
    summary: "Morte.",
    actions: [
      "Seguir fluxo local de constatação/declaração de óbito, acolhimento familiar e cuidados pós-óbito.",
      "Oferecer suporte ao luto e revisar o caso com a equipe quando apropriado.",
    ],
  },
};

function getPpsInterpretation(score) {
  return ppsRows[score] || ppsRows[0];
}

const ppsTableRows = [
  { score: 100, ambulation: "complete", activity: "normal_no_disease", selfcare: "complete", intake: "normal", consciousness: "complete" },
  { score: 90, ambulation: "complete", activity: "normal_some_disease", selfcare: "complete", intake: "normal", consciousness: "complete" },
  { score: 80, ambulation: "complete", activity: "normal_effort_some_disease", selfcare: "complete", intake: "normal_or_reduced", consciousness: "complete" },
  { score: 70, ambulation: "reduced", activity: "unable_normal_work_significant", selfcare: "complete", intake: "normal_or_reduced", consciousness: "complete" },
  { score: 60, ambulation: "reduced", activity: "unable_hobbies_significant", selfcare: "occasional", intake: "normal_or_reduced", consciousness: "complete_or_confusion" },
  { score: 50, ambulation: "sit_lie", activity: "unable_any_work_extensive", selfcare: "considerable", intake: "normal_or_reduced", consciousness: "complete_or_confusion" },
  { score: 40, ambulation: "bed_most", activity: "unable_most_activity_extensive", selfcare: "almost_complete", intake: "normal_or_reduced", consciousness: "complete_or_drowsy_confusion" },
  { score: 30, ambulation: "bedbound", activity: "unable_any_activity_extensive", selfcare: "complete_dependence", intake: "normal_or_reduced", consciousness: "complete_or_drowsy_confusion" },
  { score: 20, ambulation: "bedbound", activity: "unable_any_activity_extensive", selfcare: "complete_dependence", intake: "minimal_sips", consciousness: "complete_or_drowsy_confusion" },
  { score: 10, ambulation: "bedbound", activity: "unable_any_activity_extensive", selfcare: "complete_dependence", intake: "mouth_care", consciousness: "drowsy_coma_confusion" },
  { score: 0, ambulation: "death", activity: "death", selfcare: "death", intake: "death", consciousness: "death" },
];

function calculatePpsScoreFromTable(values) {
  const hierarchy = ["ambulation", "activity", "selfcare", "intake", "consciousness"];
  if (hierarchy.some((factor) => values[factor] === "death")) {
    return { score: 0, determiningFactor: "ambulation", notes: [] };
  }

  let candidates = [...ppsTableRows].filter((row) => row.score > 0);
  let determiningFactor = "ambulation";
  const notes = [];

  hierarchy.forEach((factor) => {
    const filtered = candidates.filter((row) => row[factor] === values[factor]);
    if (filtered.length) {
      candidates = filtered;
      determiningFactor = factor;
    } else {
      notes.push(`O domínio ${getPpsFactorLabel(factor)} ficou fora da linha mais compatível; mantida a hierarquia da tabela.`);
    }
  });

  const score = Math.min(...candidates.map((row) => row.score));
  return { score, determiningFactor, notes };
}

function getPpsFactorLabel(factor) {
  const labels = {
    ambulation: "Deambulação",
    activity: "Atividade/evidência de doença",
    selfcare: "Autocuidado",
    intake: "Ingesta",
    consciousness: "Nível de consciência",
  };
  return labels[factor] || factor;
}

function describePpsHierarchy(determiningFactor) {
  return `${getPpsFactorLabel(determiningFactor)} foi o domínio que refinou a linha final compatível. Hierarquia aplicada: deambulação > atividade/evidência de doença > autocuidado > ingesta > nível de consciência.`;
}

function updatePpsResult() {
  const selects = Array.from(document.querySelectorAll("[data-pps-factor]"));
  if (!selects.length) return;

  const selected = selects.filter((select) => select.value);
  if (selected.length < selects.length) {
    setPpsResult("Selecione os cinco parâmetros", "O PPS estimado aparecerá após preencher deambulação, atividade, autocuidado, ingesta e consciência.", [
      "Preencha todos os campos para reduzir inconsistência na estimativa.",
      "Leia a escala horizontalmente, da esquerda para a direita, respeitando a hierarquia: deambulação, atividade/evidência de doença, autocuidado, ingesta e nível de consciência.",
      "Quando houver dúvida entre dois níveis, não use pontuação intermediária; escolha o incremento de 10% definido pelo domínio hierarquicamente mais forte que se aplica.",
    ]);
    return;
  }

  const values = selects.reduce((acc, select) => {
    acc[select.dataset.ppsFactor] = select.value;
    return acc;
  }, {});
  const calculation = calculatePpsScoreFromTable(values);
  const score = calculation.score;
  const interpretation = getPpsInterpretation(score);
  setPpsResult(`PPS estimado: ${score}%`, interpretation.summary, [
    describePpsHierarchy(calculation.determiningFactor),
    ...calculation.notes,
    ...interpretation.actions,
    "Use a PPS como apoio à comunicação e ao acompanhamento funcional; ela não substitui avaliação longitudinal, prognóstico individual nem conversa com a pessoa e família.",
  ]);
}

document.querySelectorAll("[data-pps-factor]").forEach((select) => {
  select.addEventListener("change", updatePpsResult);
});

function setIdentificationStepLock(stepName, locked) {
  document.querySelectorAll(`[data-identification-requires="${stepName}"]`).forEach((step) => {
    step.classList.toggle("locked-step", locked);
    step.setAttribute("aria-disabled", String(locked));
  });
}

function setIdentificationInlineResult(containerId, titleId, textId, actionsId, title, text, actions) {
  const container = document.querySelector(`#${containerId}`);
  const titleEl = document.querySelector(`#${titleId}`);
  const textEl = document.querySelector(`#${textId}`);
  const actionsEl = document.querySelector(`#${actionsId}`);

  if (container) container.hidden = false;
  if (titleEl) titleEl.textContent = title;
  if (textEl) textEl.textContent = text;
  if (actionsEl) {
    actionsEl.innerHTML = actions.map((action) => `<li>${action}</li>`).join("");
  }
}

function hideIdentificationInlineResult(containerId) {
  const container = document.querySelector(`#${containerId}`);
  if (container) container.hidden = true;
}

function setIdentificationResult(title, text, actions) {
  const container = document.querySelector(".identification-result");
  const titleEl = document.querySelector("#identificationResultTitle");
  const textEl = document.querySelector("#identificationResultText");
  const actionsEl = document.querySelector("#identificationResultActions");

  if (container) container.hidden = false;
  if (titleEl) titleEl.textContent = title;
  if (textEl) textEl.textContent = text;
  if (actionsEl) {
    actionsEl.innerHTML = actions.map((action) => `<li>${action}</li>`).join("");
  }
}

function hideIdentificationResult() {
  const container = document.querySelector(".identification-result");
  if (container) container.hidden = true;
}

function getCheckedLabelTexts(selector) {
  return Array.from(document.querySelectorAll(selector))
    .filter((item) => item.checked)
    .map((item) => item.closest("label")?.textContent.trim())
    .filter(Boolean);
}

function updateIdentificationStatusFromChecks() {
  identificationState.simplifiedItems = getCheckedLabelTexts("[data-identification-simplified-item]");
  identificationState.simplifiedNone = Boolean(document.querySelector("[data-identification-simplified-none]")?.checked);
  identificationState.simplifiedDoubt = Boolean(document.querySelector("[data-identification-simplified-doubt]")?.checked);
  identificationState.spictItems = getCheckedLabelTexts("[data-identification-spict-item]");
  identificationState.spictNone = Boolean(document.querySelector("[data-identification-spict-none]")?.checked);
  identificationState.spictDoubt = Boolean(document.querySelector("[data-identification-spict-doubt]")?.checked);

  if (identificationState.simplifiedItems.length > 0) {
    identificationState.simplified = "positive";
  } else if (identificationState.simplifiedDoubt) {
    identificationState.simplified = "doubt";
  } else if (identificationState.simplifiedNone) {
    identificationState.simplified = "negative";
  } else {
    identificationState.simplified = null;
  }

  if (identificationState.spictItems.length > 0) {
    identificationState.spict = "positive";
  } else if (identificationState.spictDoubt) {
    identificationState.spict = "doubt";
  } else if (identificationState.spictNone) {
    identificationState.spict = "negative";
  } else {
    identificationState.spict = null;
  }
}

function scrollIdentificationTo(selector) {
  const target = document.querySelector(selector);
  if (!target) return;
  window.setTimeout(() => {
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 80);
}

function renderIdentificationFlow(scrollAfterStep = false) {
  updateIdentificationStatusFromChecks();

  const continueToSpict =
    identificationState.simplified === "positive" || identificationState.simplified === "doubt";
  const continueToSurprise =
    continueToSpict && (identificationState.spict === "positive" || identificationState.spict === "doubt");

  setIdentificationStepLock("spict", !continueToSpict);
  setIdentificationStepLock("surprise", !continueToSurprise);
  hideIdentificationResult();

  if (!continueToSpict) {
    identificationState.spict = null;
    identificationState.spictItems = [];
    identificationState.spictNone = false;
    identificationState.spictDoubt = false;
    identificationState.surprise = null;
    document.querySelectorAll("[data-identification-spict-item], [data-identification-spict-none], [data-identification-spict-doubt]").forEach((checkbox) => {
      checkbox.checked = false;
    });
    document.querySelectorAll('[data-identification-flow="surprise"]').forEach((button) => {
      button.classList.remove("active");
    });
  } else if (!continueToSurprise) {
    identificationState.surprise = null;
    document.querySelectorAll('[data-identification-flow="surprise"]').forEach((button) => {
      button.classList.remove("active");
    });
  }

  if (!identificationState.simplified) {
    hideIdentificationInlineResult("identificationSimplifiedResult");
    hideIdentificationInlineResult("identificationSpictResult");
    return;
  }

  if (identificationState.simplified === "negative") {
    hideIdentificationInlineResult("identificationSpictResult");
    setIdentificationInlineResult("identificationSimplifiedResult", "identificationSimplifiedTitle", "identificationSimplifiedText", "identificationSimplifiedActions", "Interromper fluxo", "Sem item positivo na Elegibilidade Simplificada, o guia orienta interromper o fluxo de elegibilidade para abordagem paliativa completa.", [
      "Manter acompanhamento longitudinal pela APS e reavaliar se houver declínio funcional, nova internação, sintomas persistentes ou mudança clínica.",
      "Se permanecer dúvida clínica, discutir o caso em equipe multiprofissional e considerar continuidade do fluxo.",
    ]);
    if (scrollAfterStep) scrollIdentificationTo("#identificationSimplifiedResult");
    return;
  }

  const selectedSimplifiedItems = identificationState.simplifiedItems.length
    ? `Itens selecionados: ${identificationState.simplifiedItems.join("; ")}.`
    : "Permanece dúvida na Elegibilidade Simplificada.";

  setIdentificationInlineResult("identificationSimplifiedResult", "identificationSimplifiedTitle", "identificationSimplifiedText", "identificationSimplifiedActions", "Discutir em reunião de equipe e aplicar SPICT-BR", "Item positivo ou dúvida na Elegibilidade Simplificada deve acionar discussão em equipe e avaliação com SPICT-BR.", [
    selectedSimplifiedItems,
    "Levar o caso selecionado pelo ACS para reunião de equipe.",
    "Aplicar o SPICT-BR com participação da equipe multiprofissional.",
    "Registrar motivo da triagem e principais necessidades observadas.",
  ]);

  if (!identificationState.spict) {
    hideIdentificationInlineResult("identificationSpictResult");
    if (scrollAfterStep) scrollIdentificationTo('[data-identification-requires="spict"]');
    return;
  }

  if (identificationState.spict === "negative") {
    setIdentificationInlineResult("identificationSpictResult", "identificationSpictTitle", "identificationSpictText", "identificationSpictActions", "Interromper fluxo", "Sem item positivo no SPICT-BR, o fluxo de elegibilidade para abordagem paliativa completa pode ser interrompido.", [
      "Reavaliar periodicamente o tratamento atual, sintomas, funcionalidade e carga familiar.",
      "Se a dúvida persistir, discutir com equipe multiprofissional ou apoio matricial antes de encerrar a avaliação.",
    ]);
    if (scrollAfterStep) scrollIdentificationTo("#identificationSpictResult");
    return;
  }

  const selectedSpictItems = identificationState.spictItems.length
    ? `Indicadores SPICT-BR selecionados: ${identificationState.spictItems.join("; ")}.`
    : "Permanece dúvida após aplicação do SPICT-BR.";

  setIdentificationInlineResult("identificationSpictResult", "identificationSpictTitle", "identificationSpictText", "identificationSpictActions", "Aplicar pergunta surpresa", "SPICT-BR positivo ou dúvida sustentada indica seguir para priorização com a pergunta surpresa.", [
    selectedSpictItems,
    "Pergunte: “Eu ficaria surpreso se esta pessoa falecesse nos próximos 12 meses?”.",
    "Use a resposta para definir prioridade de acompanhamento, não como previsão rígida de tempo.",
  ]);

  if (!identificationState.surprise) {
    if (scrollAfterStep) scrollIdentificationTo('[data-identification-requires="surprise"]');
    return;
  }

  if (identificationState.surprise === "no") {
    setIdentificationResult("Abordagem paliativa completa prioritária", "A resposta “não” à pergunta surpresa indica maior prioridade para abordagem paliativa completa e planejamento compartilhado.", [
      "Reavaliar tratamento atual e medicamentos para cuidado otimizado.",
      "Pactuar objetivos do cuidado atual e futuro com pessoa e família.",
      "Planejar antecipadamente risco de perda cognitiva ou piora funcional.",
      "Registrar em prontuário, comunicar e coordenar o plano geral de cuidados.",
      "Considerar especialista quando sintomas ou necessidades forem complexos e difíceis de manejar.",
    ]);
    if (scrollAfterStep) scrollIdentificationTo(".identification-result");
    return;
  }

  if (identificationState.surprise === "yes") {
    setIdentificationResult("Abordagem paliativa completa com seguimento programado", "Mesmo sem prioridade pela pergunta surpresa, o SPICT-BR positivo indica necessidade de abordagem paliativa completa proporcional.", [
      "Revisar necessidades atuais, sintomas e funcionalidade.",
      "Pactuar plano de cuidado e definir periodicidade de reavaliação pela APS.",
      "Registrar elegibilidade, preferências, cuidador de referência e critérios para acionar a rede.",
    ]);
    if (scrollAfterStep) scrollIdentificationTo(".identification-result");
    return;
  }

  setIdentificationResult("Discutir prioridade em equipe", "Quando a resposta à pergunta surpresa é incerta, a decisão deve ser compartilhada pela equipe multiprofissional.", [
    "Revisar trajetória da doença, internações, funcionalidade, sintomas e sobrecarga do cuidador.",
    "Definir se o caso será acompanhado como prioritário ou reavaliado em prazo curto.",
    "Registrar a incerteza e o plano de reavaliação.",
  ]);
  if (scrollAfterStep) scrollIdentificationTo(".identification-result");
}

document.querySelectorAll("[data-identification-flow]").forEach((button) => {
  button.addEventListener("click", () => {
    const group = button.dataset.identificationFlow;
    identificationState[group] = button.dataset.value;

    document.querySelectorAll(`[data-identification-flow="${group}"]`).forEach((item) => {
      item.classList.toggle("active", item === button);
    });

    renderIdentificationFlow(true);
  });
});

document.querySelectorAll("[data-identification-simplified-item]").forEach((checkbox) => {
  checkbox.addEventListener("change", () => {
    if (checkbox.checked) {
      const none = document.querySelector("[data-identification-simplified-none]");
      const doubt = document.querySelector("[data-identification-simplified-doubt]");
      if (none) none.checked = false;
      if (doubt) doubt.checked = false;
    }
    renderIdentificationFlow(true);
  });
});

document.querySelector("[data-identification-simplified-none]")?.addEventListener("change", (event) => {
  if (event.target.checked) {
    document.querySelectorAll("[data-identification-simplified-item]").forEach((checkbox) => {
      checkbox.checked = false;
    });
    const doubt = document.querySelector("[data-identification-simplified-doubt]");
    if (doubt) doubt.checked = false;
  }
  renderIdentificationFlow(true);
});

document.querySelector("[data-identification-simplified-doubt]")?.addEventListener("change", (event) => {
  if (event.target.checked) {
    document.querySelectorAll("[data-identification-simplified-item]").forEach((checkbox) => {
      checkbox.checked = false;
    });
    const none = document.querySelector("[data-identification-simplified-none]");
    if (none) none.checked = false;
  }
  renderIdentificationFlow(true);
});

document.querySelectorAll("[data-identification-spict-item]").forEach((checkbox) => {
  checkbox.addEventListener("change", () => {
    if (checkbox.checked) {
      const none = document.querySelector("[data-identification-spict-none]");
      const doubt = document.querySelector("[data-identification-spict-doubt]");
      if (none) none.checked = false;
      if (doubt) doubt.checked = false;
    }
    renderIdentificationFlow(true);
  });
});

document.querySelector("[data-identification-spict-none]")?.addEventListener("change", (event) => {
  if (event.target.checked) {
    document.querySelectorAll("[data-identification-spict-item]").forEach((checkbox) => {
      checkbox.checked = false;
    });
    const doubt = document.querySelector("[data-identification-spict-doubt]");
    if (doubt) doubt.checked = false;
  }
  renderIdentificationFlow(true);
});

document.querySelector("[data-identification-spict-doubt]")?.addEventListener("change", (event) => {
  if (event.target.checked) {
    document.querySelectorAll("[data-identification-spict-item]").forEach((checkbox) => {
      checkbox.checked = false;
    });
    const none = document.querySelector("[data-identification-spict-none]");
    if (none) none.checked = false;
  }
  renderIdentificationFlow(true);
});

renderIdentificationFlow();

function openCoughSubtab(targetId, focusPanel = true) {
  const targetPanel = document.getElementById(targetId);

  document.querySelectorAll("[data-cough-subtab]").forEach((subtab) => {
    subtab.classList.toggle("active", subtab.dataset.coughSubtab === targetId);
  });

  document.querySelectorAll(".cough-subpanel").forEach((panel) => {
    panel.classList.toggle("active", panel.id === targetId);
  });

  history.replaceState(null, "", `#${targetId}`);

  if (focusPanel) {
    targetPanel?.scrollIntoView({ behavior: "smooth", block: "start" });
    targetPanel?.focus({ preventScroll: true });
  }
}

document.querySelectorAll("[data-cough-subtab]").forEach((button) => {
  button.addEventListener("click", () => {
    openCoughSubtab(button.dataset.coughSubtab);
  });
});

function openDyspneaSubtab(targetId, focusPanel = true) {
  const targetPanel = document.getElementById(targetId);

  document.querySelectorAll("[data-dyspnea-subtab]").forEach((subtab) => {
    subtab.classList.toggle("active", subtab.dataset.dyspneaSubtab === targetId);
  });

  document.querySelectorAll(".dyspnea-subpanel").forEach((panel) => {
    panel.classList.toggle("active", panel.id === targetId);
  });

  history.replaceState(null, "", `#${targetId}`);

  if (focusPanel) {
    targetPanel?.scrollIntoView({ behavior: "smooth", block: "start" });
    targetPanel?.focus({ preventScroll: true });
  }
}

document.querySelectorAll("[data-dyspnea-subtab]").forEach((button) => {
  button.addEventListener("click", () => {
    openDyspneaSubtab(button.dataset.dyspneaSubtab);
  });
});

function openNauseaSubtab(targetId, focusPanel = true) {
  const targetPanel = document.getElementById(targetId);

  document.querySelectorAll("[data-nausea-subtab]").forEach((subtab) => {
    subtab.classList.toggle("active", subtab.dataset.nauseaSubtab === targetId);
  });

  document.querySelectorAll(".nausea-subpanel").forEach((panel) => {
    panel.classList.toggle("active", panel.id === targetId);
  });

  history.replaceState(null, "", `#${targetId}`);

  if (focusPanel) {
    targetPanel?.scrollIntoView({ behavior: "smooth", block: "start" });
    targetPanel?.focus({ preventScroll: true });
  }
}

document.querySelectorAll("[data-nausea-subtab]").forEach((button) => {
  button.addEventListener("click", () => {
    openNauseaSubtab(button.dataset.nauseaSubtab);
  });
});

function openFatigueSubtab(targetId, focusPanel = true) {
  const targetPanel = document.getElementById(targetId);

  document.querySelectorAll("[data-fatigue-subtab]").forEach((subtab) => {
    subtab.classList.toggle("active", subtab.dataset.fatigueSubtab === targetId);
  });

  document.querySelectorAll(".fatigue-subpanel").forEach((panel) => {
    panel.classList.toggle("active", panel.id === targetId);
  });

  history.replaceState(null, "", `#${targetId}`);

  if (focusPanel) {
    targetPanel?.scrollIntoView({ behavior: "smooth", block: "start" });
    targetPanel?.focus({ preventScroll: true });
  }
}

document.querySelectorAll("[data-fatigue-subtab]").forEach((button) => {
  button.addEventListener("click", () => {
    openFatigueSubtab(button.dataset.fatigueSubtab);
  });
});

function openAnorexiaSubtab(targetId, focusPanel = true) {
  const targetPanel = document.getElementById(targetId);

  document.querySelectorAll("[data-anorexia-subtab]").forEach((subtab) => {
    subtab.classList.toggle("active", subtab.dataset.anorexiaSubtab === targetId);
  });

  document.querySelectorAll(".anorexia-subpanel").forEach((panel) => {
    panel.classList.toggle("active", panel.id === targetId);
  });

  history.replaceState(null, "", `#${targetId}`);

  if (focusPanel) {
    targetPanel?.scrollIntoView({ behavior: "smooth", block: "start" });
    targetPanel?.focus({ preventScroll: true });
  }
}

document.querySelectorAll("[data-anorexia-subtab]").forEach((button) => {
  button.addEventListener("click", () => {
    openAnorexiaSubtab(button.dataset.anorexiaSubtab);
  });
});

function openGriefSubtab(targetId, focusPanel = true) {
  const targetPanel = document.getElementById(targetId);

  document.querySelectorAll("[data-grief-subtab]").forEach((subtab) => {
    subtab.classList.toggle("active", subtab.dataset.griefSubtab === targetId);
  });

  document.querySelectorAll(".grief-subpanel").forEach((panel) => {
    panel.classList.toggle("active", panel.id === targetId);
  });

  history.replaceState(null, "", `#${targetId}`);

  if (focusPanel) {
    targetPanel?.scrollIntoView({ behavior: "smooth", block: "start" });
    targetPanel?.focus({ preventScroll: true });
  }
}

document.querySelectorAll("[data-grief-subtab]").forEach((button) => {
  button.addEventListener("click", () => {
    openGriefSubtab(button.dataset.griefSubtab);
  });
});

function openHypodermoSubtab(targetId, focusPanel = true) {
  const targetPanel = document.getElementById(targetId);

  document.querySelectorAll("[data-hypodermo-subtab]").forEach((subtab) => {
    subtab.classList.toggle("active", subtab.dataset.hypodermoSubtab === targetId);
  });

  document.querySelectorAll(".hypodermo-subpanel").forEach((panel) => {
    panel.classList.toggle("active", panel.id === targetId);
  });

  history.replaceState(null, "", `#${targetId}`);

  if (focusPanel) {
    targetPanel?.scrollIntoView({ behavior: "smooth", block: "start" });
    targetPanel?.focus({ preventScroll: true });
  }
}

document.querySelectorAll("[data-hypodermo-subtab]").forEach((button) => {
  button.addEventListener("click", () => {
    openHypodermoSubtab(button.dataset.hypodermoSubtab);
  });
});

function openOralSubtab(targetId, focusPanel = true) {
  const targetPanel = document.getElementById(targetId);

  document.querySelectorAll("[data-oral-subtab]").forEach((subtab) => {
    subtab.classList.toggle("active", subtab.dataset.oralSubtab === targetId);
  });

  document.querySelectorAll(".oral-subpanel").forEach((panel) => {
    panel.classList.toggle("active", panel.id === targetId);
  });

  history.replaceState(null, "", `#${targetId}`);

  if (focusPanel) {
    targetPanel?.scrollIntoView({ behavior: "smooth", block: "start" });
    targetPanel?.focus({ preventScroll: true });
  }
}

document.querySelectorAll("[data-oral-subtab]").forEach((button) => {
  button.addEventListener("click", () => {
    openOralSubtab(button.dataset.oralSubtab);
  });
});

function openIvSubtab(targetId, focusPanel = true) {
  const targetPanel = document.getElementById(targetId);

  document.querySelectorAll("[data-iv-subtab]").forEach((subtab) => {
    subtab.classList.toggle("active", subtab.dataset.ivSubtab === targetId);
  });

  document.querySelectorAll(".iv-subpanel").forEach((panel) => {
    panel.classList.toggle("active", panel.id === targetId);
  });

  history.replaceState(null, "", `#${targetId}`);

  if (focusPanel) {
    targetPanel?.scrollIntoView({ behavior: "smooth", block: "start" });
    targetPanel?.focus({ preventScroll: true });
  }
}

document.querySelectorAll("[data-iv-subtab]").forEach((button) => {
  button.addEventListener("click", () => {
    openIvSubtab(button.dataset.ivSubtab);
  });
});

function openSublingualSubtab(targetId, focusPanel = true) {
  const targetPanel = document.getElementById(targetId);

  document.querySelectorAll("[data-sublingual-subtab]").forEach((subtab) => {
    subtab.classList.toggle("active", subtab.dataset.sublingualSubtab === targetId);
  });

  document.querySelectorAll(".sublingual-subpanel").forEach((panel) => {
    panel.classList.toggle("active", panel.id === targetId);
  });

  history.replaceState(null, "", `#${targetId}`);

  if (focusPanel) {
    targetPanel?.scrollIntoView({ behavior: "smooth", block: "start" });
    targetPanel?.focus({ preventScroll: true });
  }
}

document.querySelectorAll("[data-sublingual-subtab]").forEach((button) => {
  button.addEventListener("click", () => {
    openSublingualSubtab(button.dataset.sublingualSubtab);
  });
});

function openRectalSubtab(targetId, focusPanel = true) {
  const targetPanel = document.getElementById(targetId);

  document.querySelectorAll("[data-rectal-subtab]").forEach((subtab) => {
    subtab.classList.toggle("active", subtab.dataset.rectalSubtab === targetId);
  });

  document.querySelectorAll(".rectal-subpanel").forEach((panel) => {
    panel.classList.toggle("active", panel.id === targetId);
  });

  history.replaceState(null, "", `#${targetId}`);

  if (focusPanel) {
    targetPanel?.scrollIntoView({ behavior: "smooth", block: "start" });
    targetPanel?.focus({ preventScroll: true });
  }
}

document.querySelectorAll("[data-rectal-subtab]").forEach((button) => {
  button.addEventListener("click", () => {
    openRectalSubtab(button.dataset.rectalSubtab);
  });
});

function openTubeSubtab(targetId, focusPanel = true) {
  const targetPanel = document.getElementById(targetId);

  document.querySelectorAll("[data-tube-subtab]").forEach((subtab) => {
    subtab.classList.toggle("active", subtab.dataset.tubeSubtab === targetId);
  });

  document.querySelectorAll(".tube-subpanel").forEach((panel) => {
    panel.classList.toggle("active", panel.id === targetId);
  });

  history.replaceState(null, "", `#${targetId}`);

  if (focusPanel) {
    targetPanel?.scrollIntoView({ behavior: "smooth", block: "start" });
    targetPanel?.focus({ preventScroll: true });
  }
}

document.querySelectorAll("[data-tube-subtab]").forEach((button) => {
  button.addEventListener("click", () => {
    openTubeSubtab(button.dataset.tubeSubtab);
  });
});

function openInsomniaSubtab(targetId, focusPanel = true) {
  const targetPanel = document.getElementById(targetId);

  document.querySelectorAll("[data-insomnia-subtab]").forEach((subtab) => {
    subtab.classList.toggle("active", subtab.dataset.insomniaSubtab === targetId);
  });

  document.querySelectorAll(".insomnia-subpanel").forEach((panel) => {
    panel.classList.toggle("active", panel.id === targetId);
  });

  history.replaceState(null, "", `#${targetId}`);

  if (focusPanel) {
    targetPanel?.scrollIntoView({ behavior: "smooth", block: "start" });
    targetPanel?.focus({ preventScroll: true });
  }
}

document.querySelectorAll("[data-insomnia-subtab]").forEach((button) => {
  button.addEventListener("click", () => {
    openInsomniaSubtab(button.dataset.insomniaSubtab);
  });
});

function openPediatricSubtab(targetId, focusPanel = true) {
  const targetPanel = document.getElementById(targetId);

  document.querySelectorAll("[data-pediatric-subtab]").forEach((subtab) => {
    subtab.classList.toggle("active", subtab.dataset.pediatricSubtab === targetId);
  });

  document.querySelectorAll(".pediatric-subpanel").forEach((panel) => {
    panel.classList.toggle("active", panel.id === targetId);
  });

  history.replaceState(null, "", `#${targetId}`);

  if (focusPanel) {
    targetPanel?.scrollIntoView({ behavior: "smooth", block: "start" });
    targetPanel?.focus({ preventScroll: true });
  }
}

document.querySelectorAll("[data-pediatric-subtab]").forEach((button) => {
  button.addEventListener("click", () => {
    openPediatricSubtab(button.dataset.pediatricSubtab);
  });
});

function openPediatricSymptomSubtab(targetId, focusPanel = true) {
  const targetPanel = document.getElementById(targetId);

  document.querySelectorAll("[data-pediatric-symptom-subtab]").forEach((subtab) => {
    subtab.classList.toggle("active", subtab.dataset.pediatricSymptomSubtab === targetId);
  });

  document.querySelectorAll(".pediatric-symptom-subpanel").forEach((panel) => {
    panel.classList.toggle("active", panel.id === targetId);
  });

  history.replaceState(null, "", `#${targetId}`);

  if (focusPanel) {
    targetPanel?.scrollIntoView({ behavior: "smooth", block: "start" });
    targetPanel?.focus({ preventScroll: true });
  }
}

document.querySelectorAll("[data-pediatric-symptom-subtab]").forEach((button) => {
  button.addEventListener("click", () => {
    openPediatricSymptomSubtab(button.dataset.pediatricSymptomSubtab);
  });
});

function focusCoughResult() {
  const result = document.querySelector(".cough-result");
  if (!result) return;
  result.scrollIntoView({ behavior: "smooth", block: "start" });
}

function focusCoughTypeStep() {
  const step = document.querySelector("[data-cough-group='type']");
  if (!step) return;
  step.scrollIntoView({ behavior: "smooth", block: "center" });
}

function updateCoughStepAccess() {
  const hasAlerts = coughState.alerts.length > 0;

  document.querySelectorAll("[data-requires-cough-step-one]").forEach((step) => {
    const shouldUnlock = coughState.stepOneAnswered && (!hasAlerts || step.classList.contains("cough-result"));
    step.classList.toggle("locked-step", !shouldUnlock);
    step.setAttribute("aria-disabled", String(!shouldUnlock));
  });
}

function updateCoughResult() {
  const title = document.querySelector("#coughResultTitle");
  const text = document.querySelector("#coughResultText");
  const actions = document.querySelector("#coughResultActions");

  if (!title || !text || !actions) return;

  if (!coughState.stepOneAnswered) {
    title.textContent = "Pesquise sinais de alerta para iniciar";
    text.textContent = "Selecione uma resposta no passo 1 antes de avançar para característica predominante e conduta.";
    actions.replaceChildren(
      ...[
        "Marque um ou mais sinais de alerta, se presentes.",
        "Se nenhum alerta for identificado, marque essa opção para liberar os próximos passos.",
      ].map(createResultItem)
    );
    return;
  }

  if (coughState.alerts.length > 0) {
    title.textContent = "Interromper fluxo: sinais de alerta presentes";
    text.textContent =
      "Antes de seguir o manejo sintomático habitual da tosse, priorizar avaliação dirigida dos sinais de alerta selecionados.";
    actions.replaceChildren(
      ...[
        ...coughState.alerts.map((alert) => coughAlertActions[alert]),
        "Registrar os alertas, orientar retorno imediato se houver piora e acionar avaliação presencial/urgência conforme gravidade e plano de cuidado.",
      ].map(createResultItem)
    );
    return;
  }

  const plan = coughTypePlans[coughState.type];
  const combinedTreatment = buildCombinedCoughTreatment(plan, coughState.factors);
  const factorActions = coughState.factors.map((factor) => coughFactorActions[factor]).filter(Boolean);

  title.textContent = plan.title;
  text.textContent = coughState.factors.length
    ? `${plan.text} A conduta abaixo combina o padrão predominante com os fatores associados selecionados.`
    : plan.text;
  actions.replaceChildren(
    ...(combinedTreatment.cause.length ? [createResultSection("Causa provável", combinedTreatment.cause, "cause")] : []),
    ...(combinedTreatment.nonMedication.length
      ? [createResultSection("Tratamento não medicamentoso", combinedTreatment.nonMedication, "nonmedication")]
      : []),
    ...(combinedTreatment.medication.length
      ? [createResultSection("Tratamento medicamentoso", combinedTreatment.medication, "medication")]
      : []),
    ...(combinedTreatment.steps.length ? [createResultSection("Tratamento em etapas", combinedTreatment.steps, "steps")] : []),
    ...(factorActions.length ? [createResultSection("Ajustes pelos fatores associados", factorActions, "factors")] : []),
    ...combinedTreatment.notes.map(createResultItem),
    createResultItem("Reavaliar resposta, sonolência, constipação, boca seca, retenção urinária, conforto respiratório e impacto no sono/fadiga.")
  );
}

function focusDyspneaResult() {
  const result = document.querySelector(".dyspnea-result");
  if (!result) return;
  result.scrollIntoView({ behavior: "smooth", block: "start" });
}

function focusDyspneaIntensityStep() {
  const step = document.querySelector("[data-dyspnea-group='intensity']");
  if (!step) return;
  step.scrollIntoView({ behavior: "smooth", block: "center" });
}

function updateDyspneaStepAccess() {
  const hasAlerts = dyspneaState.alerts.length > 0;

  document.querySelectorAll("[data-requires-dyspnea-step-one]").forEach((step) => {
    const shouldUnlock = dyspneaState.stepOneAnswered && (!hasAlerts || step.classList.contains("dyspnea-result"));
    step.classList.toggle("locked-step", !shouldUnlock);
    step.setAttribute("aria-disabled", String(!shouldUnlock));
  });
}

function updateDyspneaResult() {
  const title = document.querySelector("#dyspneaResultTitle");
  const text = document.querySelector("#dyspneaResultText");
  const actions = document.querySelector("#dyspneaResultActions");

  if (!title || !text || !actions) return;

  if (!dyspneaState.stepOneAnswered) {
    title.textContent = "Pesquise sinais de alerta para iniciar";
    text.textContent = "Selecione uma resposta no passo 1 antes de avançar para intensidade, perfil associado e conduta.";
    actions.replaceChildren(
      ...[
        "Marque um ou mais sinais de alerta, se presentes.",
        "Se nenhum alerta for identificado, marque essa opção para liberar os próximos passos.",
      ].map(createResultItem)
    );
    return;
  }

  if (dyspneaState.alerts.length > 0) {
    title.textContent = "Interromper fluxo: sinais de alerta presentes";
    text.textContent =
      "Antes de seguir o manejo sintomático habitual da dispneia, priorizar avaliação dirigida dos sinais de alerta selecionados.";
    actions.replaceChildren(
      ...[
        ...dyspneaState.alerts.map((alert) => dyspneaAlertActions[alert]),
        "Registrar os alertas, orientar retorno imediato se houver piora e acionar avaliação presencial/urgência conforme gravidade e plano de cuidado.",
      ].map(createResultItem)
    );
    return;
  }

  const plan = dyspneaIntensityPlans[dyspneaState.intensity];
  const factorActions = dyspneaState.factors.map((factor) => dyspneaFactorActions[factor]);

  title.textContent = plan.title;
  text.textContent = plan.text;
  actions.replaceChildren(
    ...plan.actions.map(createResultItem),
    ...factorActions.map(createResultItem),
    createResultItem("Reavaliar intensidade, frequência respiratória, conforto, sedação, constipação, ansiedade, funcionalidade e necessidade de ajuste do plano.")
  );
}

function focusFatigueResult() {
  const result = document.querySelector(".fatigue-result");
  if (!result) return;
  result.scrollIntoView({ behavior: "smooth", block: "start" });
}

function focusFatigueIntensityStep() {
  const step = document.querySelector("[data-fatigue-group='intensity']");
  if (!step) return;
  step.scrollIntoView({ behavior: "smooth", block: "center" });
}

function updateFatigueStepAccess() {
  const hasAlerts = fatigueState.alerts.length > 0;

  document.querySelectorAll("[data-requires-fatigue-step-one]").forEach((step) => {
    const shouldUnlock = fatigueState.stepOneAnswered && (!hasAlerts || step.classList.contains("fatigue-result"));
    step.classList.toggle("locked-step", !shouldUnlock);
    step.setAttribute("aria-disabled", String(!shouldUnlock));
  });
}

function updateFatigueResult() {
  const title = document.querySelector("#fatigueResultTitle");
  const text = document.querySelector("#fatigueResultText");
  const actions = document.querySelector("#fatigueResultActions");

  if (!title || !text || !actions) return;

  if (!fatigueState.stepOneAnswered) {
    title.textContent = "Pesquise sinais de alerta para iniciar";
    text.textContent = "Selecione uma resposta no passo 1 antes de avançar para intensidade, fatores associados e conduta.";
    actions.replaceChildren(
      ...[
        "Marque um ou mais sinais de alerta, se presentes.",
        "Se nenhum alerta for identificado, marque essa opção para liberar os próximos passos.",
      ].map(createResultItem)
    );
    return;
  }

  if (fatigueState.alerts.length > 0) {
    title.textContent = "Interromper fluxo: sinais de alerta presentes";
    text.textContent =
      "Antes de seguir o manejo habitual da fadiga, priorizar avaliação dirigida dos sinais de alerta selecionados.";
    actions.replaceChildren(
      ...[
        ...fatigueState.alerts.map((alert) => fatigueAlertActions[alert]),
        "Registrar os alertas, orientar retorno imediato se houver piora e acionar avaliação presencial/urgência conforme gravidade e plano de cuidado.",
      ].map(createResultItem)
    );
    return;
  }

  const plan = fatigueIntensityPlans[fatigueState.intensity];
  const factorActions = fatigueState.factors.map((factor) => fatigueFactorActions[factor]);

  title.textContent = plan.title;
  text.textContent = plan.text;
  actions.replaceChildren(
    ...plan.actions.map(createResultItem),
    ...factorActions.map(createResultItem),
    createResultItem("Reavaliar intensidade, função, sono, humor, sintomas associados, eventos adversos e carga do cuidador em prazo definido.")
  );
}

function focusAnorexiaResult() {
  const result = document.querySelector(".anorexia-result");
  if (!result) return;
  result.scrollIntoView({ behavior: "smooth", block: "start" });
}

function focusAnorexiaStageStep() {
  const step = document.querySelector("[data-anorexia-group='stage']");
  if (!step) return;
  step.scrollIntoView({ behavior: "smooth", block: "center" });
}

function updateAnorexiaStepAccess() {
  const hasAlerts = anorexiaState.alerts.length > 0;

  document.querySelectorAll("[data-requires-anorexia-step-one]").forEach((step) => {
    const shouldUnlock = anorexiaState.stepOneAnswered && (!hasAlerts || step.classList.contains("anorexia-result"));
    step.classList.toggle("locked-step", !shouldUnlock);
    step.setAttribute("aria-disabled", String(!shouldUnlock));
  });
}

function updateAnorexiaResult() {
  const title = document.querySelector("#anorexiaResultTitle");
  const text = document.querySelector("#anorexiaResultText");
  const actions = document.querySelector("#anorexiaResultActions");

  if (!title || !text || !actions) return;

  if (!anorexiaState.stepOneAnswered) {
    title.textContent = "Pesquise sinais de alerta para iniciar";
    text.textContent = "Selecione uma resposta no passo 1 antes de avançar para classificação da síndrome, fatores associados e conduta.";
    actions.replaceChildren(
      ...[
        "Marque um ou mais sinais de alerta, se presentes.",
        "Se nenhum alerta for identificado, marque essa opção para liberar os próximos passos.",
      ].map(createResultItem)
    );
    return;
  }

  if (anorexiaState.alerts.length > 0) {
    title.textContent = "Interromper fluxo: sinais de alerta presentes";
    text.textContent =
      "Antes de seguir o manejo habitual da síndrome de anorexia-caquexia, priorizar avaliação dirigida dos sinais de alerta selecionados.";
    actions.replaceChildren(
      ...[
        ...anorexiaState.alerts.map((alert) => anorexiaAlertActions[alert]),
        "Registrar os alertas, orientar retorno imediato se houver piora e acionar avaliação presencial/urgência conforme gravidade e plano de cuidado.",
      ].map(createResultItem)
    );
    return;
  }

  const plan = anorexiaStagePlans[anorexiaState.stage];
  const selectedFactorPlans = anorexiaState.factors.map((factor) => anorexiaFactorActions[factor]);
  const nonPharmacologicalActions = [
    ...plan.nonPharmacological,
    ...selectedFactorPlans.map((factorPlan) => factorPlan.nonPharmacological),
    "Reavaliar apetite, ingesta, peso quando fizer sentido, sintomas, funcionalidade, conforto e sofrimento familiar em prazo definido.",
  ];
  const pharmacologicalActions = [
    ...plan.pharmacological,
    ...selectedFactorPlans.map((factorPlan) => factorPlan.pharmacological),
    "Monitorar benefício, sonolência, edema, hiperglicemia, tromboembolismo, delirium, constipação e outros efeitos adversos conforme medicamento utilizado.",
  ];

  title.textContent = plan.title;
  text.textContent = plan.text;
  actions.replaceChildren(
    createResultSection("Condutas não farmacológicas", nonPharmacologicalActions, "nonmedication"),
    createResultSection("Condutas farmacológicas", pharmacologicalActions, "medication")
  );
}

function updatePainResult() {
  const title = document.querySelector("#painResultTitle");
  const text = document.querySelector("#painResultText");
  const actions = document.querySelector("#painResultActions");

  if (!title || !text || !actions) return;

  if (!painState.stepOneAnswered) {
    title.textContent = "Pesquise sinais de alerta para iniciar";
    text.textContent = "Selecione uma resposta no passo 1 antes de avançar para classificação, intensidade e conduta.";
    actions.replaceChildren(
      ...[
        "Marque um ou mais sinais de alerta, se presentes.",
        "Se nenhum alerta for identificado, marque essa opção para liberar os próximos passos.",
      ].map((action) => {
        const item = document.createElement("li");
        item.textContent = action;
        return item;
      })
    );
    return;
  }

  if (painState.redFlags.length > 0) {
    title.textContent = "Interromper fluxo: sinais de alerta presentes";
    text.textContent =
      "Antes de escalonar o manejo analgésico habitual, priorizar avaliação dirigida dos sinais de alerta selecionados e definir conduta de segurança.";
    actions.replaceChildren(
      ...[
        ...painState.redFlags.map((flag) => redFlagActions[flag]),
        "Registrar os alertas encontrados, orientar retorno imediato se houver piora e acionar avaliação presencial/urgência conforme gravidade.",
      ].map(createResultItem)
    );
    return;
  }

  if (!painState.mechanism) {
    title.textContent = "Classifique a dor para gerar conduta";
    text.textContent =
      "Preencha o questionário interativo de classificação fenotípica da dor. A conduta combinará tratamento medicamentoso, não medicamentoso e fitoterápico quando apropriado.";
    actions.replaceChildren(
      ...[
        "Selecione os achados clínicos presentes no questionário de classificação fenotípica.",
        "Se houver sinais de alerta, o fluxo será interrompido e a conduta de segurança será priorizada.",
      ].map(createResultItem)
    );
    return;
  }

  const recommendation = mechanismRecommendations[painState.mechanism];
  const medicationPlan = getMedicationPlan(painState.mechanism, painState.intensity, painState.phenotype);
  const combinedDecision = buildCombinedPainDecision(painState.mechanism, painState.intensity, painState.phenotype);
  const nonMedicationActions = [
    ...combinedDecision.nonMedication,
    ...(nonMedicationPlanMap[painState.mechanism]?.[painState.intensity] || []),
    "Acompanhar intensidade, função, sono, humor, autonomia, qualidade de vida e adesão.",
  ];
  const phytotherapyActions = getPhytotherapyActions(painState.mechanism, painState.intensity);
  title.textContent = `Plano multimodal para dor crônica ${recommendation.label} ${intensityLabels[painState.intensity]}`;
  text.textContent = `Sugestão gerada pela combinação entre classificação fenotípica, intensidade informada e perfil terapêutico: ${recommendation.text}`;

  const intensityAction =
    painState.intensity === "severe"
      ? "Se dor forte, revisar rapidamente analgesia, resgate, sofrimento associado e necessidade de avaliação presencial."
      : painState.intensity === "moderate"
        ? "Se dor moderada, ajustar plano com meta funcional explícita e reavaliar resposta em intervalo curto."
        : "Se dor leve, priorizar função, autocuidado e menor carga medicamentosa eficaz.";

  actions.replaceChildren(
    createResultSection("Tomada de decisão combinada", combinedDecision.focus, "cause"),
    createResultSection("Tratamento não medicamentoso", nonMedicationActions, "nonmedication"),
    createMedicationSection(medicationPlan),
    createResultSection("Fitoterapia", phytotherapyActions, "phytotherapy"),
    createResultItem(intensityAction),
    createResultItem("Reavaliar buscando melhora mínima de 30%, ganho funcional e tolerabilidade aceitável.")
  );
}

function updateStepAccess() {
  const hasRealRedFlags = painState.redFlags.length > 0;

  document.querySelectorAll("[data-requires-step-one]").forEach((step) => {
    const shouldUnlock = painState.stepOneAnswered && (!hasRealRedFlags || step.classList.contains("pain-result"));
    step.classList.toggle("locked-step", !shouldUnlock);
    step.setAttribute("aria-disabled", String(!shouldUnlock));
  });
}

function focusNextStepSuggested() {
  const result = document.querySelector(".pain-result");
  if (!result) return;
  result.scrollIntoView({ behavior: "smooth", block: "start" });
}

function focusPhenotypeStep() {
  const step = document.querySelector(".phenotype-tool");
  if (!step) return;
  step.scrollIntoView({ behavior: "smooth", block: "start" });
}

document.querySelectorAll("[data-pain-group]").forEach((group) => {
  group.addEventListener("click", (event) => {
    const selected = event.target.closest(".segment");
    if (!selected) return;

    painState[group.dataset.painGroup] = selected.dataset.value;

    group.querySelectorAll(".segment").forEach((button) => {
      button.classList.toggle("active", button === selected);
    });

    updatePainResult();
  });
});

document.querySelectorAll("[data-red-flag]").forEach((checkbox) => {
  checkbox.addEventListener("change", () => {
    if (checkbox.checked) {
      const noRedFlags = document.querySelector("[data-no-red-flags]");
      if (noRedFlags) noRedFlags.checked = false;
    }

    painState.redFlags = Array.from(document.querySelectorAll("[data-red-flag]:checked")).map(
      (item) => item.dataset.redFlag
    );
    painState.stepOneAnswered = painState.redFlags.length > 0 || document.querySelector("[data-no-red-flags]")?.checked;
    updateStepAccess();
    updatePainResult();
    if (painState.redFlags.length > 0) {
      focusNextStepSuggested();
    }
  });
});

document.querySelector("[data-no-red-flags]")?.addEventListener("change", (event) => {
  if (event.target.checked) {
    document.querySelectorAll("[data-red-flag]").forEach((checkbox) => {
      checkbox.checked = false;
    });
    painState.redFlags = [];
  }

  painState.stepOneAnswered = event.target.checked || painState.redFlags.length > 0;
  updateStepAccess();
  updatePainResult();
  if (event.target.checked) {
    focusPhenotypeStep();
  }
});

document.querySelectorAll("[data-cough-group]").forEach((group) => {
  group.addEventListener("click", (event) => {
    const selected = event.target.closest(".segment");
    if (!selected) return;

    coughState[group.dataset.coughGroup] = selected.dataset.value;

    group.querySelectorAll(".segment").forEach((button) => {
      button.classList.toggle("active", button === selected);
    });

    updateCoughResult();
  });
});

document.querySelectorAll("[data-cough-alert]").forEach((checkbox) => {
  checkbox.addEventListener("change", () => {
    if (checkbox.checked) {
      const noAlerts = document.querySelector("[data-no-cough-alerts]");
      if (noAlerts) noAlerts.checked = false;
    }

    coughState.alerts = Array.from(document.querySelectorAll("[data-cough-alert]:checked")).map(
      (item) => item.dataset.coughAlert
    );
    coughState.stepOneAnswered =
      coughState.alerts.length > 0 || document.querySelector("[data-no-cough-alerts]")?.checked;
    updateCoughStepAccess();
    updateCoughResult();
    if (coughState.alerts.length > 0) {
      focusCoughResult();
    }
  });
});

document.querySelector("[data-no-cough-alerts]")?.addEventListener("change", (event) => {
  if (event.target.checked) {
    document.querySelectorAll("[data-cough-alert]").forEach((checkbox) => {
      checkbox.checked = false;
    });
    coughState.alerts = [];
  }

  coughState.stepOneAnswered = event.target.checked || coughState.alerts.length > 0;
  updateCoughStepAccess();
  updateCoughResult();
  if (event.target.checked) {
    focusCoughTypeStep();
  }
});

document.querySelectorAll("[data-cough-factor]").forEach((checkbox) => {
  checkbox.addEventListener("change", () => {
    coughState.factors = Array.from(document.querySelectorAll("[data-cough-factor]:checked")).map(
      (item) => item.dataset.coughFactor
    );
    updateCoughResult();
  });
});

document.querySelectorAll("[data-dyspnea-group]").forEach((group) => {
  group.addEventListener("click", (event) => {
    const selected = event.target.closest(".segment");
    if (!selected) return;

    dyspneaState[group.dataset.dyspneaGroup] = selected.dataset.value;

    group.querySelectorAll(".segment").forEach((button) => {
      button.classList.toggle("active", button === selected);
    });

    updateDyspneaResult();
  });
});

document.querySelectorAll("[data-dyspnea-alert]").forEach((checkbox) => {
  checkbox.addEventListener("change", () => {
    if (checkbox.checked) {
      const noAlerts = document.querySelector("[data-no-dyspnea-alerts]");
      if (noAlerts) noAlerts.checked = false;
    }

    dyspneaState.alerts = Array.from(document.querySelectorAll("[data-dyspnea-alert]:checked")).map(
      (item) => item.dataset.dyspneaAlert
    );
    dyspneaState.stepOneAnswered =
      dyspneaState.alerts.length > 0 || document.querySelector("[data-no-dyspnea-alerts]")?.checked;
    updateDyspneaStepAccess();
    updateDyspneaResult();
    if (dyspneaState.alerts.length > 0) {
      focusDyspneaResult();
    }
  });
});

document.querySelector("[data-no-dyspnea-alerts]")?.addEventListener("change", (event) => {
  if (event.target.checked) {
    document.querySelectorAll("[data-dyspnea-alert]").forEach((checkbox) => {
      checkbox.checked = false;
    });
    dyspneaState.alerts = [];
  }

  dyspneaState.stepOneAnswered = event.target.checked || dyspneaState.alerts.length > 0;
  updateDyspneaStepAccess();
  updateDyspneaResult();
  if (event.target.checked) {
    focusDyspneaIntensityStep();
  }
});

document.querySelectorAll("[data-dyspnea-factor]").forEach((checkbox) => {
  checkbox.addEventListener("change", () => {
    dyspneaState.factors = Array.from(document.querySelectorAll("[data-dyspnea-factor]:checked")).map(
      (item) => item.dataset.dyspneaFactor
    );
    updateDyspneaResult();
  });
});

document.querySelectorAll("[data-fatigue-group]").forEach((group) => {
  group.addEventListener("click", (event) => {
    const selected = event.target.closest(".segment");
    if (!selected) return;

    fatigueState[group.dataset.fatigueGroup] = selected.dataset.value;

    group.querySelectorAll(".segment").forEach((button) => {
      button.classList.toggle("active", button === selected);
    });

    updateFatigueResult();
  });
});

document.querySelectorAll("[data-fatigue-alert]").forEach((checkbox) => {
  checkbox.addEventListener("change", () => {
    if (checkbox.checked) {
      const noAlerts = document.querySelector("[data-no-fatigue-alerts]");
      if (noAlerts) noAlerts.checked = false;
    }

    fatigueState.alerts = Array.from(document.querySelectorAll("[data-fatigue-alert]:checked")).map(
      (item) => item.dataset.fatigueAlert
    );
    fatigueState.stepOneAnswered =
      fatigueState.alerts.length > 0 || document.querySelector("[data-no-fatigue-alerts]")?.checked;
    updateFatigueStepAccess();
    updateFatigueResult();
    if (fatigueState.alerts.length > 0) {
      focusFatigueResult();
    }
  });
});

document.querySelector("[data-no-fatigue-alerts]")?.addEventListener("change", (event) => {
  if (event.target.checked) {
    document.querySelectorAll("[data-fatigue-alert]").forEach((checkbox) => {
      checkbox.checked = false;
    });
    fatigueState.alerts = [];
  }

  fatigueState.stepOneAnswered = event.target.checked || fatigueState.alerts.length > 0;
  updateFatigueStepAccess();
  updateFatigueResult();
  if (event.target.checked) {
    focusFatigueIntensityStep();
  }
});

document.querySelectorAll("[data-fatigue-factor]").forEach((checkbox) => {
  checkbox.addEventListener("change", () => {
    fatigueState.factors = Array.from(document.querySelectorAll("[data-fatigue-factor]:checked")).map(
      (item) => item.dataset.fatigueFactor
    );
    updateFatigueResult();
  });
});

document.querySelectorAll("[data-anorexia-group]").forEach((group) => {
  group.addEventListener("click", (event) => {
    const selected = event.target.closest(".segment");
    if (!selected) return;

    anorexiaState[group.dataset.anorexiaGroup] = selected.dataset.value;

    group.querySelectorAll(".segment").forEach((button) => {
      button.classList.toggle("active", button === selected);
    });

    updateAnorexiaResult();
  });
});

document.querySelectorAll("[data-anorexia-alert]").forEach((checkbox) => {
  checkbox.addEventListener("change", () => {
    if (checkbox.checked) {
      const noAlerts = document.querySelector("[data-no-anorexia-alerts]");
      if (noAlerts) noAlerts.checked = false;
    }

    anorexiaState.alerts = Array.from(document.querySelectorAll("[data-anorexia-alert]:checked")).map(
      (item) => item.dataset.anorexiaAlert
    );
    anorexiaState.stepOneAnswered =
      anorexiaState.alerts.length > 0 || document.querySelector("[data-no-anorexia-alerts]")?.checked;
    updateAnorexiaStepAccess();
    updateAnorexiaResult();
    if (anorexiaState.alerts.length > 0) {
      focusAnorexiaResult();
    }
  });
});

document.querySelector("[data-no-anorexia-alerts]")?.addEventListener("change", (event) => {
  if (event.target.checked) {
    document.querySelectorAll("[data-anorexia-alert]").forEach((checkbox) => {
      checkbox.checked = false;
    });
    anorexiaState.alerts = [];
  }

  anorexiaState.stepOneAnswered = event.target.checked || anorexiaState.alerts.length > 0;
  updateAnorexiaStepAccess();
  updateAnorexiaResult();
  if (event.target.checked) {
    focusAnorexiaStageStep();
  }
});

document.querySelectorAll("[data-anorexia-factor]").forEach((checkbox) => {
  checkbox.addEventListener("change", () => {
    anorexiaState.factors = Array.from(document.querySelectorAll("[data-anorexia-factor]:checked")).map(
      (item) => item.dataset.anorexiaFactor
    );
    updateAnorexiaResult();
  });
});

document.querySelectorAll("[data-prescription-group]").forEach((group) => {
  group.addEventListener("click", (event) => {
    const selected = event.target.closest(".segment");
    if (!selected) return;

    const groupName = group.dataset.prescriptionGroup;
    const previousValue = prescriptionState[groupName];
    const nextValue = selected.dataset.value;

    prescriptionState[groupName] = nextValue;
    if (groupName === "population" && previousValue && previousValue !== nextValue) {
      prescriptionState.nonpharm = [];
      prescriptionState.medications = [];
      prescriptionState.phytotherapy = [];
    }
    if (groupName === "route") {
      prescriptionState.routeAnswered = true;
      prescriptionState.phytotherapy = [];
    }
    group.querySelectorAll(".segment").forEach((button) => {
      button.classList.toggle("active", button === selected);
    });
    updatePrescriptionStepAccess();
    updatePrescriptionResult();
  });
});

document.querySelector("#addPrescriptionSymptom")?.addEventListener("click", () => {
  const select = document.querySelector("#prescriptionSymptomSelect");
  const symptom = select?.value;
  if (!symptom || prescriptionState.symptoms.includes(symptom)) return;
  prescriptionState.symptoms.push(symptom);
  updatePrescriptionAfterSymptomChange();
});

document.querySelectorAll("[data-prescription-pain-type]").forEach((checkbox) => {
  checkbox.addEventListener("change", () => {
    prescriptionState.painTypes = Array.from(document.querySelectorAll("[data-prescription-pain-type]:checked")).map(
      (item) => item.dataset.prescriptionPainType
    );
    updatePrescriptionResult();
    updatePrescriptionStepAccess();
  });
});

document.querySelectorAll("[data-prescription-cough-type]").forEach((checkbox) => {
  checkbox.addEventListener("change", () => {
    prescriptionState.coughTypes = Array.from(document.querySelectorAll("[data-prescription-cough-type]:checked")).map(
      (item) => item.dataset.prescriptionCoughType
    );
    updatePrescriptionResult();
    updatePrescriptionStepAccess();
  });
});

document.querySelector("#copyPrescription")?.addEventListener("click", async (event) => {
  const text = buildPrescriptionSummaryText();
  try {
    await navigator.clipboard.writeText(text);
    event.currentTarget.textContent = "Resumo copiado";
    window.setTimeout(() => {
      event.currentTarget.textContent = "Copiar resumo";
    }, 1800);
  } catch {
    event.currentTarget.textContent = "Copie manualmente";
  }
});

function getDirectiveField(field) {
  return document.querySelector(`[data-directive-field="${field}"]`)?.value.trim() || "";
}

function buildDirectiveText() {
  const fields = {
    nome: getDirectiveField("nome") || "[nome completo]",
    nascimento: getDirectiveField("nascimento") || "[data de nascimento]",
    documento: getDirectiveField("documento") || "[documento]",
    dataLocal: getDirectiveField("dataLocal") || "[local e data]",
    representante: getDirectiveField("representante") || "[representante indicado]",
    representanteSubstituto: getDirectiveField("representanteSubstituto") || "[representante substituto, se houver]",
    valores: getDirectiveField("valores") || "[valores, objetivos de cuidado e limites considerados importantes]",
    tratamentosDesejados:
      getDirectiveField("tratamentosDesejados") ||
      "[tratamentos desejados quando houver benefício proporcional e coerência com os objetivos de cuidado]",
    tratamentosRecusados:
      getDirectiveField("tratamentosRecusados") ||
      "[tratamentos recusados em cenário irreversível ou sem benefício proporcional]",
    conforto: getDirectiveField("conforto") || "[prioridades de conforto, local de cuidado e despedidas]",
    observacoes: getDirectiveField("observacoes") || "[observações sobre capacidade decisória, participantes e plano de revisão]",
  };

  return [
    "DIRETIVAS ANTECIPADAS DE VONTADE",
    "",
    `Eu, ${fields.nome}, nascido(a) em ${fields.nascimento}, documento ${fields.documento}, declaro, por meio destas Diretivas Antecipadas de Vontade, minhas preferências de cuidado para situações futuras em que eu não consiga expressar minha vontade de forma livre e autônoma. Registro que estas escolhas devem orientar a equipe assistencial, minha família e meu representante, sempre de acordo com a avaliação clínica, a proporcionalidade terapêutica e as normas éticas vigentes.`,
    "",
    `Para mim, qualidade de vida, dignidade e cuidado adequado significam: ${fields.valores}. Desejo que essas informações sejam consideradas na definição de objetivos de cuidado, especialmente em situações de doença avançada, irreversível, terminalidade, processo ativo de morte ou perda de capacidade decisória.`,
    "",
    `Indico como representante para apoiar decisões futuras ${fields.representante}. Caso essa pessoa não esteja disponível ou não possa exercer essa função, indico como representante substituto ${fields.representanteSubstituto}. Desejo que meu representante dialogue com a equipe de saúde, considere meus valores e ajude a defender as preferências aqui registradas.`,
    "",
    `Se houver benefício proporcional e coerência com meus objetivos de cuidado, desejo receber os seguintes tratamentos e cuidados: ${fields.tratamentosDesejados}. Essas preferências devem ser interpretadas considerando meu estado clínico, possibilidade real de benefício, carga de sofrimento e riscos envolvidos.`,
    "",
    `Em cenário irreversível, terminal, de sofrimento desproporcional ou quando não houver benefício clínico esperado, não desejo receber os seguintes tratamentos ou intervenções: ${fields.tratamentosRecusados}. Essa recusa deve ser compreendida como preferência por cuidado proporcional, conforto e alívio de sofrimento, e não como recusa de cuidado.`,
    "",
    `Minhas prioridades de conforto, local de cuidado, presença de pessoas significativas, espiritualidade, privacidade, despedidas e outras preferências são: ${fields.conforto}. Peço que, sempre que possível, essas preferências sejam respeitadas e revisadas com meu representante e com a equipe.`,
    "",
    `Para registro em prontuário e continuidade do cuidado, observo ainda: ${fields.observacoes}. Recomendo que este documento seja revisto quando houver mudança relevante de diagnóstico, prognóstico, valores pessoais, capacidade decisória ou contexto familiar.`,
    "",
    "Declaro que minhas escolhas devem ser consideradas pela equipe assistencial e por meu representante, priorizando conforto, dignidade, alívio de sofrimento e respeito aos meus valores, desde que não contrariem o Código de Ética Médica.",
    "",
    fields.dataLocal,
    "",
    "Assinatura da pessoa: _______________________________________________",
    "Assinatura do representante, se houver: ______________________________",
    "Profissional/equipe que registrou a conversa: _________________________",
    "",
    "Texto normativo integral pertinente - Resolução CFM nº 1.995/2012:",
    "",
    "RESOLUÇÃO CFM nº 1.995/2012",
    "",
    "Dispõe sobre as diretivas antecipadas de vontade dos pacientes.",
    "",
    "Art. 1º Definir diretivas antecipadas de vontade como o conjunto de desejos, prévia e expressamente manifestados pelo paciente, sobre cuidados e tratamentos que quer, ou não, receber no momento em que estiver incapacitado de expressar, livre e autonomamente, sua vontade.",
    "",
    "Art. 2º Nas decisões sobre cuidados e tratamentos de pacientes que se encontram incapazes de comunicar-se, ou de expressar de maneira livre e independente suas vontades, o médico levará em consideração suas diretivas antecipadas de vontade.",
    "",
    "§ 1º Caso o paciente tenha designado um representante para tal fim, suas informações serão levadas em consideração pelo médico.",
    "",
    "§ 2º O médico deixará de levar em consideração as diretivas antecipadas de vontade do paciente ou representante que, em sua análise, estiverem em desacordo com os preceitos ditados pelo Código de Ética Médica.",
    "",
    "§ 3º As diretivas antecipadas do paciente prevalecerão sobre qualquer outro parecer não médico, inclusive sobre os desejos dos familiares.",
    "",
    "§ 4º O médico registrará, no prontuário, as diretivas antecipadas de vontade que lhes foram diretamente comunicadas pelo paciente.",
    "",
    "§ 5º Não sendo conhecidas as diretivas antecipadas de vontade do paciente, nem havendo representante designado, familiares disponíveis ou falta de consenso entre estes, o médico recorrerá ao Comitê de Bioética da instituição, caso exista, ou, na falta deste, à Comissão de Ética Médica do hospital ou ao Conselho Regional e Federal de Medicina para fundamentar sua decisão sobre conflitos éticos, quando entender esta medida necessária e conveniente.",
    "",
    "Art. 3º Esta resolução entra em vigor na data de sua publicação.",
  ].join("\n");
}

function renderDirectiveText() {
  const output = document.querySelector("#directiveOutput");
  if (output) {
    output.value = buildDirectiveText();
  }
}

document.querySelector("#generateDirective")?.addEventListener("click", renderDirectiveText);

document.querySelector("#copyDirective")?.addEventListener("click", async (event) => {
  const output = document.querySelector("#directiveOutput");
  const text = output?.value.trim() || buildDirectiveText();
  if (output && !output.value.trim()) {
    output.value = text;
  }

  try {
    await navigator.clipboard.writeText(text);
    event.currentTarget.textContent = "Texto copiado";
    window.setTimeout(() => {
      event.currentTarget.textContent = "Copiar texto";
    }, 1800);
  } catch {
    event.currentTarget.textContent = "Copie manualmente";
  }
});

document.querySelector("#clearDirective")?.addEventListener("click", () => {
  document.querySelectorAll("[data-directive-field]").forEach((field) => {
    field.value = "";
  });
  const output = document.querySelector("#directiveOutput");
  if (output) {
    output.value = "";
  }
});

function getCompleteRecordValue(name) {
  return document.querySelector(`.complete-record-form [name="${name}"]`)?.value.trim() || "";
}

function getCompleteRecordRadioValue(name) {
  const checked = document.querySelector(`.complete-record-form [name="${name}"]:checked`);
  if (!checked) return "";
  return checked.closest("label")?.textContent.trim() || checked.value;
}

function getCompleteRecordCheckboxValues(name) {
  return Array.from(document.querySelectorAll(`.complete-record-form [name="${name}"]:checked`))
    .map((item) => item.closest("label")?.textContent.trim() || item.value)
    .join(", ");
}

function getCoelhoSavassiScore() {
  const sentinels = Array.from(document.querySelectorAll("[data-coelho-savassi-score]:checked")).reduce(
    (total, item) => total + Number(item.dataset.coelhoSavassiScore || 0),
    0
  );
  const density = Number(document.querySelector("[data-coelho-savassi-density]:checked")?.dataset.coelhoSavassiDensity || 0);
  return sentinels + density;
}

function classifyCoelhoSavassi(score) {
  if (score >= 9) return "R3 - risco máximo";
  if (score >= 7) return "R2 - risco médio";
  if (score >= 5) return "R1 - risco menor";
  return "R0 - risco habitual";
}

function getCoelhoSavassiSelectedItems() {
  const sentinels = Array.from(document.querySelectorAll("[data-coelho-savassi-score]:checked")).map(
    (item) => item.closest("label")?.textContent.trim() || ""
  );
  const density = document.querySelector("[data-coelho-savassi-density]:checked")?.closest("label")?.textContent.trim();
  return [...sentinels, density].filter(Boolean).join(", ");
}

function updateCoelhoSavassiResult() {
  const score = getCoelhoSavassiScore();
  const classification = classifyCoelhoSavassi(score);
  const scoreOutput = document.querySelector("#coelhoSavassiScore");
  const classOutput = document.querySelector("#coelhoSavassiClass");
  if (scoreOutput) scoreOutput.textContent = `Escore: ${score}`;
  if (classOutput) classOutput.textContent = classification;
}

function getCompleteSpictSelectedItems() {
  return Array.from(document.querySelectorAll("[data-complete-spict-item]:checked")).map(
    (item) => item.closest("label")?.textContent.trim() || ""
  );
}

function getCompleteSpictResult() {
  const selectedItems = getCompleteSpictSelectedItems();
  const hasNoPositive = Boolean(document.querySelector("[data-complete-spict-none]")?.checked);
  const hasDoubt = Boolean(document.querySelector("[data-complete-spict-doubt]")?.checked);

  if (selectedItems.length > 0) {
    return {
      status: "SPICT-BR positivo",
      detail: `${selectedItems.length} indicador(es) positivo(s) selecionado(s).`,
      summary: `SPICT-BR positivo, com ${selectedItems.length} indicador(es) selecionado(s): ${selectedItems.join("; ")}.`,
    };
  }

  if (hasDoubt) {
    return {
      status: "SPICT-BR inconclusivo",
      detail: "Permanece dúvida após aplicação; discutir em equipe e reavaliar.",
      summary: "SPICT-BR inconclusivo: permanece dúvida após aplicação, com necessidade de discussão em equipe e reavaliação.",
    };
  }

  if (hasNoPositive) {
    return {
      status: "SPICT-BR sem indicadores positivos",
      detail: "Não há indicador positivo selecionado neste momento.",
      summary: "SPICT-BR sem indicadores positivos selecionados neste momento.",
    };
  }

  return {
    status: "SPICT-BR: aguardando seleção",
    detail: "Nenhum item positivo selecionado.",
    summary: "[resultado do SPICT-BR]",
  };
}

function updateCompleteSpictResult() {
  const result = getCompleteSpictResult();
  const statusOutput = document.querySelector("#completeSpictStatus");
  const countOutput = document.querySelector("#completeSpictCount");
  if (statusOutput) statusOutput.textContent = result.status;
  if (countOutput) countOutput.textContent = result.detail;
}

function getCompletePpsCalculation() {
  const selects = Array.from(document.querySelectorAll("[data-complete-pps-factor]"));
  if (!selects.length) {
    return {
      complete: false,
      score: null,
      text: "[PPS atual]",
      summary: "[PPS atual]",
    };
  }

  const selected = selects.filter((select) => select.value);
  if (selected.length < selects.length) {
    return {
      complete: false,
      score: null,
      text: "Selecione os cinco parâmetros para gerar o resultado automaticamente.",
      summary: "[PPS atual]",
    };
  }

  const values = selects.reduce((acc, select) => {
    acc[select.dataset.completePpsFactor] = select.value;
    return acc;
  }, {});
  const calculation = calculatePpsScoreFromTable(values);
  const interpretation = getPpsInterpretation(calculation.score);
  return {
    complete: true,
    score: calculation.score,
    text: interpretation.summary,
    summary: `${calculation.score}% - ${interpretation.summary}`,
  };
}

function updateCompletePpsResult() {
  const result = getCompletePpsCalculation();
  const scoreOutput = document.querySelector("#completePpsScore");
  const textOutput = document.querySelector("#completePpsText");
  if (scoreOutput) {
    scoreOutput.textContent = result.complete ? `PPS atual: ${result.score}%` : "PPS atual: aguardando seleção";
  }
  if (textOutput) textOutput.textContent = result.text;
  syncPpsProgressionFields();
}

function syncLinkedField(selector, value) {
  const field = document.querySelector(selector);
  if (!field || field.dataset.userEdited === "true") return;
  field.value = value;
}

function syncPpsProgressionFields() {
  const dateValue = getCompleteRecordValue("data-pps-atual");
  const ppsResult = getCompletePpsCalculation();
  syncLinkedField("[data-linked-pps-date]", dateValue);
  syncLinkedField("[data-linked-pps-score]", ppsResult.complete ? `${ppsResult.score}%` : "");
}

function getCompleteRecordText(name, fallback) {
  return getCompleteRecordValue(name) || fallback;
}

function buildCompleteRecordSummary() {
  const nome = getCompleteRecordText("nome", "[nome]");
  const idade = getCompleteRecordText("idade", "[idade]");
  const genero = getCompleteRecordText("genero", "[gênero]");
  const cns = getCompleteRecordText("cns", "[Cartão Nacional do SUS]");
  const cid = getCompleteRecordText("cid", "[CID]");
  const municipio = getCompleteRecordText("municipio", "[município]");
  const endereco = getCompleteRecordText("endereco", "[endereço]");
  const localCuidado = getCompleteRecordText("local-cuidado", "[local de cuidado]");
  const acs = getCompleteRecordText("acs", "[Agente Comunitário de Saúde]");
  const data = getCompleteRecordText("data-abordagem", "[data da abordagem]");
  const profissional = getCompleteRecordText("profissional-responsavel", "[profissional responsável]");
  const trajetoria = getCompleteRecordCheckboxValues("trajetoria") || "[trajetória da doença]";
  const perguntaSurpresa = getCompleteRecordRadioValue("pergunta-surpresa") || "[resposta à pergunta-surpresa]";
  const coelhoSavassiScore = getCoelhoSavassiScore();
  const coelhoSavassiClass = classifyCoelhoSavassi(coelhoSavassiScore);
  const coelhoSavassiItems = getCoelhoSavassiSelectedItems() || "[sentinelas de risco familiar selecionadas]";
  const spictResult = getCompleteSpictResult();
  const ppsResult = getCompletePpsCalculation();
  const biografia = getCompleteRecordText("biografia", "[síntese biográfica, valores, vínculos e aspectos relevantes da história de vida]");
  const historiaAdoecimento = getCompleteRecordText("historia-adoecimento", "[diagnóstico principal, diagnósticos secundários, trajetória clínica, tratamentos prévios e em curso, internações e complicações relevantes]");
  const familiaRede = getCompleteRecordText("familia-rede", "[composição familiar, cuidador principal, rede de apoio e aspectos familiares relevantes]");
  const aspectosSocioeconomicos = getCompleteRecordText("aspectos-socioeconomicos", "[condições de moradia, ocupação, renda, benefícios e necessidades sociais]");
  const dimensaoPsicologica = getCompleteRecordText("dimensao-psicologica", "[fontes de sofrimento psicológico e ações propostas]");
  const dimensaoEspiritual = getCompleteRecordText("dimensao-espiritual", "[fontes de sofrimento espiritual, FICA e ações propostas]");
  const dimensaoFamiliarSocial = getCompleteRecordText("dimensao-familiar-social", "[fontes de sofrimento familiar/social e ações propostas]");
  const dimensaoFisica = getCompleteRecordText("dimensao-fisica", "[sintomas, limitações, riscos e ações propostas]");
  const pacDav = getCompleteRecordText("pac-dav", "[preferências, valores, limites terapêuticos, representante e orientações registradas]");
  const reflexoesEquipe = getCompleteRecordText("reflexoes-equipe", "[reflexões da equipe, dificuldades, aprendizados, necessidade de matriciamento e plano de acompanhamento]");

  return [
    `A abordagem paliativa completa foi realizada em ${data}, por ${profissional}. A pessoa avaliada é ${nome}, ${idade}, ${genero}, Cartão Nacional do SUS ${cns}, CID ${cid}, residente em ${municipio}, no endereço ${endereco}. O local de cuidado registrado foi ${localCuidado}, com acompanhamento territorial pelo Agente Comunitário de Saúde ${acs}. Pela Escala de Coelho-Savassi, a família foi classificada como ${coelhoSavassiClass}, com escore ${coelhoSavassiScore}; os itens selecionados foram: ${coelhoSavassiItems}.`,
    `Do ponto de vista biográfico, registrou-se: ${biografia}. A história de adoecimento inclui: ${historiaAdoecimento}. Na avaliação de elegibilidade, ${spictResult.summary} A trajetória predominante selecionada foi ${trajetoria}. O PPS atual foi ${ppsResult.summary}, avaliado em ${getCompleteRecordText("data-pps-atual", "[data da avaliação do PPS]")}. À pergunta-surpresa, a resposta registrada foi: ${perguntaSurpresa}.`,
    `A rede familiar e social foi descrita da seguinte forma: ${familiaRede}. Os aspectos socioeconômicos relevantes foram: ${aspectosSocioeconomicos}. Na avaliação multidimensional, foram registrados sofrimento psicológico e ações propostas como ${dimensaoPsicologica}; aspectos espirituais como ${dimensaoEspiritual}; aspectos familiares e sociais como ${dimensaoFamiliarSocial}; e dimensão física como ${dimensaoFisica}.`,
    `O planejamento antecipado de cuidados e as Diretivas Antecipadas de Vontade foram registrados como: ${pacDav}. As reflexões da equipe e os próximos passos foram: ${reflexoesEquipe}.`,
  ].join("\n\n");
}

function renderCompleteRecordSummary() {
  const output = document.querySelector("#completeRecordSummary");
  if (output) {
    output.value = buildCompleteRecordSummary();
  }
}

document.querySelector("#generateCompleteRecordSummary")?.addEventListener("click", renderCompleteRecordSummary);

document.querySelector("#copyCompleteRecordSummary")?.addEventListener("click", async (event) => {
  const output = document.querySelector("#completeRecordSummary");
  const text = output?.value.trim() || buildCompleteRecordSummary();
  if (output && !output.value.trim()) {
    output.value = text;
  }

  try {
    await navigator.clipboard.writeText(text);
    event.currentTarget.textContent = "Resumo copiado";
    window.setTimeout(() => {
      event.currentTarget.textContent = "Copiar resumo";
    }, 1800);
  } catch {
    event.currentTarget.textContent = "Copie manualmente";
  }
});

document.querySelectorAll("[data-coelho-savassi-score], [data-coelho-savassi-density]").forEach((input) => {
  input.addEventListener("change", updateCoelhoSavassiResult);
});

document.querySelectorAll("[data-complete-spict-item]").forEach((checkbox) => {
  checkbox.addEventListener("change", () => {
    if (checkbox.checked) {
      document.querySelector("[data-complete-spict-none]")?.removeAttribute("checked");
      document.querySelector("[data-complete-spict-doubt]")?.removeAttribute("checked");
      const none = document.querySelector("[data-complete-spict-none]");
      const doubt = document.querySelector("[data-complete-spict-doubt]");
      if (none) none.checked = false;
      if (doubt) doubt.checked = false;
    }
    updateCompleteSpictResult();
  });
});

document.querySelector("[data-complete-spict-none]")?.addEventListener("change", (event) => {
  if (event.target.checked) {
    document.querySelectorAll("[data-complete-spict-item]").forEach((checkbox) => {
      checkbox.checked = false;
    });
    const doubt = document.querySelector("[data-complete-spict-doubt]");
    if (doubt) doubt.checked = false;
  }
  updateCompleteSpictResult();
});

document.querySelector("[data-complete-spict-doubt]")?.addEventListener("change", (event) => {
  if (event.target.checked) {
    document.querySelectorAll("[data-complete-spict-item]").forEach((checkbox) => {
      checkbox.checked = false;
    });
    const none = document.querySelector("[data-complete-spict-none]");
    if (none) none.checked = false;
  }
  updateCompleteSpictResult();
});

document.querySelectorAll("[data-complete-pps-factor]").forEach((select) => {
  select.addEventListener("change", updateCompletePpsResult);
});

document.querySelector('[name="data-pps-atual"]')?.addEventListener("input", syncPpsProgressionFields);

document.querySelectorAll("[data-linked-pps-date], [data-linked-pps-score]").forEach((field) => {
  field.addEventListener("input", () => {
    field.dataset.userEdited = "true";
  });
});

function getSymptomScoreLabel(score) {
  if (score === 0) return "0 - ausente";
  if (score <= 3) return `${score} - leve`;
  if (score <= 6) return `${score} - moderado`;
  return `${score} - forte`;
}

function populateSymptomScoreSelects() {
  const options = [
    '<option value="">Selecionar</option>',
    ...Array.from({ length: 11 }, (_, score) => `<option value="${score}">${getSymptomScoreLabel(score)}</option>`),
  ].join("");

  document.querySelectorAll("[data-symptom-score]").forEach((select) => {
    if (!select.children.length) {
      select.innerHTML = options;
    }
  });
}

populateSymptomScoreSelects();
updateCoelhoSavassiResult();
updateCompleteSpictResult();
updateCompletePpsResult();
updatePainResult();
updateStepAccess();
updateCoughResult();
updateCoughStepAccess();
updateDyspneaResult();
updateDyspneaStepAccess();
updateFatigueResult();
updateFatigueStepAccess();
updateAnorexiaResult();
updateAnorexiaStepAccess();
renderCapacityResult();
updatePpsResult();
renderPediatricSymptomFlows();
setupPediatricSymptomFlowSubtabs();
updatePrescriptionStepAccess();
updatePrescriptionResult();

function parseScore(scoreText) {
  return scoreText.split(",").reduce((scores, chunk) => {
    const [key, value] = chunk.split(":");
    scores[key] = Number(value);
    return scores;
  }, {});
}

function makeListItem(text) {
  const item = document.createElement("li");
  item.textContent = text;
  return item;
}

function getPediatricSymptomFlowState(flowId) {
  const config = pediatricSymptomFlowConfigs[flowId];
  if (!pediatricSymptomFlowState[flowId]) {
    pediatricSymptomFlowState[flowId] = {
      noAlert: false,
      alerts: [],
      context: config?.defaultContext || "",
      intensity: "moderate",
    };
  }
  return pediatricSymptomFlowState[flowId];
}

function getPediatricSymptomFlowResult(config, state) {
  if (!state.noAlert && !state.alerts.length) {
    return {
      title: "Selecione sinais de alerta",
      items: [
        "Marque Sem sinais de alerta ou selecione qualquer sinal presente para orientar o próximo passo.",
      ],
    };
  }

  if (state.alerts.length) {
    return {
      title: "Próximo passo sugerido: interromper fluxo",
      items: [
        "Priorizar avaliação presencial imediata, segurança clínica e definição de causa potencialmente reversível.",
        `Sinais selecionados: ${state.alerts.join("; ")}.`,
        "Manter conforto, posicionamento, presença familiar e plano de urgência enquanto a equipe é acionada.",
      ],
    };
  }

  const recommendation = config.recommendations[state.context] || config.recommendations[config.defaultContext];
  const intensityText = prescriptionLabels.intensity[state.intensity] || "não definida";
  const escalation =
    state.intensity === "crisis"
      ? "Como foi marcada crise/fim de vida, reavaliar em minutos, confirmar objetivos de cuidado e acionar suporte se não houver plano de crise."
      : state.intensity === "severe"
      ? "Como a intensidade é intensa, definir reavaliação breve, dose de resgate quando indicada e critérios claros para contato com a equipe."
      : "Reavaliar resposta, tolerabilidade e conforto no intervalo pactuado com família e equipe.";

  return {
    title: "Próximo passo sugerido",
    items: [
      `Intensidade selecionada: ${intensityText}.`,
      `Condutas não farmacológicas: ${recommendation.nonpharm}`,
      `Condutas farmacológicas: ${recommendation.meds}`,
      escalation,
      "Antes de prescrever: confirmar peso atual, idade, alergias, função renal/hepática, formulação disponível e protocolo pediátrico local.",
    ],
  };
}

function renderPediatricSymptomFlow(container) {
  const flowId = container.dataset.pediatricFlow;
  const config = pediatricSymptomFlowConfigs[flowId];
  if (!config) return;

  const state = getPediatricSymptomFlowState(flowId);
  const result = getPediatricSymptomFlowResult(config, state);

  container.innerHTML = `
    <div class="pediatric-flow-header">
      <h3>${config.title}</h3>
      <p>Selecione sinais de alerta, padrão predominante e intensidade para gerar o próximo passo sugerido.</p>
    </div>
    <div class="pediatric-flow-steps">
      <section class="pediatric-flow-step">
        <h4>1. Pesquisar sinais de alerta</h4>
        <label class="pediatric-flow-option pediatric-flow-option-none">
          <input type="checkbox" data-ped-flow-no-alert ${state.noAlert ? "checked" : ""} />
          <span>Sem sinais de alerta</span>
        </label>
        <div class="pediatric-flow-options">
          ${config.alerts
            .map(
              (alert) => `
                <label class="pediatric-flow-option">
                  <input type="checkbox" data-ped-flow-alert="${alert}" ${state.alerts.includes(alert) ? "checked" : ""} />
                  <span>${alert}</span>
                </label>
              `
            )
            .join("")}
        </div>
      </section>
      <section class="pediatric-flow-step">
        <h4>2. ${config.stepLabel}</h4>
        <div class="segmented-control multi pediatric-flow-segments">
          ${config.contexts
            .map(
              (context) => `
                <button class="segment ${state.context === context.value ? "active" : ""}" type="button" data-ped-flow-context="${context.value}">
                  ${context.label}
                </button>
              `
            )
            .join("")}
        </div>
      </section>
      <section class="pediatric-flow-step">
        <h4>3. Intensidade</h4>
        <div class="segmented-control multi pediatric-flow-segments">
          ${Object.entries(prescriptionLabels.intensity)
            .map(
              ([value, label]) => `
                <button class="segment ${state.intensity === value ? "active" : ""}" type="button" data-ped-flow-intensity="${value}">
                  ${label}
                </button>
              `
            )
            .join("")}
        </div>
      </section>
    </div>
    <section class="pediatric-flow-result">
      <span class="result-kicker">${result.title}</span>
      <ul>${result.items.map((item) => `<li>${item}</li>`).join("")}</ul>
    </section>
  `;

  container.querySelector("[data-ped-flow-no-alert]")?.addEventListener("change", (event) => {
    state.noAlert = event.target.checked;
    if (state.noAlert) {
      state.alerts = [];
    }
    renderPediatricSymptomFlow(container);
  });

  container.querySelectorAll("[data-ped-flow-alert]").forEach((input) => {
    input.addEventListener("change", () => {
      state.alerts = Array.from(container.querySelectorAll("[data-ped-flow-alert]:checked")).map(
        (item) => item.dataset.pedFlowAlert
      );
      if (state.alerts.length) {
        state.noAlert = false;
      }
      renderPediatricSymptomFlow(container);
    });
  });

  container.querySelectorAll("[data-ped-flow-context]").forEach((button) => {
    button.addEventListener("click", () => {
      state.context = button.dataset.pedFlowContext;
      renderPediatricSymptomFlow(container);
    });
  });

  container.querySelectorAll("[data-ped-flow-intensity]").forEach((button) => {
    button.addEventListener("click", () => {
      state.intensity = button.dataset.pedFlowIntensity;
      renderPediatricSymptomFlow(container);
    });
  });
}

function renderPediatricSymptomFlows() {
  document.querySelectorAll("[data-pediatric-flow]").forEach((container) => {
    renderPediatricSymptomFlow(container);
  });
}

function setupPediatricSymptomFlowSubtabs() {
  document.querySelectorAll(".pediatric-symptom-subpanel").forEach((panel) => {
    const flowCard = Array.from(panel.children).find((child) => child.matches?.("[data-pediatric-flow]"));
    if (!flowCard || panel.querySelector(":scope > .pediatric-inner-subtabs")) return;

    const controls = document.createElement("div");
    controls.className = "subtabs pediatric-inner-subtabs";
    controls.setAttribute("aria-label", "Subabas do sintoma pediátrico");

    const overviewButton = document.createElement("button");
    overviewButton.className = "subtab-trigger active";
    overviewButton.type = "button";
    overviewButton.textContent = "Visão geral";

    const flowButton = document.createElement("button");
    flowButton.className = "subtab-trigger";
    flowButton.type = "button";
    flowButton.textContent = "Fluxo decisório";

    const overviewPanel = document.createElement("div");
    overviewPanel.className = "pediatric-inner-panel active";
    overviewPanel.tabIndex = 0;

    const flowPanel = document.createElement("div");
    flowPanel.className = "pediatric-inner-panel";
    flowPanel.tabIndex = 0;

    Array.from(panel.childNodes).forEach((node) => {
      if (node === flowCard) {
        flowPanel.append(node);
      } else {
        overviewPanel.append(node);
      }
    });

    controls.append(overviewButton, flowButton);
    panel.append(controls, overviewPanel, flowPanel);

    const openInnerPanel = (target) => {
      const showFlow = target === "flow";
      overviewButton.classList.toggle("active", !showFlow);
      flowButton.classList.toggle("active", showFlow);
      overviewPanel.classList.toggle("active", !showFlow);
      flowPanel.classList.toggle("active", showFlow);
      const activePanel = showFlow ? flowPanel : overviewPanel;
      activePanel.scrollIntoView({ behavior: "smooth", block: "start" });
      activePanel.focus({ preventScroll: true });
    };

    overviewButton.addEventListener("click", () => openInnerPanel("overview"));
    flowButton.addEventListener("click", () => openInnerPanel("flow"));
  });
}

function hasPrescriptionSubtypeMatch(selectedTypes, optionTypes) {
  return !selectedTypes.length || !optionTypes || optionTypes.some((type) => selectedTypes.includes(type));
}

function isPrescriptionOptionForSelectedPopulation(option) {
  const selectedPopulation = prescriptionState.population || "adult";
  const optionPopulations = option.populations || ["adult"];
  return optionPopulations.includes(selectedPopulation);
}

function getPrescriptionOptions() {
  const selected = new Map();
  prescriptionState.symptoms.forEach((symptom) => {
    const intensity = prescriptionState.symptomIntensities[symptom];
    (prescriptionMedicationOptions[symptom] || []).forEach((option) => {
      if (!isPrescriptionOptionForSelectedPopulation(option)) return;
      if (!option.routes.includes(prescriptionState.route)) return;
      if (option.intensities && !option.intensities.includes(intensity)) return;
      if (symptom === "pain" && !hasPrescriptionSubtypeMatch(prescriptionState.painTypes, option.painTypes)) return;
      if (symptom === "cough" && !hasPrescriptionSubtypeMatch(prescriptionState.coughTypes, option.coughTypes)) return;
      selected.set(option.id, option);
    });
  });
  return Array.from(selected.values());
}

function getPrescriptionPhytotherapyOptions() {
  const selected = new Map();
  prescriptionState.symptoms.forEach((symptom) => {
    const intensity = prescriptionState.symptomIntensities[symptom];
    (prescriptionPhytotherapyOptions[symptom] || []).forEach((option) => {
      if (!isPrescriptionOptionForSelectedPopulation(option)) return;
      if (!option.routes.includes(prescriptionState.route)) return;
      if (option.intensities && !option.intensities.includes(intensity)) return;
      if (symptom === "pain" && !hasPrescriptionSubtypeMatch(prescriptionState.painTypes, option.painTypes)) return;
      if (symptom === "cough" && !hasPrescriptionSubtypeMatch(prescriptionState.coughTypes, option.coughTypes)) return;
      selected.set(option.id, option);
    });
  });
  return Array.from(selected.values());
}

function getPrescriptionMedicationDetail(option) {
  return prescriptionRouteMedicationDetails[option.id]?.[prescriptionState.route] || option.detail;
}

function formatPrescriptionMedicationOption(option) {
  return `${option.label}: ${getPrescriptionMedicationDetail(option)}`;
}

function cleanupPrescriptionSymptomData() {
  Object.keys(prescriptionState.symptomIntensities).forEach((symptom) => {
    if (!prescriptionState.symptoms.includes(symptom)) {
      delete prescriptionState.symptomIntensities[symptom];
    }
  });

  const painTypes = document.querySelector("#prescriptionPainTypes");
  if (painTypes) {
    painTypes.hidden = !prescriptionState.symptoms.includes("pain");
  }
  const coughTypes = document.querySelector("#prescriptionCoughTypes");
  if (coughTypes) {
    coughTypes.hidden = !prescriptionState.symptoms.includes("cough");
  }

  if (!prescriptionState.symptoms.includes("pain")) {
    prescriptionState.painTypes = [];
    document.querySelectorAll("[data-prescription-pain-type]").forEach((item) => {
      item.checked = false;
    });
  }
  if (!prescriptionState.symptoms.includes("cough")) {
    prescriptionState.coughTypes = [];
    document.querySelectorAll("[data-prescription-cough-type]").forEach((item) => {
      item.checked = false;
    });
  }

  prescriptionState.phytotherapy = prescriptionState.phytotherapy.filter((id) =>
    getPrescriptionPhytotherapyOptions().some((option) => option.id === id)
  );
}

function renderPrescriptionSelectedSymptoms() {
  const container = document.querySelector("#prescriptionSelectedSymptoms");
  const select = document.querySelector("#prescriptionSymptomSelect");
  if (!container) return;

  if (select) {
    Array.from(select.options).forEach((option) => {
      option.disabled = prescriptionState.symptoms.includes(option.value);
    });
    const nextAvailable = Array.from(select.options).find((option) => !option.disabled);
    if (nextAvailable && select.options[select.selectedIndex]?.disabled) {
      select.value = nextAvailable.value;
    }
  }

  if (!prescriptionState.symptoms.length) {
    container.innerHTML = '<p class="empty-state">Nenhum sintoma selecionado.</p>';
    return;
  }

  container.replaceChildren(
    ...prescriptionState.symptoms.map((symptom) => {
      const chip = document.createElement("span");
      chip.className = "selected-symptom-chip";
      chip.textContent = prescriptionLabels.symptoms[symptom];

      const remove = document.createElement("button");
      remove.type = "button";
      remove.setAttribute("aria-label", `Remover ${prescriptionLabels.symptoms[symptom]}`);
      remove.textContent = "x";
      remove.addEventListener("click", () => {
        prescriptionState.symptoms = prescriptionState.symptoms.filter((item) => item !== symptom);
        updatePrescriptionAfterSymptomChange();
      });

      chip.append(remove);
      return chip;
    })
  );
}

function updatePrescriptionAfterSymptomChange() {
  cleanupPrescriptionSymptomData();
  renderPrescriptionSelectedSymptoms();
  updatePrescriptionStepAccess();
  updatePrescriptionResult();
}

function hasAllPrescriptionIntensities() {
  return (
    prescriptionState.symptoms.length > 0 &&
    prescriptionState.symptoms.every((symptom) => Boolean(prescriptionState.symptomIntensities[symptom]))
  );
}

function isPrescriptionStepUnlocked(step) {
  const hasSymptoms = prescriptionState.symptoms.length > 0;
  const hasIntensities = hasAllPrescriptionIntensities();
  const hasNonpharm = prescriptionState.nonpharm.length > 0;
  const hasMedications = prescriptionState.medications.length > 0;

  if (step === "population") return true;
  if (step === "route") return Boolean(prescriptionState.population);
  if (step === "symptoms") return Boolean(prescriptionState.population) && prescriptionState.routeAnswered;
  if (step === "intensity") return Boolean(prescriptionState.population) && prescriptionState.routeAnswered && hasSymptoms;
  if (step === "nonpharm") return Boolean(prescriptionState.population) && prescriptionState.routeAnswered && hasSymptoms && hasIntensities;
  if (step === "medications") return Boolean(prescriptionState.population) && prescriptionState.routeAnswered && hasSymptoms && hasIntensities && hasNonpharm;
  if (step === "phytotherapy") {
    return Boolean(prescriptionState.population) && prescriptionState.routeAnswered && hasSymptoms && hasIntensities && hasNonpharm && hasMedications;
  }
  if (step === "summary") {
    return Boolean(prescriptionState.population) && prescriptionState.routeAnswered && hasSymptoms && hasIntensities && hasNonpharm && hasMedications;
  }
  return false;
}

function updatePrescriptionStepAccess() {
  document.querySelectorAll("[data-prescription-step]").forEach((step) => {
    const unlocked = isPrescriptionStepUnlocked(step.dataset.prescriptionStep);
    step.classList.toggle("locked-step", !unlocked);
    step.setAttribute("aria-disabled", String(!unlocked));
  });
}

function renderPrescriptionIntensityControls() {
  const container = document.querySelector("#prescriptionIntensityList");
  if (!container) return;

  if (!prescriptionState.symptoms.length) {
    container.innerHTML = '<p class="empty-state">Selecione sintomas para definir a intensidade de cada um.</p>';
    return;
  }

  container.replaceChildren(
    ...prescriptionState.symptoms.map((symptom) => {
      const item = document.createElement("div");
      item.className = "prescription-intensity-item";

      const title = document.createElement("strong");
      title.textContent = prescriptionLabels.symptoms[symptom];
      item.append(title);

      const control = document.createElement("div");
      control.className = "segmented-control multi";
      Object.entries(prescriptionLabels.intensity).forEach(([value, label]) => {
        const button = document.createElement("button");
        button.className = "segment";
        button.type = "button";
        button.dataset.prescriptionSymptomIntensity = symptom;
        button.dataset.value = value;
        button.textContent = label;
        button.classList.toggle("active", prescriptionState.symptomIntensities[symptom] === value);
        button.addEventListener("click", () => {
          prescriptionState.symptomIntensities[symptom] = value;
          renderPrescriptionIntensityControls();
          updatePrescriptionStepAccess();
          updatePrescriptionResult();
        });
        control.append(button);
      });

      item.append(control);
      return item;
    })
  );
}

function getPrescriptionNonpharmOptions() {
  const selected = new Map();
  prescriptionState.symptoms.forEach((symptom) => {
    const intensity = prescriptionState.symptomIntensities[symptom];
    const options = prescriptionNonpharmOptions[symptom];
    if (!options || !intensity) return;

    [...(options.base || []), ...(options[intensity] || [])].forEach((option) => {
      selected.set(option.id, option);
    });
  });
  return Array.from(selected.values());
}

function renderPrescriptionNonpharmOptions() {
  const container = document.querySelector("#prescriptionNonpharmOptions");
  if (!container) return;

  const options = getPrescriptionNonpharmOptions();
  prescriptionState.nonpharm = prescriptionState.nonpharm.filter((id) =>
    options.some((option) => option.id === id)
  );

  if (!options.length) {
    container.innerHTML = '<p class="empty-state">Defina a intensidade de cada sintoma para gerar sugestões não farmacológicas.</p>';
    return;
  }

  container.replaceChildren(
    ...options.map((option) => {
      const label = document.createElement("label");
      const input = document.createElement("input");
      input.type = "checkbox";
      input.dataset.prescriptionNonpharm = option.id;
      input.checked = prescriptionState.nonpharm.includes(option.id);
      input.addEventListener("change", () => {
        prescriptionState.nonpharm = Array.from(
          document.querySelectorAll("[data-prescription-nonpharm]:checked")
        ).map((item) => item.dataset.prescriptionNonpharm);
        updatePrescriptionStepAccess();
        updatePrescriptionResult();
      });
      label.append(input, document.createTextNode(` ${option.text}`));
      return label;
    })
  );
}

function renderPrescriptionMedicationOptions() {
  const container = document.querySelector("#prescriptionMedOptions");
  if (!container) return;

  const options = getPrescriptionOptions();
  prescriptionState.medications = prescriptionState.medications.filter((id) =>
    options.some((option) => option.id === id)
  );

  if (!options.length) {
    const emptyText = hasAllPrescriptionIntensities()
      ? prescriptionState.population === "pediatric"
        ? "Não há opção pediátrica compatível com a via selecionada, sintomas e intensidade definidos. Reavalie a via, confira peso/idade e considere equipe especializada."
        : "Não há opção farmacológica compatível com a via selecionada, sintomas e intensidade definidos. Reavalie a via ou considere avaliação especializada."
      : "Selecione sintomas e intensidade para listar opções farmacológicas compatíveis com a via escolhida.";
    container.innerHTML = `<p class="empty-state">${emptyText}</p>`;
    return;
  }

  container.replaceChildren(
    ...options.map((option) => {
      const label = document.createElement("label");
      const input = document.createElement("input");
      input.type = "checkbox";
      input.dataset.prescriptionMedication = option.id;
      input.checked = prescriptionState.medications.includes(option.id);
      input.addEventListener("change", () => {
        prescriptionState.medications = Array.from(
          document.querySelectorAll("[data-prescription-medication]:checked")
        ).map((item) => item.dataset.prescriptionMedication);
        updatePrescriptionStepAccess();
        updatePrescriptionResult();
      });
      label.append(input, document.createTextNode(` ${formatPrescriptionMedicationOption(option)}`));
      return label;
    })
  );
}

function renderPrescriptionPhytotherapyOptions() {
  const container = document.querySelector("#prescriptionPhytotherapyOptions");
  if (!container) return;

  const options = getPrescriptionPhytotherapyOptions();
  prescriptionState.phytotherapy = prescriptionState.phytotherapy.filter((id) =>
    options.some((option) => option.id === id)
  );

  if (!options.length) {
    const emptyText =
      prescriptionState.population === "pediatric"
        ? "Não há opção fitoterápica pediátrica sugerida nesta ferramenta. Confirmar protocolos locais antes de considerar fitoterapia."
        : "Não há opção fitoterápica compatível com os sintomas, intensidade, tipo e via selecionados.";
    container.innerHTML = `<p class="empty-state">${emptyText}</p>`;
    return;
  }

  container.replaceChildren(
    ...options.map((option) => {
      const label = document.createElement("label");
      const input = document.createElement("input");
      input.type = "checkbox";
      input.dataset.prescriptionPhytotherapy = option.id;
      input.checked = prescriptionState.phytotherapy.includes(option.id);
      input.addEventListener("change", () => {
        prescriptionState.phytotherapy = Array.from(
          document.querySelectorAll("[data-prescription-phytotherapy]:checked")
        ).map((item) => item.dataset.prescriptionPhytotherapy);
        updatePrescriptionResult();
      });
      label.append(input, document.createTextNode(` ${option.label}: ${option.detail}`));
      return label;
    })
  );
}

function renderPrescriptionSection(title, items) {
  if (!items.length) return "";
  return `<section><h4>${title}</h4><ul>${items.map((item) => `<li>${item}</li>`).join("")}</ul></section>`;
}

function getSelectedPrescriptionMedications() {
  const options = getPrescriptionOptions();
  return prescriptionState.medications
    .map((id) => options.find((option) => option.id === id))
    .filter(Boolean)
    .map((option) => formatPrescriptionMedicationOption(option));
}

function getSelectedPrescriptionPhytotherapy() {
  const options = getPrescriptionPhytotherapyOptions();
  return prescriptionState.phytotherapy
    .map((id) => options.find((option) => option.id === id))
    .filter(Boolean)
    .map((option) => `${option.label}: ${option.detail}`);
}

function buildPrescriptionSummaryText() {
  const symptoms = prescriptionState.symptoms.map((id) => prescriptionLabels.symptoms[id]);
  const painTypes = prescriptionState.painTypes.map((id) => prescriptionLabels.painTypes[id]);
  const coughTypes = prescriptionState.coughTypes.map((id) => prescriptionLabels.coughTypes[id]);
  const intensities = prescriptionState.symptoms.map(
    (id) => `${prescriptionLabels.symptoms[id]}: ${prescriptionLabels.intensity[prescriptionState.symptomIntensities[id]] || "não definida"}`
  );
  const nonpharmOptions = getPrescriptionNonpharmOptions();
  const nonpharm = prescriptionState.nonpharm
    .map((id) => nonpharmOptions.find((option) => option.id === id))
    .filter(Boolean)
    .map((option) => option.text);
  const medications = getSelectedPrescriptionMedications();
  const phytotherapy = getSelectedPrescriptionPhytotherapy();
  return [
    `Público: ${prescriptionLabels.population[prescriptionState.population] || "não selecionado"}`,
    `Via: ${prescriptionLabels.routes[prescriptionState.route] || "não selecionada"}`,
    `Sintomas: ${symptoms.length ? symptoms.join(", ") : "não selecionado"}`,
    `Tipo de dor: ${painTypes.length ? painTypes.join(", ") : prescriptionState.symptoms.includes("pain") ? "não selecionado" : "não se aplica"}`,
    `Tipo de tosse: ${coughTypes.length ? coughTypes.join(", ") : prescriptionState.symptoms.includes("cough") ? "não selecionado" : "não se aplica"}`,
    `Intensidade por sintoma: ${intensities.length ? intensities.join("; ") : "não definida"}`,
    `Condutas não farmacológicas: ${nonpharm.length ? nonpharm.join(" ") : "não selecionadas"}`,
    `Condutas farmacológicas: ${medications.length ? medications.join(" ") : "não selecionadas"}`,
    `Fitoterapia, quando indicada: ${phytotherapy.length ? phytotherapy.join(" ") : "não selecionada ou não indicada para a seleção atual"}`,
    prescriptionState.population === "pediatric"
      ? "Checar peso atual, idade, alergias, função renal/hepática, interações, contraindicações, formulação disponível, dose máxima diária e protocolos pediátricos locais antes de prescrever."
      : "Checar alergias, função renal/hepática, interações, contraindicações, via disponível e protocolos locais antes de prescrever.",
  ].join("\n");
}

function updatePrescriptionResult() {
  cleanupPrescriptionSymptomData();
  renderPrescriptionSelectedSymptoms();
  renderPrescriptionIntensityControls();
  renderPrescriptionNonpharmOptions();
  renderPrescriptionMedicationOptions();
  renderPrescriptionPhytotherapyOptions();

  const title = document.querySelector("#prescriptionResultTitle");
  const summary = document.querySelector("#prescriptionSummary");
  if (!title || !summary) return;

  const symptoms = prescriptionState.symptoms.map((id) => prescriptionLabels.symptoms[id]);
  const painTypes = prescriptionState.painTypes.map((id) => prescriptionLabels.painTypes[id]);
  const coughTypes = prescriptionState.coughTypes.map((id) => prescriptionLabels.coughTypes[id]);
  const intensities = prescriptionState.symptoms.map(
    (id) => `${prescriptionLabels.symptoms[id]}: ${prescriptionLabels.intensity[prescriptionState.symptomIntensities[id]] || "não definida"}`
  );
  const nonpharmOptions = getPrescriptionNonpharmOptions();
  const nonpharm = prescriptionState.nonpharm
    .map((id) => nonpharmOptions.find((option) => option.id === id))
    .filter(Boolean)
    .map((option) => option.text);
  const medications = getSelectedPrescriptionMedications();
  const phytotherapy = getSelectedPrescriptionPhytotherapy();

  title.textContent = !prescriptionState.population
    ? "Selecione adulto ou pediátrico"
    : symptoms.length
    ? `Prescrição para ${symptoms.join(", ")}`
    : "Selecione sintomas para gerar a prescrição";

  summary.innerHTML =
    renderPrescriptionSection("Público", [
      `Público: ${prescriptionLabels.population[prescriptionState.population] || "não selecionado"}`,
    ]) +
    renderPrescriptionSection("Via", [
      `Via: ${prescriptionLabels.routes[prescriptionState.route] || "não selecionada"}`,
    ]) +
    renderPrescriptionSection("Sintomas selecionados", symptoms) +
    renderPrescriptionSection("Tipo de dor", prescriptionState.symptoms.includes("pain") ? painTypes : []) +
    renderPrescriptionSection("Tipo de tosse", prescriptionState.symptoms.includes("cough") ? coughTypes : []) +
    renderPrescriptionSection("Intensidade por sintoma", intensities) +
    renderPrescriptionSection("Condutas não farmacológicas", nonpharm) +
    renderPrescriptionSection("Condutas farmacológicas", medications) +
    renderPrescriptionSection("Fitoterapia, quando indicada", phytotherapy) +
    renderPrescriptionSection(
      "Segurança",
      prescriptionState.population === "pediatric"
        ? [
            "Confirmar peso atual, idade, alergias, função renal/hepática, dose máxima diária, apresentação disponível e protocolo pediátrico local.",
            "Definir meta de alívio, intervalo de reavaliação, sinais de toxicidade e quando acionar equipe especializada.",
          ]
        : [
            "Checar alergias, função renal/hepática, interações, contraindicações, via disponível e protocolos locais.",
            "Definir dose de resgate, critérios de reavaliação e sinais para acionar equipe.",
          ]
    );
  updatePrescriptionStepAccess();
}

function getCleanLabelText(input) {
  const label = input.parentElement.cloneNode(true);
  label.querySelectorAll("sup").forEach((sup) => sup.remove());
  return label.textContent.trim();
}

function polarPoint(center, radius, angleDegrees) {
  const angle = (angleDegrees * Math.PI) / 180;
  return {
    x: center + Math.cos(angle) * radius,
    y: center + Math.sin(angle) * radius,
  };
}

function makeSvgElement(tag, attributes = {}) {
  const element = document.createElementNS("http://www.w3.org/2000/svg", tag);
  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
  return element;
}

function getPhenotypeMaxScores() {
  const maxScores = {
    somatic: 0,
    visceral: 0,
    neuropathic: 0,
    nociplastic: 0,
  };

  document.querySelectorAll(".phenotype-tool input[data-score]").forEach((item) => {
    const itemScores = parseScore(item.dataset.score);
    Object.entries(itemScores).forEach(([key, value]) => {
      if (key in maxScores) {
        maxScores[key] += value;
      }
    });
  });

  return maxScores;
}

function getPhenotypePercentages(scores, maxScores) {
  return Object.fromEntries(
    Object.entries(scores).map(([key, value]) => [key, Math.round((value / Math.max(1, maxScores[key])) * 100)])
  );
}

function renderPhenotypeRadar(scores, maxScores) {
  const svg = document.querySelector("#phenotypeRadar");
  if (!svg) return;

  const center = 160;
  const middleY = 150;
  const radius = 82;
  const levels = [0.25, 0.5, 0.75, 1];
  const percentages = getPhenotypePercentages(scores, maxScores);

  svg.replaceChildren();

  levels.forEach((level) => {
    const points = radarAxes
      .map((axis) => {
        const point = polarPoint(0, radius * level, axis.angle);
        return { x: center + point.x, y: middleY + point.y };
      })
      .map((point) => `${point.x},${point.y}`)
      .join(" ");
    svg.append(makeSvgElement("polygon", { class: "radar-grid", points }));
  });

  radarAxes.forEach((axis) => {
    const end = polarPoint(0, radius, axis.angle);
    svg.append(makeSvgElement("line", { class: "radar-axis", x1: center, y1: middleY, x2: center + end.x, y2: middleY + end.y }));
  });

  const areaPoints = radarAxes
    .map((axis) => {
      const point = polarPoint(0, (percentages[axis.key] / 100) * radius, axis.angle);
      return { x: center + point.x, y: middleY + point.y };
    })
    .map((point) => `${point.x},${point.y}`)
    .join(" ");
  svg.append(makeSvgElement("polygon", { class: "radar-area", points: areaPoints }));

  radarAxes.forEach((axis) => {
    const rawPoint = polarPoint(0, (percentages[axis.key] / 100) * radius, axis.angle);
    const point = { x: center + rawPoint.x, y: middleY + rawPoint.y };

    svg.append(makeSvgElement("circle", { class: "radar-point", cx: point.x, cy: point.y, r: 4 }));

    const labelText = makeSvgElement("text", {
      class: "radar-label",
      x: axis.labelX,
      y: axis.labelY,
      "text-anchor": axis.anchor,
    });
    labelText.textContent = axis.label;
    svg.append(labelText);

    const valueText = makeSvgElement("text", {
      class: "radar-value",
      x: axis.valueX,
      y: axis.valueY,
      "text-anchor": axis.anchor,
    });
    valueText.textContent = `${percentages[axis.key]}%`;
    svg.append(valueText);
  });
}

function updatePhenotypeResult() {
  const checkedItems = Array.from(document.querySelectorAll(".phenotype-tool input[type='checkbox']:checked"));
  const title = document.querySelector("#phenotypeTitle");
  const text = document.querySelector("#phenotypeText");
  const scoreBox = document.querySelector("#phenotypeScores");
  const evidence = document.querySelector("#phenotypeEvidence");

  if (!title || !text || !scoreBox || !evidence) return;

  const scores = {
    somatic: 0,
    visceral: 0,
    neuropathic: 0,
    nociplastic: 0,
  };

  const evidenceByType = {
    somatic: [],
    visceral: [],
    neuropathic: [],
    nociplastic: [],
  };
  const mixedEvidence = [];

  checkedItems.forEach((item) => {
    const labelText = getCleanLabelText(item);

    if (item.dataset.mixed === "true") {
      mixedEvidence.push(labelText);
    }

    const itemScores = parseScore(item.dataset.score);
    Object.entries(itemScores).forEach(([key, value]) => {
      scores[key] += value;
      evidenceByType[key].push(labelText);
    });
  });

  const sortedScores = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const maxScore = Math.max(1, sortedScores[0][1]);
  const strongPhenotypes = sortedScores.filter(([, value]) => value >= 3 && maxScore - value <= 2);
  const explicitMixed = mixedEvidence.length > 0;
  const maxScores = getPhenotypeMaxScores();
  const percentages = getPhenotypePercentages(scores, maxScores);

  renderPhenotypeRadar(scores, maxScores);

  scoreBox.replaceChildren(
    ...sortedScores.map(([key, value]) => {
      const row = document.createElement("div");
      row.className = "score-row";

      const label = document.createElement("span");
      label.textContent = phenotypeLabels[key];

      const track = document.createElement("div");
      track.className = "score-track";
      const bar = document.createElement("div");
      bar.className = "score-bar";
      bar.style.width = `${percentages[key]}%`;
      track.append(bar);

      const number = document.createElement("span");
      number.textContent = `${percentages[key]}%`;

      row.append(label, track, number);
      return row;
    })
  );

  if (checkedItems.length === 0) {
    painState.mechanism = null;
    painState.phenotype = null;
    title.textContent = "Selecione os achados para classificar a dor";
    text.textContent = "O resultado aparecerá aqui com a hipótese predominante e os fenótipos concorrentes.";
    evidence.replaceChildren(makeListItem("Nenhum achado selecionado ainda."));
    updatePainResult();
    return;
  }

  if (explicitMixed || strongPhenotypes.length >= 2) {
    const names = strongPhenotypes.map(([key]) => phenotypeLabels[key].toLowerCase()).join(" + ");
    const patternText = names || "mais de um padrão fenotípico";
    painState.mechanism = "mixed";
    painState.phenotype = null;
    title.textContent = phenotypeLabels.mixed;
    text.textContent = `Há critérios relevantes para ${patternText}. Reavaliar história, exame físico e contexto clínico para definir prioridades de manejo.`;
  } else {
    const [winner] = sortedScores[0];
    painState.mechanism = winner === "neuropathic" || winner === "nociplastic" ? winner : "nociceptive";
    painState.phenotype = winner;
    title.textContent = phenotypeLabels[winner];
    text.textContent = phenotypeDescriptions[winner];
  }

  const leadingTypes = explicitMixed || strongPhenotypes.length >= 2 ? strongPhenotypes.map(([key]) => key) : [sortedScores[0][0]];
  const leadingEvidence = [
    ...mixedEvidence.slice(0, 2).map((line) => `${phenotypeLabels.mixed}: ${line}`),
    ...leadingTypes.flatMap((key) => evidenceByType[key].slice(0, 2).map((line) => `${phenotypeLabels[key]}: ${line}`)),
  ]
    .slice(0, 5);

  evidence.replaceChildren(
    ...[
      ...leadingEvidence,
      "Use o resultado como triagem fenotípica; ele não substitui exame físico, avaliação etiológica nem instrumentos formais completos.",
    ].map(makeListItem)
  );
  updatePainResult();
}

document.querySelectorAll(".phenotype-tool input[type='checkbox']").forEach((checkbox) => {
  checkbox.addEventListener("change", updatePhenotypeResult);
});

document.querySelector("#resetPhenotype")?.addEventListener("click", () => {
  document.querySelectorAll(".phenotype-tool input[type='checkbox']").forEach((checkbox) => {
    checkbox.checked = false;
  });
  updatePhenotypeResult();
});

updatePhenotypeResult();

calculateOpioidConversionButton?.addEventListener("click", calculateOpioidConversion);

opioidSourceDose?.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    calculateOpioidConversion();
  }
});

document.querySelectorAll(".references-toggle").forEach((button) => {
  const target = document.getElementById(button.getAttribute("aria-controls"));
  button.setAttribute("aria-expanded", "false");
  if (target) {
    target.hidden = true;
  }

  button.addEventListener("click", () => {
    const expanded = button.getAttribute("aria-expanded") === "true";
    button.setAttribute("aria-expanded", String(!expanded));
    if (target) {
      target.hidden = expanded;
    }
  });
});

const initialHash = window.location.hash.replace("#", "");
const legacyHashMap = {
  "indicacao-avaliacao": "indicacao",
  "tratamento-medicamentoso": "tratamento-medicamentoso-dor",
  "tosse-dispneia": "tosse",
  "alteracoes-orais": "cuidados-boca",
  "visao-geral-identificacao": "identificacao-quem-onde",
  "visao-geral-avaliacao": "avaliacao-anamnese-sintomas",
  "avaliacao-primeira-consulta": "avaliacao-anamnese-sintomas",
  "profissionais-nucleo": "profissional-medico",
  "profissionais-reabilitacao": "profissional-nutricao",
  "profissionais-enfermagem": "profissional-tecnico-enfermagem",
  "profissionais-territorio-suporte": "profissional-agente-comunitario-saude",
  "profissionais-normas-conselhos": "profissional-medico",
  "pics-exemplos": "pics-praticas-sus",
  "visao-geral-dispneia": "tipos-dispneia",
  "sintomas-gastrointestinais": "nauseas",
  "deteccao-fadiga": "deteccao-anorexia",
  "causas-reversiveis-fadiga": "causas-reversiveis-anorexia",
  "condutas-nutricionais-fadiga": "condutas-nutricionais-anorexia",
  "tratamento-medicamentoso-fadiga": "tratamento-medicamentoso-anorexia",
  "comunicacao-familia-fadiga": "comunicacao-familia-anorexia",
  "visao-geral-tomada": "capacidade-decisao-substituta",
  "visao-geral-aspectos": "proporcionalidade-aspectos",
};
const initialTab = legacyHashMap[initialHash] || initialHash;

if (initialTab && panels.some((panel) => panel.id === initialTab)) {
  openTab(initialTab, false);
} else if (initialTab && document.getElementById(initialTab)?.classList.contains("concept-subpanel")) {
  openTab("conceitos", false);
  openConceptSubtab(initialTab, false);
} else if (initialTab && document.getElementById(initialTab)?.classList.contains("professionals-subpanel")) {
  openTab("papel-profissionais", false);
  openProfessionalsSubtab(initialTab, false);
} else if (initialTab && document.getElementById(initialTab)?.classList.contains("pain-subpanel")) {
  openTab("manejo-dor", false);
  openPainSubtab(initialTab, false);
} else if (initialTab && document.getElementById(initialTab)?.classList.contains("opioid-subpanel")) {
  openTab("uso-opioides", false);
  openOpioidSubtab(initialTab, false);
} else if (initialTab && document.getElementById(initialTab)?.classList.contains("public-ceaf-subpanel")) {
  openTab("medicamentos-componente-especializado", false, "public");
  openPublicCeafSubtab(initialTab, false);
} else if (initialTab && document.getElementById(initialTab)?.classList.contains("pncp-subpanel")) {
  openTab("politica-nacional-cuidados-paliativos", false);
  openPncpSubtab(initialTab, false);
} else if (initialTab && document.getElementById(initialTab)?.classList.contains("identification-subpanel")) {
  openTab("identificacao-ras", false);
  openIdentificationSubtab(initialTab, false);
} else if (initialTab && document.getElementById(initialTab)?.classList.contains("assessment-subpanel")) {
  openTab("avaliacao", false);
  openAssessmentSubtab(initialTab, false);
} else if (initialTab && document.getElementById(initialTab)?.classList.contains("complete-elements-subpanel")) {
  openTab("avaliacao", false);
  openAssessmentSubtab("elementos-abordagem-paliativa-completa", false);
  openCompleteElementsSubtab(initialTab, false);
} else if (initialTab && document.getElementById(initialTab)?.classList.contains("phases-subpanel")) {
  openTab("fases-adoecimento", false);
  openPhasesSubtab(initialTab, false);
} else if (initialTab && document.getElementById(initialTab)?.classList.contains("bioethics-subpanel")) {
  openTab("bioetica", false);
  openBioethicsSubtab(initialTab, false);
} else if (initialTab && document.getElementById(initialTab)?.classList.contains("communication-subpanel")) {
  openTab("comunicacao", false);
  openCommunicationSubtab(initialTab, false);
} else if (initialTab && document.getElementById(initialTab)?.classList.contains("phytotherapy-subpanel")) {
  openTab("fitoterapia", false);
  openPhytotherapySubtab(initialTab, false);
} else if (initialTab && document.getElementById(initialTab)?.classList.contains("pics-subpanel")) {
  openTab("praticas-integrativas", false);
  openPicsSubtab(initialTab, false);
} else if (initialTab && document.getElementById(initialTab)?.classList.contains("skin-subpanel")) {
  openTab("cuidados-pele", false);
  openSkinSubtab(initialTab, false);
} else if (initialTab && document.getElementById(initialTab)?.classList.contains("endoflife-subpanel")) {
  openTab("fim-de-vida", false);
  openEndOfLifeSubtab(initialTab, false);
} else if (initialTab && document.getElementById(initialTab)?.classList.contains("compassion-subpanel")) {
  openTab("comunidades-compassivas", false);
  openCompassionSubtab(initialTab, false);
} else if (initialTab && document.getElementById(initialTab)?.classList.contains("homedeath-subpanel")) {
  openTab("obito-domicilio", false);
  openHomeDeathSubtab(initialTab, false);
} else if (initialTab && document.getElementById(initialTab)?.classList.contains("selfcare-subpanel")) {
  openTab("autocuidado", false);
  openSelfCareSubtab(initialTab, false);
} else if (initialTab && document.getElementById(initialTab)?.classList.contains("caregiver-subpanel")) {
  openTab("cuidador", false);
  openCaregiverSubtab(initialTab, false);
} else if (initialTab && document.getElementById(initialTab)?.classList.contains("legal-subpanel")) {
  openTab("aspectos-normativos", false);
  openLegalSubtab(initialTab, false);
} else if (initialTab && document.getElementById(initialTab)?.classList.contains("planning-subpanel")) {
  openTab("planejamento-antecipado", false);
  openPlanningSubtab(initialTab, false);
} else if (initialTab && document.getElementById(initialTab)?.classList.contains("decision-subpanel")) {
  openTab("tomada-decisao", false);
  openDecisionSubtab(initialTab, false);
} else if (initialTab && document.getElementById(initialTab)?.classList.contains("cough-subpanel")) {
  openTab("tosse", false);
  openCoughSubtab(initialTab, false);
} else if (initialTab && document.getElementById(initialTab)?.classList.contains("dyspnea-subpanel")) {
  openTab("dispneia", false);
  openDyspneaSubtab(initialTab, false);
} else if (initialTab && document.getElementById(initialTab)?.classList.contains("nausea-subpanel")) {
  openTab("nauseas", false);
  openNauseaSubtab(initialTab, false);
} else if (initialTab && document.getElementById(initialTab)?.classList.contains("fatigue-subpanel")) {
  openTab("fadiga", false);
  openFatigueSubtab(initialTab, false);
} else if (initialTab && document.getElementById(initialTab)?.classList.contains("anorexia-subpanel")) {
  openTab("anorexia-caquexia", false);
  openAnorexiaSubtab(initialTab, false);
} else if (initialTab && document.getElementById(initialTab)?.classList.contains("grief-subpanel")) {
  openTab("luto", false);
  openGriefSubtab(initialTab, false);
} else if (initialTab && document.getElementById(initialTab)?.classList.contains("hypodermo-subpanel")) {
  openTab("hipodermoclise", false);
  openHypodermoSubtab(initialTab, false);
} else if (initialTab && document.getElementById(initialTab)?.classList.contains("oral-subpanel")) {
  openTab("via-oral", false);
  openOralSubtab(initialTab, false);
} else if (initialTab && document.getElementById(initialTab)?.classList.contains("iv-subpanel")) {
  openTab("via-endovenosa", false);
  openIvSubtab(initialTab, false);
} else if (initialTab && document.getElementById(initialTab)?.classList.contains("sublingual-subpanel")) {
  openTab("via-sublingual-bucal", false);
  openSublingualSubtab(initialTab, false);
} else if (initialTab && document.getElementById(initialTab)?.classList.contains("rectal-subpanel")) {
  openTab("via-retal", false);
  openRectalSubtab(initialTab, false);
} else if (initialTab && document.getElementById(initialTab)?.classList.contains("tube-subpanel")) {
  openTab("sonda-gastrostomia", false);
  openTubeSubtab(initialTab, false);
} else if (initialTab && document.getElementById(initialTab)?.classList.contains("insomnia-subpanel")) {
  openTab("insonia", false);
  openInsomniaSubtab(initialTab, false);
} else if (initialTab && document.getElementById(initialTab)?.classList.contains("pediatric-subpanel")) {
  openTab("pediatria", false);
  openPediatricSubtab(initialTab, false);
} else if (initialTab && document.getElementById(initialTab)?.classList.contains("pediatric-symptom-subpanel")) {
  openTab("pediatria", false);
  openPediatricSubtab("controle-sintomas-pediatria", false);
  openPediatricSymptomSubtab(initialTab, false);
}

scrollActiveControlsIntoView();
