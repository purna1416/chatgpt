const form = document.getElementById('resumeForm');
const preview = document.getElementById('resumePreview');
const clearBtn = document.getElementById('clearAll');
const printBtn = document.getElementById('printResume');
const downloadJsonBtn = document.getElementById('downloadJson');
const uploadJsonInput = document.getElementById('uploadJson');
const templateSelect = document.getElementById('templateSelect');
const templateCount = document.getElementById('templateCount');

const analyzeResumeBtn = document.getElementById('analyzeResume');
const improveSummaryBtn = document.getElementById('improveSummary');
const improveHighlightsBtn = document.getElementById('improveHighlights');
const aiFeedback = document.getElementById('aiFeedback');

const STORAGE_KEY = 'resumeforge-data-v2';
const TEMPLATE_KEY = 'resumeforge-template-v2';

const templates = [
  { id: 'template-modern', name: 'Modern' },
  { id: 'template-minimal', name: 'Minimal' },
  { id: 'template-classic', name: 'Classic' },
  { id: 'template-corporate', name: 'Corporate' },
  { id: 'template-elegant', name: 'Elegant' },
  { id: 'template-creative', name: 'Creative' },
  { id: 'template-compact', name: 'Compact' },
  { id: 'template-tech', name: 'Tech' },
  { id: 'template-bold', name: 'Bold' },
  { id: 'template-clean', name: 'Clean' },
  { id: 'template-professional', name: 'Professional' },
  { id: 'template-ats', name: 'ATS-Friendly' },
];

let templateMode = localStorage.getItem(TEMPLATE_KEY) || templates[0].id;

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
        <strong>${item.role || ''}</strong>${item.company ? ` — ${item.company}` : ''}
        <div class="muted">${item.duration || ''}</div>
        <ul>${item.highlights.map((h) => `<li>${h}</li>`).join('')}</ul>
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

  preview.className = templateMode;

  preview.innerHTML = `
    <header class="resume-header">
      <h3>${data.fullName || 'Your Name'}</h3>
      <p>${data.title || 'Professional Title'}</p>
      <p class="muted">
        ${[data.email, data.phone, data.location, data.website].filter(Boolean).join(' • ') || 'Email • Phone • Location'}
      </p>
    </header>

    <section class="resume-section">
      <h4>Summary</h4>
      <p>${data.summary || 'Write a short summary to highlight your profile.'}</p>
    </section>

    <section class="resume-section">
      <h4>Skills</h4>
      ${
        skills.length
          ? `<div class="tag-list">${skills.map((s) => `<span class="tag">${s}</span>`).join('')}</div>`
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
          ? `<p><strong>${data.degree || ''}</strong><br/>${data.school || ''} ${data.eduYear ? `(${data.eduYear})` : ''}</p>`
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
    for (const [key, value] of Object.entries(parsed)) {
      if (form.elements[key]) form.elements[key].value = value;
    }
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
    } catch {
      alert('Invalid JSON file.');
    }
  };
  reader.readAsText(file);
}

function initializeTemplates() {
  templateSelect.innerHTML = templates.map((t) => `<option value="${t.id}">${t.name}</option>`).join('');
  templateSelect.value = templates.some((t) => t.id === templateMode) ? templateMode : templates[0].id;
  templateMode = templateSelect.value;
  templateCount.textContent = `${templates.length} templates available`;
}

function scoreResume(data) {
  let score = 0;
  const suggestions = [];

  if (data.fullName && data.title) score += 15;
  else suggestions.push('Add both full name and professional title.');

  if (data.email && data.phone) score += 15;
  else suggestions.push('Include both email and phone for recruiter contact readiness.');

  const summaryWords = (data.summary || '').trim().split(/\s+/).filter(Boolean).length;
  if (summaryWords >= 30 && summaryWords <= 90) score += 20;
  else suggestions.push('Keep summary between 30 and 90 words with measurable impact.');

  const skillsCount = (data.skills || '').split(',').map((s) => s.trim()).filter(Boolean).length;
  if (skillsCount >= 6) score += 15;
  else suggestions.push('Add at least 6 targeted, role-specific skills.');

  const highlightsCount = [1, 2, 3].reduce((acc, n) => acc + normalizeHighlights(data[`expHighlights${n}`]).length, 0);
  if (highlightsCount >= 4) score += 20;
  else suggestions.push('Add 4+ achievement-based experience bullets with numbers/results.');

  if (data.degree && data.school) score += 15;
  else suggestions.push('Complete education section with degree and school name.');

  const level = score >= 85 ? 'Excellent' : score >= 70 ? 'Strong' : score >= 50 ? 'Good but improvable' : 'Needs major improvement';
  return { score, level, suggestions };
}

function rewriteSummary(summary, title) {
  const clean = (summary || '').trim();
  if (!clean) {
    return `Results-driven ${title || 'professional'} with proven experience delivering measurable business impact, optimizing processes, and collaborating cross-functionally to execute high-quality outcomes.`;
  }

  const sentence = clean.endsWith('.') ? clean.slice(0, -1) : clean;
  return `Results-driven ${title || 'professional'} with strong ownership and delivery focus. ${sentence}. Demonstrated ability to improve performance, efficiency, and customer outcomes through strategic execution and collaboration.`;
}

function rewriteHighlights(text) {
  const bullets = normalizeHighlights(text);
  if (!bullets.length) {
    return 'Led high-impact initiatives that improved delivery speed and quality by measurable margins; Collaborated across teams to ship customer-centric features with strong reliability';
  }

  return bullets
    .map((b) => {
      if (/\d/.test(b)) return b;
      return `Drove ${b.charAt(0).toLowerCase() + b.slice(1)} with measurable business impact and improved team efficiency`; 
    })
    .join('; ');
}

function renderAiFeedback(content) {
  aiFeedback.innerHTML = content;
}

form.addEventListener('input', update);
clearBtn.addEventListener('click', () => {
  form.reset();
  localStorage.removeItem(STORAGE_KEY);
  renderAiFeedback('');
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

analyzeResumeBtn.addEventListener('click', () => {
  const data = getFormData();
  const report = scoreResume(data);
  renderAiFeedback(`
    <strong>Resume Quality Score: ${report.score}/100 (${report.level})</strong>
    <ul>${report.suggestions.map((s) => `<li>${s}</li>`).join('') || '<li>Great job. Your resume is already very strong.</li>'}</ul>
  `);
});

improveSummaryBtn.addEventListener('click', () => {
  const current = form.elements.summary.value;
  form.elements.summary.value = rewriteSummary(current, form.elements.title.value);
  update();
  renderAiFeedback('<strong>Summary improved:</strong> Professional language and impact-oriented framing applied.');
});

improveHighlightsBtn.addEventListener('click', () => {
  [1, 2, 3].forEach((n) => {
    const key = `expHighlights${n}`;
    form.elements[key].value = rewriteHighlights(form.elements[key].value);
  });
  update();
  renderAiFeedback('<strong>Highlights improved:</strong> Achievement-focused wording generated for all experience blocks.');
});

syncFromStorage();
initializeTemplates();
update();
