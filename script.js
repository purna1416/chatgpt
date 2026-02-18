const form = document.getElementById('resumeForm');
const preview = document.getElementById('resumePreview');
const clearBtn = document.getElementById('clearAll');
const printBtn = document.getElementById('printResume');
const downloadJsonBtn = document.getElementById('downloadJson');
const uploadJsonInput = document.getElementById('uploadJson');
const templateToggleBtn = document.getElementById('templateToggle');

const STORAGE_KEY = 'resumeforge-data-v1';
const TEMPLATE_KEY = 'resumeforge-template-v1';
let templateMode = localStorage.getItem(TEMPLATE_KEY) || 'modern';

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

  if (!items.length) {
    return '<p class="muted">Add your work experience.</p>';
  }

  return items
    .map(
      (item) => `
      <div class="exp-item">
        <strong>${item.role || ''}</strong>${item.company ? ` — ${item.company}` : ''}
        <div class="muted">${item.duration || ''}</div>
        <ul>
          ${item.highlights.map((h) => `<li>${h}</li>`).join('')}
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

  preview.className = templateMode === 'modern' ? 'template-modern' : 'template-minimal';

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

form.addEventListener('input', update);
clearBtn.addEventListener('click', () => {
  form.reset();
  localStorage.removeItem(STORAGE_KEY);
  update();
});

printBtn.addEventListener('click', () => window.print());
downloadJsonBtn.addEventListener('click', downloadJson);
uploadJsonInput.addEventListener('change', (e) => {
  const [file] = e.target.files;
  if (file) uploadJson(file);
});

templateToggleBtn.addEventListener('click', () => {
  templateMode = templateMode === 'modern' ? 'minimal' : 'modern';
  localStorage.setItem(TEMPLATE_KEY, templateMode);
  update();
});

syncFromStorage();
update();
