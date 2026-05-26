const dialog = document.querySelector("#professionalDialog");
const acceptButton = document.querySelector("#acceptProfessional");
const declineButton = document.querySelector("#declineProfessional");
const tabs = Array.from(document.querySelectorAll(".tab-trigger"));
const panels = Array.from(document.querySelectorAll(".content-panel"));
const symptomTabs = [
  { id: "manejo-dor", label: "Dor" },
  { id: "tosse", label: "Tosse" },
  { id: "dispneia", label: "Dispneia" },
  { id: "nauseas", label: "Náuseas" },
  { id: "vomitos", label: "Vômitos" },
  { id: "constipacao", label: "Constipação" },
  { id: "diarreia", label: "Diarreia" },
  { id: "ansiedade", label: "Ansiedade" },
  { id: "delirium", label: "Delirium" },
  { id: "fadiga", label: "Fadiga" },
  { id: "anorexia-caquexia", label: "Anorexia-caquexia" },
];
const symptomTabIds = new Set(symptomTabs.map((tab) => tab.id));
const painState = {
  stepOneAnswered: false,
  redFlags: [],
  mechanism: null,
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
  stage: "reversible",
  factors: [],
};

const prescriptionState = {
  route: "oral",
  routeAnswered: false,
  symptomIntensities: {},
  symptoms: [],
  painTypes: [],
  coughTypes: [],
  nonpharm: [],
  medications: [],
};

const prescriptionLabels = {
  routes: {
    oral: "Oral",
    subcutaneous: "Subcutânea",
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
    anorexiaCachexia: "Anorexia-caquexia",
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
    { id: "pain-dipyrone", label: "Dipirona", detail: "Dor leve/moderada: 500 mg a 1 g VO/SC/EV a cada 6 h, conforme via disponível e protocolo local.", routes: ["oral", "subcutaneous", "tube"], intensities: ["mild", "moderate"] },
    { id: "pain-paracetamol", label: "Paracetamol", detail: "Dor leve: 500 mg a 750 mg VO/retal ou por sonda a cada 6 h.", routes: ["oral", "rectal", "tube"], intensities: ["mild"], painTypes: ["somatic", "visceral"] },
    { id: "pain-ibuprofen", label: "Ibuprofeno", detail: "Dor nociceptiva com componente inflamatório: 200 mg a 400 mg VO/retal a cada 6 a 8 h se seguro.", routes: ["oral", "rectal"], intensities: ["mild", "moderate"], painTypes: ["somatic"] },
    { id: "pain-codeine", label: "Codeína", detail: "Dor moderada: 15 mg a 30 mg VO/retal a cada 4 a 6 h, se apropriado.", routes: ["oral", "rectal", "tube"], intensities: ["moderate"], painTypes: ["somatic", "visceral"] },
    { id: "pain-morphine", label: "Morfina", detail: "Dor moderada/intensa: considerar 2,5 mg a 5 mg VO/retal ou 1 mg a 2 mg SC, titulando resposta e segurança.", routes: ["oral", "subcutaneous", "rectal", "tube"], intensities: ["moderate", "severe", "crisis"] },
    { id: "pain-amitriptyline", label: "Amitriptilina", detail: "Dor neuropática/nociplástica: 10 mg VO à noite como dose inicial em pessoa frágil ou idosa.", routes: ["oral", "tube"], intensities: ["mild", "moderate", "severe"], painTypes: ["neuropathic", "nociplastic"] },
    { id: "pain-duloxetine", label: "Duloxetina", detail: "Dor neuropática/nociplástica: 30 mg VO pela manhã como dose inicial quando perfil clínico permitir.", routes: ["oral"], intensities: ["mild", "moderate", "severe"], painTypes: ["neuropathic", "nociplastic"] },
    { id: "pain-gabapentin", label: "Gabapentina", detail: "Dor neuropática/nociplástica: 100 mg a 300 mg VO à noite como dose inicial, ajustando por idade e função renal.", routes: ["oral", "tube"], intensities: ["mild", "moderate", "severe"], painTypes: ["neuropathic", "nociplastic"] },
  ],
  dyspnea: [
    { id: "dyspnea-morphine", label: "Opioide para dispneia", detail: "Dispneia moderada/intensa: morfina 2,5 mg a 5 mg VO ou 1 mg a 2 mg SC como dose inicial, com reavaliação.", routes: ["oral", "subcutaneous", "tube"], intensities: ["moderate", "severe", "crisis"] },
    { id: "dyspnea-bronchodilator", label: "Broncodilatador se broncoespasmo", detail: "Considerar salbutamol ou ipratrópio inalatório/nebulização se sibilância ou DPOC/asma.", routes: ["oral", "tube"], intensities: ["mild", "moderate", "severe", "crisis"] },
    { id: "dyspnea-benzodiazepine", label: "Ansiolítico se pânico associado", detail: "Dispneia intensa/crise com ansiedade: considerar benzodiazepínico em baixa dose, com monitorização de sedação.", routes: ["oral", "subcutaneous", "tube"], intensities: ["severe", "crisis"] },
  ],
  cough: [
    { id: "cough-codeine", label: "Antitussivo opioide", detail: "Tosse moderada/intensa, seca ou refratária: considerar codeína 10 mg a 20 mg VO a cada 4 a 6 h se apropriado.", routes: ["oral", "rectal", "tube"], intensities: ["moderate", "severe", "crisis"], coughTypes: ["dry", "refractory"] },
    { id: "cough-ipratropium", label: "Ipratrópio se secreção/broncoespasmo", detail: "Tosse com secreção/broncorreia ou broncoespasmo: considerar brometo de ipratrópio inalatório/nebulização.", routes: ["oral", "tube"], intensities: ["mild", "moderate", "severe", "crisis"], coughTypes: ["productive"] },
    { id: "cough-acetylcysteine", label: "N-acetilcisteína se secreção espessa", detail: "Se secreção espessa e objetivo for fluidificar: considerar N-acetilcisteína conforme apresentação disponível e tolerância.", routes: ["oral", "tube"], intensities: ["moderate", "severe"], coughTypes: ["productive"] },
  ],
  nauseaVomiting: [
    { id: "nausea-metoclopramide", label: "Metoclopramida", detail: "Náuseas/vômitos leves/moderados: 10 mg VO/SC/retal a cada 8 h, evitando se obstrução completa ou sintomas extrapiramidais.", routes: ["oral", "subcutaneous", "rectal", "tube"], intensities: ["mild", "moderate"] },
    { id: "nausea-haloperidol", label: "Haloperidol", detail: "Náusea persistente, química/metabólica ou associada a delirium: 0,5 mg a 1 mg VO/SC/retal à noite ou a cada 12 h.", routes: ["oral", "subcutaneous", "rectal", "tube"], intensities: ["moderate", "severe", "crisis"] },
    { id: "nausea-ondansetron", label: "Ondansetrona", detail: "Náusea/vômito moderado/intenso: considerar 4 mg a 8 mg VO/EV a cada 8 a 12 h quando indicado; observar constipação.", routes: ["oral", "tube"], intensities: ["moderate", "severe"] },
  ],
  constipation: [
    { id: "constipation-laxative", label: "Laxativo de rotina", detail: "Constipação leve/moderada: associar laxativo estimulante e/ou osmótico conforme padrão intestinal, hidratação e opioide.", routes: ["oral", "tube"], intensities: ["mild", "moderate"] },
    { id: "constipation-bisacodyl", label: "Bisacodil retal", detail: "Constipação intensa: considerar bisacodil 10 mg por via retal se não houver contraindicação local.", routes: ["rectal"], intensities: ["severe", "crisis"] },
    { id: "constipation-rectal", label: "Enema ou medida retal se impactação", detail: "Constipação intensa ou suspeita de fecaloma: considerar enema, supositório de glicerina ou remoção, respeitando conforto, plaquetas e mucosa.", routes: ["rectal"], intensities: ["severe", "crisis"] },
  ],
  diarrhea: [
    { id: "diarrhea-loperamide", label: "Loperamida", detail: "Diarreia leve/moderada sem sinais infecciosos: considerar 2 mg após evacuação, ajustando conforme causa.", routes: ["oral", "tube"], intensities: ["mild", "moderate"] },
    { id: "diarrhea-hydration", label: "Reposição proporcional", detail: "Diarreia moderada/intensa: repor líquidos e eletrólitos conforme objetivo de cuidado; investigar laxativos, antibióticos e impactação.", routes: ["oral", "subcutaneous", "tube"], intensities: ["moderate", "severe", "crisis"] },
  ],
  anxiety: [
    { id: "anxiety-lorazepam", label: "Benzodiazepínico de curta ação", detail: "Ansiedade moderada/intensa: considerar lorazepam 0,5 mg VO/SL/retal, com cautela para delirium, quedas e sedação.", routes: ["oral", "rectal", "tube"], intensities: ["moderate", "severe"] },
    { id: "anxiety-diazepam", label: "Diazepam retal", detail: "Crise com ansiedade intensa ou convulsão: considerar diazepam 5 mg a 10 mg por via retal, com monitoramento de sedação e respiração.", routes: ["rectal"], intensities: ["severe", "crisis"] },
    { id: "anxiety-midazolam", label: "Midazolam se crise/refratariedade", detail: "Ansiedade em crise/refratária: considerar midazolam SC conforme protocolo e monitorização clínica.", routes: ["subcutaneous"], intensities: ["crisis"] },
  ],
  delirium: [
    { id: "delirium-haloperidol", label: "Haloperidol", detail: "Delirium moderado/intenso: 0,5 mg a 1 mg VO/SC/retal a cada 12 a 24 h, titulando por sintomas e efeitos adversos.", routes: ["oral", "subcutaneous", "rectal", "tube"], intensities: ["moderate", "severe", "crisis"] },
    { id: "delirium-quetiapine", label: "Quetiapina se via oral possível", detail: "Delirium leve/moderado em caso selecionado: considerar 12,5 mg a 25 mg VO à noite.", routes: ["oral", "tube"], intensities: ["mild", "moderate"] },
  ],
  secretions: [
    { id: "secretions-scopolamine", label: "Escopolamina", detail: "Secreções moderadas/intensas ou sororoca: considerar escopolamina conforme via disponível e protocolo local.", routes: ["oral", "subcutaneous", "tube"], intensities: ["moderate", "severe", "crisis"] },
  ],
  fatigue: [
    { id: "fatigue-methylphenidate", label: "Psicoestimulante em caso selecionado", detail: "Fadiga moderada/intensa: considerar metilfenidato 2,5 mg a 5 mg pela manhã se prognóstico/risco forem compatíveis.", routes: ["oral", "tube"], intensities: ["moderate", "severe"] },
    { id: "fatigue-dexamethasone", label: "Corticosteroide em contexto selecionado", detail: "Fadiga intensa/fim de vida: considerar dexametasona 2 mg a 4 mg pela manhã por curto período se meta definida.", routes: ["oral", "subcutaneous", "tube"], intensities: ["severe", "crisis"] },
  ],
  anorexiaCachexia: [
    { id: "anorexia-dexamethasone", label: "Corticosteroide em contexto selecionado", detail: "Anorexia-caquexia moderada/intensa: considerar dexametasona 2 mg a 4 mg pela manhã por curto período se benefício esperado.", routes: ["oral", "subcutaneous", "tube"], intensities: ["moderate", "severe"] },
    { id: "anorexia-comfort", label: "Sem fármaco de rotina na fase final", detail: "Crise/fim de vida: priorizar conforto alimentar e boca úmida; medicamento apenas se houver sintoma-alvo claro.", routes: ["oral", "subcutaneous", "rectal", "tube"], intensities: ["crisis"] },
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
      { id: "anorexia-family", text: "Explicar anorexia-caquexia, alinhar metas de conforto e revisar causas reversíveis como boca seca, náusea e constipação." },
    ],
    crisis: [
      { id: "anorexia-end", text: "Na fase final, não forçar dieta; focar boca úmida, conforto, rituais familiares e explicação clara." },
    ],
  },
};

const prescriptionRouteMedicationDetails = {
  "pain-dipyrone": {
    oral: "Dipirona 500 mg a 1 g VO a cada 6 h.",
    subcutaneous: "Dipirona 500 mg a 1 g por via SC a cada 6 h, conforme protocolo local e tolerância do sítio.",
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
    oral: "Morfina 2,5 mg a 5 mg VO como dose inicial, com reavaliação e titulação conforme resposta.",
    subcutaneous: "Morfina 1 mg a 2 mg SC como dose inicial, com reavaliação e titulação conforme resposta.",
    rectal: "Morfina 2,5 mg a 5 mg por via retal como dose inicial, considerando absorção variável e titulação conforme resposta.",
    tube: "Morfina 2,5 mg a 5 mg por sonda/gastrostomia como dose inicial, diluir e lavar a sonda antes e após.",
  },
  "pain-amitriptyline": {
    oral: "Amitriptilina 10 mg VO à noite como dose inicial em pessoa idosa/frágil; monitorar sedação, boca seca, retenção urinária e quedas.",
    tube: "Amitriptilina 10 mg por sonda/gastrostomia à noite apenas se apresentação compatível; confirmar possibilidade de trituração.",
  },
  "pain-duloxetine": {
    oral: "Duloxetina 30 mg VO pela manhã como dose inicial quando perfil clínico permitir; revisar interações e função hepática.",
  },
  "pain-gabapentin": {
    oral: "Gabapentina 100 mg a 300 mg VO à noite como dose inicial; ajustar por idade, sonolência e função renal.",
    tube: "Gabapentina 100 mg a 300 mg por sonda/gastrostomia à noite se apresentação compatível; lavar a sonda antes e após.",
  },
  "dyspnea-morphine": {
    oral: "Morfina 2,5 mg a 5 mg VO para dispneia moderada/intensa, com reavaliação.",
    subcutaneous: "Morfina 1 mg a 2 mg SC para dispneia moderada/intensa, com reavaliação.",
    tube: "Morfina 2,5 mg a 5 mg por sonda/gastrostomia para dispneia, diluir e lavar a sonda antes e após.",
  },
  "dyspnea-bronchodilator": {
    oral: "Se broncoespasmo, preferir via inalatória/nebulização; esta opção não é prescrição oral direta.",
    tube: "Se broncoespasmo, preferir via inalatória/nebulização; esta opção não é administrada por sonda.",
  },
  "dyspnea-benzodiazepine": {
    oral: "Lorazepam 0,5 mg VO/SL em dispneia com pânico/ansiedade intensa, se apropriado.",
    subcutaneous: "Midazolam SC em baixa dose conforme protocolo local se crise de dispneia com ansiedade importante.",
    tube: "Lorazepam 0,5 mg por sonda/gastrostomia se apresentação compatível; monitorar sedação.",
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
  "cough-acetylcysteine": {
    oral: "N-acetilcisteína VO se secreção espessa e benefício esperado; evitar se piorar náusea, broncoespasmo ou volume de secreção.",
    tube: "N-acetilcisteína por sonda/gastrostomia apenas se apresentação compatível; diluir e lavar a sonda antes e após.",
  },
  "nausea-metoclopramide": {
    oral: "Metoclopramida 10 mg VO a cada 8 h, evitando se obstrução completa ou sintomas extrapiramidais.",
    subcutaneous: "Metoclopramida 10 mg SC a cada 8 h, evitando se obstrução completa ou sintomas extrapiramidais.",
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
    tube: "Ondansetrona 4 mg a 8 mg por sonda/gastrostomia a cada 8 a 12 h, se apresentação compatível; observar constipação.",
  },
  "constipation-laxative": {
    oral: "Laxativo estimulante e/ou osmótico VO conforme padrão intestinal e uso de opioide.",
    tube: "Laxativo por sonda/gastrostomia conforme apresentação compatível; diluir e lavar a sonda antes e após.",
  },
  "constipation-bisacodyl": {
    rectal: "Bisacodil 10 mg por via retal se constipação intensa e sem contraindicação local.",
  },
  "constipation-rectal": {
    rectal: "Supositório de glicerina, enema ou remoção retal se fecaloma, respeitando conforto, plaquetas e mucosa.",
  },
  "diarrhea-loperamide": {
    oral: "Loperamida 2 mg VO após evacuação diarreica, ajustando conforme causa.",
    tube: "Loperamida 2 mg por sonda/gastrostomia após evacuação diarreica, se apresentação compatível.",
  },
  "diarrhea-hydration": {
    oral: "Reposição oral proporcional de líquidos e eletrólitos conforme tolerância e objetivo de cuidado.",
    subcutaneous: "Hidratação SC proporcional se via oral insuficiente e objetivo de cuidado justificar.",
    tube: "Reposição hídrica por sonda/gastrostomia conforme tolerância, risco de broncoaspiração e objetivo de cuidado.",
  },
  "anxiety-lorazepam": {
    oral: "Lorazepam 0,5 mg VO/SL se ansiedade moderada/intensa, com cautela para delirium, quedas e sedação.",
    rectal: "Lorazepam 0,5 mg por via retal se apresentação compatível, com cautela para delirium, quedas e sedação.",
    tube: "Lorazepam 0,5 mg por sonda/gastrostomia se apresentação compatível; monitorar sedação.",
  },
  "anxiety-diazepam": {
    rectal: "Diazepam 5 mg a 10 mg por via retal em crise selecionada; monitorar sedação, respiração e risco de delirium.",
  },
  "anxiety-midazolam": {
    subcutaneous: "Midazolam SC em crise/refratariedade conforme protocolo local e monitorização clínica.",
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
  "secretions-scopolamine": {
    oral: "Escopolamina por via oral se apresentação disponível e apropriada; monitorar retenção urinária, constipação e delirium.",
    subcutaneous: "Escopolamina SC conforme protocolo local para secreções/sororoca.",
    tube: "Escopolamina por sonda/gastrostomia se apresentação compatível; monitorar efeitos anticolinérgicos.",
  },
  "fatigue-methylphenidate": {
    oral: "Metilfenidato 2,5 mg a 5 mg VO pela manhã em caso selecionado.",
    tube: "Metilfenidato por sonda/gastrostomia apenas se apresentação compatível; confirmar antes de triturar.",
  },
  "fatigue-dexamethasone": {
    oral: "Dexametasona 2 mg a 4 mg VO pela manhã por curto período se meta definida.",
    subcutaneous: "Dexametasona 2 mg a 4 mg SC pela manhã por curto período conforme protocolo local.",
    tube: "Dexametasona 2 mg a 4 mg por sonda/gastrostomia pela manhã, se apresentação compatível.",
  },
  "anorexia-dexamethasone": {
    oral: "Dexametasona 2 mg a 4 mg VO pela manhã por curto período se benefício esperado.",
    subcutaneous: "Dexametasona 2 mg a 4 mg SC pela manhã por curto período conforme protocolo local.",
    tube: "Dexametasona 2 mg a 4 mg por sonda/gastrostomia pela manhã, se apresentação compatível.",
  },
  "anorexia-comfort": {
    oral: "Não há fármaco oral de rotina; priorizar conforto alimentar, boca úmida e sintoma-alvo claro.",
    subcutaneous: "Não há fármaco SC de rotina; usar via SC apenas para sintoma-alvo claro.",
    rectal: "Não há fármaco retal de rotina para anorexia-caquexia em fim de vida.",
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
    text: "Priorizar efetividade da tosse, mobilização de secreções e conforto, evitando supressão indiscriminada quando a secreção precisa ser eliminada.",
    actions: [
      "Tratamento não medicamentoso: avaliar volume/aspecto da secreção, manter hidratação proporcional, umidificação, posicionamento e higiene brônquica quando confortável.",
      "Se a tosse for eficaz, evitar supressão rotineira para não reter secreção.",
      "Se secreção espessa: considerar nebulização com cloreto de sódio 0,9% a 3%, conforme tolerabilidade e protocolo local.",
      "Se secreção espessa persistente e a via oral for possível: considerar N-acetilcisteína 600 mg VO 1 vez/dia como dose inicial.",
    ],
  },
  dry: {
    title: "Tosse seca ou irritativa",
    text: "Pesquisar irritação de via aérea, refluxo, gotejamento pós-nasal, broncoespasmo, medicamento em uso e componente tumoral ou inflamatório.",
    actions: [
      "Tratamento não medicamentoso: reduzir gatilhos ambientais, revisar tabagismo, umidificar ambiente se ressecamento e evitar odores/irritantes.",
      "Se tosse seca persistente gerar desconforto e não houver secreção útil: considerar codeína 10 mg VO a cada 6 horas como dose inicial; titular para 10 mg a 20 mg até de 4/4 horas conforme resposta e tolerabilidade.",
      "Monitorar sonolência, constipação, náuseas, retenção urinária e interação com outros depressores do sistema nervoso central.",
    ],
  },
  secretions: {
    title: "Tosse com secreção excessiva",
    text: "O objetivo é reduzir acúmulo de secreções e sofrimento, sem ressecar excessivamente quando ainda há necessidade de expectoração.",
    actions: [
      "Tratamento não medicamentoso: avaliar se a tosse é eficaz, reposicionar, reduzir decúbito plano e associar higiene brônquica quando proporcional.",
      "Se secreção brônquica com broncorreia ou componente colinérgico: considerar brometo de ipratrópio 20 a 40 gotas por nebulização como dose inicial, conforme prescrição e protocolo local.",
      "Se secreção terminal/sororoca ou excesso de secreção com tosse ineficaz: considerar escopolamina 10 mg a 20 mg a cada 6 horas como dose inicial, conforme via disponível e tolerabilidade.",
      "Monitorar boca seca, retenção urinária, delirium, constipação e espessamento excessivo de secreções.",
    ],
  },
  refractory: {
    title: "Tosse refratária",
    text: "Revisar causas reversíveis, impacto no sono/dor/dispneia e necessidade de abordagem combinada.",
    actions: [
      "Rever causas: tumor endobrônquico, derrame pleural, obstrução de via aérea, infecção, refluxo, gotejamento pós-nasal, IECA e broncoespasmo.",
      "Se tosse seca ou irritativa persistente: considerar codeína 10 mg VO a cada 6 horas como dose inicial, com titulação gradual conforme resposta.",
      "Se tosse refratária persistir apesar de tratamento da causa provável: considerar gabapentina 100 mg a 300 mg à noite como dose inicial, com ajuste gradual e revisão de função renal, tontura e sonolência.",
      "Quando houver componente complexo, obstrutivo, tumoral ou pleural, considerar avaliação especializada conforme contexto, proporcionalidade e meta de cuidado.",
    ],
  },
};

const coughFactorActions = {
  ineffective: "Fator associado: tosse ineficaz. Tratamento sugerido: fisioterapia respiratória, drenagem postural, manobras de higiene brônquica e exercícios de reexpansão quando confortáveis; evitar antitussivo se houver secreção retida importante.",
  bronchospasm: "Fator associado: broncoespasmo. Tratamento sugerido: revisar broncodilatadores e técnica inalatória; considerar brometo de ipratrópio 20 a 40 gotas por nebulização como dose inicial quando indicado.",
  refluxPostnasal: "Fator associado: refluxo ou gotejamento pós-nasal. Tratamento sugerido: elevar cabeceira, evitar refeições volumosas antes de deitar, revisar rinossinusite/gotejamento e tratar a causa provável conforme avaliação clínica.",
  acei: "Fator associado: IECA. Tratamento sugerido: discutir substituição do inibidor da enzima conversora de angiotensina com a equipe responsável; não escalonar antitussivo antes dessa revisão se a tosse for compatível.",
  tumorPleural: "Fator associado: doença tumoral/pleural ou obstrutiva. Tratamento sugerido: reavaliar proporcionalidade de investigação, corticoide, abordagem de derrame/obstrução e metas de cuidado; se tosse irritativa causar sofrimento, considerar codeína 10 mg VO a cada 6 horas como dose inicial.",
};

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
  reversible: {
    title: "Baixa ingesta potencialmente reversível",
    text: "Priorizar investigação e tratamento de fatores modificáveis antes de atribuir o quadro à caquexia avançada.",
    actions: [
      "Registrar peso atual, peso habitual, percentual de perda, ingesta aproximada, sintomas associados, funcionalidade e meta de cuidado.",
      "Tratar sintomas que reduzem ingesta: náusea, constipação, dor, candidíase oral, xerostomia, mucosite, refluxo, depressão e dispneia.",
      "Associar condutas nutricionais: pequenas refeições frequentes, alimentos preferidos, maior densidade calórica/proteica e adaptação de consistência.",
    ],
  },
  cachexia: {
    title: "Caquexia com perda funcional",
    text: "Combinar suporte nutricional proporcional, controle de sintomas, comunicação clara e metas funcionais realistas.",
    actions: [
      "Explicar que a caquexia é multifatorial e frequentemente não reverte apenas com aumento de calorias.",
      "Considerar aconselhamento nutricional e suplementos orais se houver aceitação, expectativa de benefício funcional e ausência de carga excessiva.",
      "Se houver objetivo claro de curto prazo, considerar corticosteroide por tempo limitado ou megestrol em caso selecionado, ponderando tromboembolismo, edema, hiperglicemia e outros riscos.",
    ],
  },
  endOfLife: {
    title: "Fase final de vida",
    text: "Priorizar conforto, higiene oral, alívio de sede e redução de sofrimento familiar; ganho de peso não deve ser meta central.",
    actions: [
      "Evitar forçar alimentação; oferecer pequenas quantidades se desejadas e respeitar recusa.",
      "Priorizar higiene oral, alívio de sede, ambiente calmo, manejo de náusea, secreções, boca seca e desconforto.",
      "Discutir hidratação artificial caso a caso, ponderando sede, delirium, secreções, edema, ascite, vômitos, sobrecarga e objetivo do cuidado.",
    ],
  },
};

const anorexiaFactorActions = {
  giSymptoms:
    "Fator associado: sintomas gastrointestinais. Tratar náusea, vômito, constipação, diarreia, refluxo, saciedade precoce ou plenitude antes de intensificar dieta ou estimulantes do apetite.",
  oralDysphagia:
    "Fator associado: alterações orais ou disfagia. Tratar xerostomia, candidíase, mucosite, dor oral e alteração de paladar; ajustar consistência e envolver fonoaudiologia quando houver objetivo claro.",
  symptomsMood:
    "Fator associado: sintomas e sofrimento. Controlar dor, dispneia, depressão, ansiedade, delirium e sofrimento espiritual; revisar conflito familiar como parte do plano terapêutico.",
  medicationsMetabolic:
    "Fator associado: medicamentos ou causas clínicas. Revisar opioides, antibióticos, ferro, anti-inflamatórios, digoxina, antidepressivos e quimioterápicos; investigar causas metabólicas proporcionais à meta de cuidado.",
  familyPressure:
    "Fator associado: pressão familiar. Realizar conversa estruturada: explicar que perda de apetite pode ser parte da doença, evitar disputa alimentar e alinhar meta de conforto e prazer possível.",
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
  const activeTabId = symptomTabIds.has(tabId) ? "sintomas" : tabId;

  tabs.forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.tab === activeTabId);
  });

  panels.forEach((panel) => {
    panel.classList.toggle("active", panel.id === tabId);
  });

  updateSymptomTabs(tabId);

  history.replaceState(null, "", `#${tabId}`);

  if (focusPanel) {
    targetPanel?.scrollIntoView({ behavior: "smooth", block: "start" });
    targetPanel?.focus({ preventScroll: true });
  }
}

document.body.classList.add("dialog-open");

acceptButton.addEventListener("click", closeDialog);
declineButton.addEventListener("click", closeDialog);

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

mountSymptomSubtabs();

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
  const factorActions = coughState.factors.map((factor) => coughFactorActions[factor]);

  title.textContent = plan.title;
  text.textContent = plan.text;
  actions.replaceChildren(
    ...plan.actions.map(createResultItem),
    ...factorActions.map(createResultItem),
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
    text.textContent = "Selecione uma resposta no passo 1 antes de avançar para situação predominante, fatores associados e conduta.";
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
      "Antes de seguir o manejo habitual da anorexia-caquexia, priorizar avaliação dirigida dos sinais de alerta selecionados.";
    actions.replaceChildren(
      ...[
        ...anorexiaState.alerts.map((alert) => anorexiaAlertActions[alert]),
        "Registrar os alertas, orientar retorno imediato se houver piora e acionar avaliação presencial/urgência conforme gravidade e plano de cuidado.",
      ].map(createResultItem)
    );
    return;
  }

  const plan = anorexiaStagePlans[anorexiaState.stage];
  const factorActions = anorexiaState.factors.map((factor) => anorexiaFactorActions[factor]);

  title.textContent = plan.title;
  text.textContent = plan.text;
  actions.replaceChildren(
    ...plan.actions.map(createResultItem),
    ...factorActions.map(createResultItem),
    createResultItem("Reavaliar apetite, ingesta, peso quando fizer sentido, sintomas, funcionalidade, conforto, efeitos adversos e sofrimento familiar em prazo definido.")
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

    prescriptionState[group.dataset.prescriptionGroup] = selected.dataset.value;
    if (group.dataset.prescriptionGroup === "route") {
      prescriptionState.routeAnswered = true;
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

function hasPrescriptionSubtypeMatch(selectedTypes, optionTypes) {
  return !selectedTypes.length || !optionTypes || optionTypes.some((type) => selectedTypes.includes(type));
}

function getPrescriptionOptions() {
  const selected = new Map();
  prescriptionState.symptoms.forEach((symptom) => {
    const intensity = prescriptionState.symptomIntensities[symptom];
    (prescriptionMedicationOptions[symptom] || []).forEach((option) => {
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

  if (step === "route") return true;
  if (step === "symptoms") return prescriptionState.routeAnswered;
  if (step === "intensity") return prescriptionState.routeAnswered && hasSymptoms;
  if (step === "nonpharm") return prescriptionState.routeAnswered && hasSymptoms && hasIntensities;
  if (step === "medications") return prescriptionState.routeAnswered && hasSymptoms && hasIntensities && hasNonpharm;
  if (step === "summary") {
    return prescriptionState.routeAnswered && hasSymptoms && hasIntensities && hasNonpharm && hasMedications;
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
      ? "Não há opção farmacológica compatível com a via selecionada, sintomas e intensidade definidos. Reavalie a via ou considere avaliação especializada."
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
  return [
    `Via: ${prescriptionLabels.routes[prescriptionState.route]}`,
    `Sintomas: ${symptoms.length ? symptoms.join(", ") : "não selecionado"}`,
    `Tipo de dor: ${painTypes.length ? painTypes.join(", ") : prescriptionState.symptoms.includes("pain") ? "não selecionado" : "não se aplica"}`,
    `Tipo de tosse: ${coughTypes.length ? coughTypes.join(", ") : prescriptionState.symptoms.includes("cough") ? "não selecionado" : "não se aplica"}`,
    `Intensidade por sintoma: ${intensities.length ? intensities.join("; ") : "não definida"}`,
    `Condutas não farmacológicas: ${nonpharm.length ? nonpharm.join(" ") : "não selecionadas"}`,
    `Condutas farmacológicas: ${medications.length ? medications.join(" ") : "não selecionadas"}`,
    "Checar alergias, função renal/hepática, interações, contraindicações, via disponível e protocolos locais antes de prescrever.",
  ].join("\n");
}

function updatePrescriptionResult() {
  cleanupPrescriptionSymptomData();
  renderPrescriptionSelectedSymptoms();
  renderPrescriptionIntensityControls();
  renderPrescriptionNonpharmOptions();
  renderPrescriptionMedicationOptions();

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

  title.textContent = symptoms.length
    ? `Prescrição para ${symptoms.join(", ")}`
    : "Selecione sintomas para gerar a prescrição";

  summary.innerHTML =
    renderPrescriptionSection("Via", [
      `Via: ${prescriptionLabels.routes[prescriptionState.route]}`,
    ]) +
    renderPrescriptionSection("Sintomas selecionados", symptoms) +
    renderPrescriptionSection("Tipo de dor", prescriptionState.symptoms.includes("pain") ? painTypes : []) +
    renderPrescriptionSection("Tipo de tosse", prescriptionState.symptoms.includes("cough") ? coughTypes : []) +
    renderPrescriptionSection("Intensidade por sintoma", intensities) +
    renderPrescriptionSection("Condutas não farmacológicas", nonpharm) +
    renderPrescriptionSection("Condutas farmacológicas", medications) +
    renderPrescriptionSection("Segurança", [
      "Checar alergias, função renal/hepática, interações, contraindicações, via disponível e protocolos locais.",
      "Definir dose de resgate, critérios de reavaliação e sinais para acionar equipe.",
    ]);
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
  "indicacao-avaliacao": "indicacao",
  "tratamento-medicamentoso": "tratamento-medicamentoso-dor",
  "tosse-dispneia": "tosse",
  "visao-geral-dispneia": "tipos-dispneia",
  "sintomas-gastrointestinais": "nauseas",
  "deteccao-fadiga": "deteccao-anorexia",
  "causas-reversiveis-fadiga": "causas-reversiveis-anorexia",
  "condutas-nutricionais-fadiga": "condutas-nutricionais-anorexia",
  "tratamento-medicamentoso-fadiga": "tratamento-medicamentoso-anorexia",
  "comunicacao-familia-fadiga": "comunicacao-familia-anorexia",
};
const initialTab = legacyHashMap[initialHash] || initialHash;

if (initialTab && panels.some((panel) => panel.id === initialTab)) {
  openTab(initialTab, false);
} else if (initialTab && document.getElementById(initialTab)?.classList.contains("pain-subpanel")) {
  openTab("manejo-dor", false);
  openPainSubtab(initialTab, false);
} else if (initialTab && document.getElementById(initialTab)?.classList.contains("cough-subpanel")) {
  openTab("tosse", false);
  openCoughSubtab(initialTab, false);
} else if (initialTab && document.getElementById(initialTab)?.classList.contains("dyspnea-subpanel")) {
  openTab("dispneia", false);
  openDyspneaSubtab(initialTab, false);
} else if (initialTab && document.getElementById(initialTab)?.classList.contains("fatigue-subpanel")) {
  openTab("fadiga", false);
  openFatigueSubtab(initialTab, false);
} else if (initialTab && document.getElementById(initialTab)?.classList.contains("anorexia-subpanel")) {
  openTab("anorexia-caquexia", false);
  openAnorexiaSubtab(initialTab, false);
} else if (initialTab && document.getElementById(initialTab)?.classList.contains("hypodermo-subpanel")) {
  openTab("hipodermoclise", false);
  openHypodermoSubtab(initialTab, false);
}
