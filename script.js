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

const STORAGE_KEY = 'resumeforge-data-v3';
const TEMPLATE_KEY = 'resumeforge-template-v3';

const templates = [
  { id: 'template-mary', name: 'Elegant Sidebar (Mary)' },
  { id: 'template-dark-sidebar', name: 'Dark Sidebar (Mike)' },
  { id: 'template-blue-graphic', name: 'Blue Graphic' },
  { id: 'template-recruiter', name: 'Recruiter Minimal' },
  { id: 'template-simple-classic', name: 'Simple Classic' },
  { id: 'template-academic', name: 'Academic Pro' },
  { id: 'template-modern', name: 'Modern' },
  { id: 'template-minimal', name: 'Minimal' },
  { id: 'template-corporate', name: 'Corporate' },
  { id: 'template-tech', name: 'Tech' },
  { id: 'template-ats', name: 'ATS Friendly' },
  { id: 'template-elegant', name: 'Elegant Clean' },
];

let templateMode = localStorage.getItem(TEMPLATE_KEY) || templates[0].id;

const list = (value) => (value || '').split(',').map((x) => x.trim()).filter(Boolean);
const highlights = (v) => (v || '').split(/\n|;|•/).map((x) => x.trim()).filter(Boolean);

function getData() {
  return Object.fromEntries(new FormData(form).entries());
}

function experiences(d) {
  return [1, 2, 3]
    .map((n) => ({
      role: d[`expRole${n}`], company: d[`expCompany${n}`], location: d[`expLocation${n}`], duration: d[`expDuration${n}`], bullets: highlights(d[`expHighlights${n}`]),
    }))
    .filter((x) => x.role || x.company || x.duration || x.bullets.length);
}

function expHtml(d) {
  const items = experiences(d);
  if (!items.length) return '<p class="r-muted">Add experience entries.</p>';
  return items.map((x) => `
    <div class="r-item">
      <strong>${x.role || ''}</strong> ${x.company ? `| ${x.company}` : ''}
      <div class="r-muted">${[x.location, x.duration].filter(Boolean).join(' | ')}</div>
      <ul class="r-bullets">${x.bullets.map((b) => `<li>${b}</li>`).join('')}</ul>
    </div>`).join('');
}

function section(title, body) {
  return `<section class="r-section"><h4>${title}</h4>${body}</section>`;
}

function contactBlock(d) {
  return [d.phone, d.email, d.linkedin, d.website, d.location].filter(Boolean).map((x) => `<div>${x}</div>`).join('');
}

function defaultTemplate(d) {
  return `<div class="r-page ${templateMode}">
    <h2 class="r-name">${d.fullName || 'Your Name'}</h2>
    <div class="r-title">${d.title || 'Professional Title'}</div>
    <div class="r-contact r-muted">${contactBlock(d) || 'Phone • Email • Location'}</div>
    ${section('Summary', `<p>${d.summary || 'Professional profile summary goes here.'}</p>`) }
    ${section('Experience', expHtml(d))}
    ${section('Education', `<p>${d.education1 || ''}</p><p>${d.education2 || ''}</p>`) }
    ${section('Skills', `<div class="r-tags">${list(d.skills).map((s) => `<span class="r-tag">${s}</span>`).join('')}</div>`) }
    ${section('Technical Skills', `<div class="r-tags">${list(d.technicalSkills).map((s) => `<span class="r-tag">${s}</span>`).join('')}</div>`) }
  </div>`;
}

function renderTemplate(d) {
  const photo = d.photoUrl ? `<img class="r-avatar" src="${d.photoUrl}" alt="profile" onerror="this.style.display='none'" />` : '<div class="r-avatar"></div>';
  if (templateMode === 'template-mary') {
    return `<div class="r-page template-mary"><div class="r-top"><div><h2 class="r-name">${d.fullName || 'MARY ROBERTSON'}</h2><div class="r-title">${d.title || 'Professional Position'}</div></div>${photo}</div><div class="r-divider"></div><div class="r-main"><aside class="r-left">${section('Contact', contactBlock(d))}${section('Education', `<p>${d.education1 || ''}</p><p>${d.education2 || ''}</p>`)}${section('Skills', `<p>${list(d.skills).join('<br/>')}</p>`)}</aside><div>${section('Profile', `<p>${d.summary || ''}</p>`)}${section('Work Experience', expHtml(d))}${section('Certifications', `<p>${d.certifications || ''}</p>`)}</div></div></div>`;
  }
  if (templateMode === 'template-dark-sidebar') {
    return `<div class="r-page template-dark-sidebar"><div class="r-main"><aside class="r-left">${photo}${section('Contact', contactBlock(d))}${section('Education', `<p>${d.education1 || ''}</p><p>${d.education2 || ''}</p>`)}${section('Skills', `<p>${list(d.skills).join('<br/>')}</p>`)}${section('Tech', `<p>${list(d.technicalSkills).join('<br/>')}</p>`)}</aside><div class="r-right"><h2 class="r-name">${d.fullName || ''}</h2><div class="r-title">${d.title || ''}</div>${section('Professional Profile', `<p>${d.summary || ''}</p>`)}${section('Work Experience', expHtml(d))}${section('References', `<p>${d.reference1 || ''}</p><p>${d.reference2 || ''}</p>`)}</div></div></div>`;
  }
  if (templateMode === 'template-blue-graphic') {
    return `<div class="r-page template-blue-graphic"><div class="r-main"><aside class="r-left">${photo}${section('Contact', contactBlock(d))}${section('Skills', `<p>${list(d.skills).join('<br/>')}</p>`)}${section('Hobbies', `<p>${list(d.hobbies).join(', ')}</p>`)}</aside><div class="r-right"><h2 class="r-name">${d.fullName || ''}</h2><div class="r-title">${d.title || ''}</div><div class="r-pill">ABOUT ME</div><p>${d.summary || ''}</p>${section('Education', `<p>${d.education1 || ''}</p><p>${d.education2 || ''}</p>`)}${section('Experience', expHtml(d))}</div></div></div>`;
  }
  if (templateMode === 'template-recruiter') {
    return `<div class="r-page template-recruiter"><h2 class="r-name">${d.fullName || ''}</h2><div class="r-contact r-muted">${[d.location, d.phone, d.email].filter(Boolean).join(' • ')}</div>${section('Professional Profile', `<p>${d.summary || ''}</p>`)}${section('Work Experience', expHtml(d))}${section('Education', `<p>${d.education1 || ''}</p><p>${d.education2 || ''}</p>`)}${section('Skills', `<p><strong>Professional:</strong> ${list(d.skills).join(', ')}</p><p><strong>Technical:</strong> ${list(d.technicalSkills).join(', ')}</p>`)}</div>`;
  }
  if (templateMode === 'template-simple-classic') {
    return `<div class="r-page template-simple-classic"><h1 class="r-name">${d.fullName || 'SIMPLE RESUME FORMAT'}</h1><div class="r-title">${d.title || ''}</div><div class="r-contact r-muted">${[d.location, d.phone, d.email].filter(Boolean).join(' | ')}</div>${section('Summary', `<p>${d.summary || ''}</p>`)}${section('Professional Experience', expHtml(d))}${section('Education', `<p>${d.education1 || ''}</p><p>${d.education2 || ''}</p>`)}${section('Additional Skills', `<p>${list(d.skills).join(', ')}</p><p>${list(d.languages).join(', ')}</p>`)}</div>`;
  }
  if (templateMode === 'template-academic') {
    return `<div class="r-page template-academic"><h2 class="r-name">${d.fullName || ''}</h2><div class="r-contact r-muted">${[d.phone,d.email,d.location].filter(Boolean).join(' | ')}</div>${section('Summary', `<p>${d.summary || ''}</p>`)}${section('Education', `<p>${d.education1 || ''}</p><p>${d.education2 || ''}</p>`)}${section('Experience', expHtml(d))}<div class="r-two-col">${section('Professional Skills', `<ul class="r-bullets">${list(d.skills).map((x) => `<li>${x}</li>`).join('')}</ul>`)}${section('Technical Skills', `<ul class="r-bullets">${list(d.technicalSkills).map((x) => `<li>${x}</li>`).join('')}</ul>`)}</div></div>`;
  }
  return defaultTemplate(d);
}

function update() {
  const d = getData();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(d));
  preview.innerHTML = renderTemplate(d);
}

function sync() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return;
  try {
    const data = JSON.parse(saved);
    Object.entries(data).forEach(([k, v]) => { if (form.elements[k]) form.elements[k].value = v; });
  } catch { localStorage.removeItem(STORAGE_KEY); }
}

function initTemplates() {
  templateSelect.innerHTML = templates.map((t) => `<option value="${t.id}">${t.name}</option>`).join('');
  if (!templates.some((t) => t.id === templateMode)) templateMode = templates[0].id;
  templateSelect.value = templateMode;
  templateCount.textContent = `${templates.length} templates`;
}

function score(d) {
  let s = 0; const tips = [];
  if (d.fullName && d.title) s += 15; else tips.push('Add full name and clear professional title.');
  if (d.email && d.phone && d.location) s += 20; else tips.push('Complete contact details (email, phone, location).');
  if ((d.summary || '').split(/\s+/).filter(Boolean).length >= 25) s += 20; else tips.push('Write a stronger 25+ word summary.');
  if (list(d.skills).length >= 6) s += 15; else tips.push('Add at least 6 professional skills.');
  if (list(d.technicalSkills).length >= 5) s += 10; else tips.push('Add at least 5 technical skills.');
  if (experiences(d).length >= 2) s += 20; else tips.push('Add at least 2 work experience entries with bullet achievements.');
  return { s, tips };
}

function improveSummary(text, title) {
  if (!text.trim()) return `Results-driven ${title || 'professional'} delivering measurable outcomes, cross-functional collaboration, and customer-focused solutions with strong ownership and execution.`;
  return `Results-driven ${title || 'professional'} with proven ability to deliver measurable outcomes, optimize processes, and collaborate across teams. ${text.trim()}`;
}

function improveExp(text) {
  const b = highlights(text);
  if (!b.length) return 'Led high-impact initiatives that improved KPIs by measurable margins; Collaborated cross-functionally to deliver quality outcomes on schedule';
  return b.map((x) => (/\d/.test(x) ? x : `Improved ${x.toLowerCase()} with measurable impact and stronger delivery efficiency`)).join('; ');
}

form.addEventListener('input', update);
clearBtn.addEventListener('click', () => { form.reset(); localStorage.removeItem(STORAGE_KEY); aiFeedback.innerHTML = ''; update(); });
printBtn.addEventListener('click', () => window.print());
downloadJsonBtn.addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(getData(), null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'resume-data.json'; a.click(); URL.revokeObjectURL(url);
});
uploadJsonInput.addEventListener('change', (e) => {
  const [file] = e.target.files; if (!file) return;
  const reader = new FileReader();
  reader.onload = () => { try { const p = JSON.parse(reader.result); Object.entries(p).forEach(([k,v]) => { if (form.elements[k]) form.elements[k].value = v; }); update(); } catch { alert('Invalid JSON'); } };
  reader.readAsText(file);
});
templateSelect.addEventListener('change', () => { templateMode = templateSelect.value; localStorage.setItem(TEMPLATE_KEY, templateMode); update(); });
analyzeResumeBtn.addEventListener('click', () => {
  const { s, tips } = score(getData());
  aiFeedback.innerHTML = `<strong>Score: ${s}/100</strong><ul>${tips.length ? tips.map((t) => `<li>${t}</li>`).join('') : '<li>Excellent resume quality.</li>'}</ul>`;
});
improveSummaryBtn.addEventListener('click', () => { form.elements.summary.value = improveSummary(form.elements.summary.value, form.elements.title.value); update(); aiFeedback.innerHTML = '<strong>Summary improved.</strong>'; });
improveHighlightsBtn.addEventListener('click', () => { [1,2,3].forEach((n) => { form.elements[`expHighlights${n}`].value = improveExp(form.elements[`expHighlights${n}`].value); }); update(); aiFeedback.innerHTML = '<strong>Highlights improved.</strong>'; });

sync();
initTemplates();
update();
