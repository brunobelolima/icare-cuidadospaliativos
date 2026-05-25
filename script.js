const dialog = document.querySelector("#professionalDialog");
const acceptButton = document.querySelector("#acceptProfessional");
const declineButton = document.querySelector("#declineProfessional");
const tabs = Array.from(document.querySelectorAll(".tab-trigger"));
const panels = Array.from(document.querySelectorAll(".content-panel"));
const painState = {
  stepOneAnswered: false,
  redFlags: [],
  mechanism: null,
  intensity: "mild",
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
    "Ácido acetilsalicílico: 500 mg, 1 a 2 comprimidos; repetir a cada 4 a 8 h se necessário.",
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
    "Duloxetina: 30 mg/dia.",
    "Venlafaxina: 37,5 mg/dia.",
    "Gabapentina: 300 mg à noite ou 300 mg 3 vezes/dia, conforme tolerabilidade e função renal.",
    "Pregabalina: 25 a 75 mg à noite, conforme tolerabilidade e função renal.",
    "Carbamazepina: 200 a 400 mg/dia; em idosos, 100 mg 2 vezes/dia.",
    "Fenitoína: 100 mg, 3 vezes/dia.",
    "Ácido valproico/valproato de sódio: 250 mg/dia.",
    "Lidocaína tópica: considerar em dor neuropática periférica localizada.",
    "Capsaicina tópica: considerar em dor neuropática periférica localizada.",
  ],
  nociplasticAdjuvants: [
    "Amitriptilina: 25 mg/dia; em idosos, 10 mg/dia.",
    "Nortriptilina: 25 mg/dia; em idosos, 10 a 25 mg/dia.",
    "Clomipramina: 10 mg/dia.",
    "Duloxetina: 30 mg/dia.",
    "Venlafaxina: 37,5 mg/dia.",
    "Gabapentina: 300 mg à noite ou 300 mg 3 vezes/dia, conforme tolerabilidade e função renal.",
    "Pregabalina: 25 a 75 mg à noite, conforme tolerabilidade e função renal.",
  ],
  opioids: [
    "Codeína: 30 mg, 3 a 4 vezes/dia; em idosos, 15 mg a cada 4 h.",
    "Morfina oral de ação curta: 5 mg a cada 4 h.",
    "Metadona: 2,5 mg a cada 8 a 12 h.",
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

function getMedicationPlan(mechanism, intensity) {
  const groupKeys = medicationPlanMap[mechanism]?.[intensity] || [];

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
    "Opções como garra-do-diabo, salgueiro ou unha-de-gato exigem individualização, revisão de contraindicações e risco de interação.",
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

function getPhytotherapyActions(mechanism, intensity) {
  const extra =
    intensity === "severe"
      ? "Se a dor for forte, fitoterapia não deve atrasar reavaliação clínica, analgesia proporcional ou encaminhamento quando necessário."
      : "Definir prazo de teste, benefício esperado e critérios de suspensão.";

  return [
    "Fitoterapia, quando apropriada:",
    ...(phytotherapyPlanMap[mechanism] || []),
    "Antes de usar: perguntar sobre chás, garrafadas, pomadas, cápsulas, tinturas e produtos comprados sem prescrição.",
    extra,
  ];
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

function createMedicationSection(plan) {
  const section = document.createElement("li");
  section.className = "result-section result-section--medication";

  const heading = document.createElement("h4");
  heading.textContent = "Tratamento medicamentoso";

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
  dialog.classList.add("hidden");
  document.body.classList.remove("dialog-open");
}

function openTab(tabId, focusPanel = true) {
  const targetPanel = document.getElementById(tabId);

  tabs.forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.tab === tabId);
  });

  panels.forEach((panel) => {
    panel.classList.toggle("active", panel.id === tabId);
  });

  history.replaceState(null, "", `#${tabId}`);

  if (focusPanel) {
    targetPanel?.scrollIntoView({ behavior: "smooth", block: "start" });
    targetPanel?.focus({ preventScroll: true });
  }
}

document.body.classList.add("dialog-open");

acceptButton.addEventListener("click", closeDialog);
declineButton.addEventListener("click", closeDialog);

tabs.forEach((tab) => {
  tab.addEventListener("click", () => openTab(tab.dataset.tab));
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
  const medicationPlan = getMedicationPlan(painState.mechanism, painState.intensity);
  const nonMedicationActions = getNonMedicationActions(painState.mechanism, painState.intensity);
  const phytotherapyActions = getPhytotherapyActions(painState.mechanism, painState.intensity);
  title.textContent = `Plano multimodal para dor crônica ${recommendation.label} ${intensityLabels[painState.intensity]}`;
  text.textContent = recommendation.text;

  const intensityAction =
    painState.intensity === "severe"
      ? "Se dor forte, revisar rapidamente analgesia, resgate, sofrimento associado e necessidade de avaliação presencial."
      : painState.intensity === "moderate"
        ? "Se dor moderada, ajustar plano com meta funcional explícita e reavaliar resposta em intervalo curto."
        : "Se dor leve, priorizar função, autocuidado e menor carga medicamentosa eficaz.";

  actions.replaceChildren(
    ...recommendation.actions.map(createResultItem),
    createMedicationSection(medicationPlan),
    createResultSection("Tratamento não medicamentoso", nonMedicationActions, "nonmedication"),
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

updatePainResult();
updateStepAccess();

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
    title.textContent = phenotypeLabels.mixed;
    text.textContent = `Há critérios relevantes para ${patternText}. Reavaliar história, exame físico e contexto clínico para definir prioridades de manejo.`;
  } else {
    const [winner] = sortedScores[0];
    painState.mechanism = winner === "neuropathic" || winner === "nociplastic" ? winner : "nociceptive";
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
  "tratamento-medicamentoso": "tratamento-medicamentoso-dor",
};
const initialTab = legacyHashMap[initialHash] || initialHash;

if (initialTab && panels.some((panel) => panel.id === initialTab)) {
  openTab(initialTab, false);
} else if (initialTab && document.getElementById(initialTab)?.classList.contains("pain-subpanel")) {
  openTab("manejo-dor", false);
  openPainSubtab(initialTab, false);
}
