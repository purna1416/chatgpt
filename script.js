const form = document.getElementById('resumeForm');
const preview = document.getElementById('resumePreview');
const clearBtn = document.getElementById('clearAll');
const printBtn = document.getElementById('printResume');
const downloadJsonBtn = document.getElementById('downloadJson');
const uploadJsonInput = document.getElementById('uploadJson');
const templateSelect = document.getElementById('templateSelect');
const analyzeResumeBtn = document.getElementById('analyzeResume');
const improveSummaryBtn = document.getElementById('improveSummary');
const improveHighlightsBtn = document.getElementById('improveHighlights');
const proGenerateBtn = document.getElementById('proGenerate');
const askAssistantBtn = document.getElementById('askAssistant');
const assistantPromptInput = document.getElementById('assistantPrompt');
const assistantResponse = document.getElementById('assistantResponse');
const suggestionList = document.getElementById('suggestionList');

const STORAGE_KEY = 'resumeforge-data-v2';
const TEMPLATE_KEY = 'resumeforge-template-v2';

const templates = [
  { id: 'cobalt', name: 'Cobalt Professional' },
  { id: 'minimal', name: 'Minimal Serif' },
  { id: 'onyx', name: 'Onyx Executive' },
  { id: 'emerald', name: 'Emerald Clean' },
  { id: 'sunset', name: 'Sunset Accent' },
  { id: 'slate', name: 'Slate Corporate' },
  { id: 'royal', name: 'Royal Blue ATS' },
  { id: 'graphite', name: 'Graphite Mono' },
  { id: 'violet', name: 'Violet Creative' },
  { id: 'forest', name: 'Forest Premium' },
  { id: 'ruby', name: 'Ruby Distinct' },
  { id: 'arctic', name: 'Arctic Modern' },
];

let templateMode = localStorage.getItem(TEMPLATE_KEY) || templates[0].id;

function escapeHtml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function getFormData() {
  return Object.fromEntries(new FormData(form).entries());
}

function normalizeHighlights(text) {
  return (text || '')
    .split(/\n|;|•/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function renderExperience(data) {
  const items = [1, 2, 3]
    .map((n) => ({
      role: data[`expRole${n}`],
      company: data[`expCompany${n}`],
      duration: data[`expDuration${n}`],
      highlights: normalizeHighlights(data[`expHighlights${n}`]),
    }))
    .filter((i) => i.role || i.company || i.duration || i.highlights.length);

  if (!items.length) return '<p class="muted">Add your work experience.</p>';

  return items
    .map(
      (item) => `
      <div class="exp-item">
        <strong>${escapeHtml(item.role)}</strong>${item.company ? ` — ${escapeHtml(item.company)}` : ''}
        <div class="muted">${escapeHtml(item.duration)}</div>
        <ul>
          ${item.highlights.map((h) => `<li>${escapeHtml(h)}</li>`).join('')}
        </ul>
      </div>
    `,
    )
    .join('');
}

function renderResume(data) {
  const skills = (data.skills || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  preview.className = `template-${templateMode}`;

  preview.innerHTML = `
    <header class="resume-header">
      <h3>${escapeHtml(data.fullName || 'Your Name')}</h3>
      <p>${escapeHtml(data.title || 'Professional Title')}</p>
      <p class="muted">
        ${escapeHtml([data.email, data.phone, data.location, data.website].filter(Boolean).join(' • ') || 'Email • Phone • Location')}
      </p>
    </header>

    <section class="resume-section">
      <h4>Summary</h4>
      <p>${escapeHtml(data.summary || 'Write a short summary to highlight your profile.')}</p>
    </section>

    <section class="resume-section">
      <h4>Skills</h4>
      ${
        skills.length
          ? `<div class="tag-list">${skills.map((s) => `<span class="tag">${escapeHtml(s)}</span>`).join('')}</div>`
          : '<p class="muted">Add skills separated by commas.</p>'
      }
    </section>

    <section class="resume-section">
      <h4>Experience</h4>
      ${renderExperience(data)}
    </section>

    <section class="resume-section">
      <h4>Education</h4>
      ${
        data.degree || data.school || data.eduYear
          ? `<p><strong>${escapeHtml(data.degree)}</strong><br/>${escapeHtml(data.school)} ${data.eduYear ? `(${escapeHtml(data.eduYear)})` : ''}</p>`
          : '<p class="muted">Add your education details.</p>'
      }
    </section>
  `;
}

function syncFromStorage() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return;

  try {
    const parsed = JSON.parse(saved);
    Object.entries(parsed).forEach(([key, value]) => {
      if (form.elements[key]) form.elements[key].value = value;
    });
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(getFormData()));
}

function update() {
  const data = getFormData();
  persist();
  renderResume(data);
}

function downloadJson() {
  const blob = new Blob([JSON.stringify(getFormData(), null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'resume-data.json';
  anchor.click();
  URL.revokeObjectURL(url);
}

function uploadJson(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      Object.entries(parsed).forEach(([key, value]) => {
        if (form.elements[key]) form.elements[key].value = value;
      });
      update();
      assistantResponse.textContent = 'Resume data imported successfully.';
    } catch {
      alert('Invalid JSON file.');
    }
  };
  reader.readAsText(file);
}

function setTemplates() {
  templateSelect.innerHTML = templates
    .map((template) => `<option value="${template.id}">${template.name}</option>`)
    .join('');
  templateSelect.value = templateMode;
}

function skillsArray(data) {
  return (data.skills || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

function analyzeResume() {
  const data = getFormData();
  const suggestions = [];
  const summaryWords = (data.summary || '').trim().split(/\s+/).filter(Boolean).length;
  const skills = skillsArray(data);
  const allHighlights = [1, 2, 3].flatMap((n) => normalizeHighlights(data[`expHighlights${n}`]));

  if (!data.fullName) suggestions.push('Add your full name to keep the resume recruiter-ready.');
  if (!data.title) suggestions.push('Add a professional title aligned to your target role.');
  if (summaryWords < 40) suggestions.push('Expand summary to ~40–80 words with achievements and domain expertise.');
  if (skills.length < 6) suggestions.push('Increase skills to 8-12 targeted keywords for ATS visibility.');
  if (!allHighlights.some((h) => /\d+%|\d+x|\d+\+/.test(h))) {
    suggestions.push('Add quantified impact in experience bullets (e.g., reduced cost by 20%).');
  }

  const title = (data.title || '').toLowerCase();
  if (title.includes('frontend') && !skills.some((k) => ['react', 'typescript', 'javascript'].includes(k))) {
    suggestions.push('For frontend roles, include role-aligned skills like React, TypeScript, JavaScript.');
  }
  if (title.includes('backend') && !skills.some((k) => ['node.js', 'sql', 'api'].includes(k))) {
    suggestions.push('For backend roles, include Node.js, SQL, REST/GraphQL APIs, and system design keywords.');
  }

  if (!suggestions.length) suggestions.push('Great baseline! Next: tailor resume keywords to each job description.');

  suggestionList.innerHTML = suggestions.map((item) => `<li>${escapeHtml(item)}</li>`).join('');
  assistantResponse.textContent = `AI Assistant analyzed your resume and found ${suggestions.length} improvement point(s).`;
}

function improveSummary() {
  const data = getFormData();
  if (!data.summary?.trim()) {
    form.elements.summary.value = `Results-driven ${data.title || 'professional'} with experience delivering measurable business impact through cross-functional collaboration, process optimization, and high-quality execution. Strong focus on ownership, communication, and outcomes.`;
  } else {
    form.elements.summary.value = `${data.summary.trim()} Proven track record of delivering quantifiable outcomes, optimizing workflows, and building stakeholder trust through consistent, high-quality execution.`;
  }
  update();
  assistantResponse.textContent = 'Summary upgraded to a more proficient, impact-focused version.';
}

function improveHighlights() {
  [1, 2, 3].forEach((n) => {
    const field = form.elements[`expHighlights${n}`];
    const lines = normalizeHighlights(field.value);
    if (!lines.length) return;

    const upgraded = lines.map((line) => {
      if (/\d+%|\d+x|\d+\+/.test(line)) return line;
      return `${line} (improved KPI by 15%)`;
    });

    field.value = upgraded.join('; ');
  });

  update();
  assistantResponse.textContent = 'Experience bullets enhanced with measurable impact language.';
}

function generateProProfile() {
  const data = getFormData();
  if (!data.title) form.elements.title.value = 'Software Engineer';
  if (!data.skills) {
    form.elements.skills.value = 'Problem Solving, Communication, JavaScript, TypeScript, React, Node.js, APIs, Testing, Git, Agile';
  }
  if (!data.summary) {
    form.elements.summary.value = `Proactive ${form.elements.title.value} with a strong record of building scalable products, improving operational efficiency, and delivering measurable user and business value.`;
  }
  if (!data.expHighlights1) {
    form.elements.expHighlights1.value = 'Led feature delivery across teams; Reduced defects by 30%; Improved release velocity by 25%';
  }

  update();
  analyzeResume();
  assistantResponse.textContent = 'Proficient profile baseline generated. Review and tailor to your target job.';
}

function askAssistant() {
  const question = (assistantPromptInput.value || '').trim().toLowerCase();
  if (!question) {
    assistantResponse.textContent = 'Please ask a question so the assistant can help optimize your resume.';
    return;
  }

  if (question.includes('ats')) {
    assistantResponse.textContent = 'ATS tip: mirror key terms from the job description in your title, summary, skills, and experience bullets.';
  } else if (question.includes('summary')) {
    assistantResponse.textContent = 'Strong summaries include role identity, years of experience, domain expertise, and measurable wins.';
  } else if (question.includes('experience') || question.includes('bullet')) {
    assistantResponse.textContent = 'Use action verb + project context + measurable impact in every bullet for recruiter clarity.';
  } else if (question.includes('skill')) {
    assistantResponse.textContent = 'Prioritize role-relevant technical + domain + collaboration skills. Keep top skills near the top.';
  } else {
    assistantResponse.textContent = 'Focus on clarity, relevance, and measurable outcomes. Tailor each resume to the exact role.';
  }
}

form.addEventListener('input', update);
clearBtn.addEventListener('click', () => {
  form.reset();
  localStorage.removeItem(STORAGE_KEY);
  suggestionList.innerHTML = '';
  assistantResponse.textContent = 'All data cleared.';
  update();
});

printBtn.addEventListener('click', () => window.print());
downloadJsonBtn.addEventListener('click', downloadJson);
uploadJsonInput.addEventListener('change', (e) => {
  const [file] = e.target.files;
  if (file) uploadJson(file);
});

templateSelect.addEventListener('change', () => {
  templateMode = templateSelect.value;
  localStorage.setItem(TEMPLATE_KEY, templateMode);
  update();
});

analyzeResumeBtn.addEventListener('click', analyzeResume);
improveSummaryBtn.addEventListener('click', improveSummary);
improveHighlightsBtn.addEventListener('click', improveHighlights);
proGenerateBtn.addEventListener('click', generateProProfile);
askAssistantBtn.addEventListener('click', askAssistant);

setTemplates();
syncFromStorage();
update();
