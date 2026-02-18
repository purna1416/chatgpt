# ResumeForge — Resume Maker Website

A complete resume maker website built from scratch with plain HTML, CSS, and JavaScript.

## What is included

- Live resume builder form.
- Instant preview panel.
- Two visual templates (Modern and Minimal).
- Local autosave using `localStorage`.
- JSON import/export (save work and reload later).
- Print/PDF export with print-specific styles.
- Mobile responsive layout.

## Quick start

No build tools required.

```bash
python3 -m http.server 4173
```

Then open: `http://localhost:4173`

## Project structure

- `index.html` — app layout and form fields.
- `styles.css` — UI styles, templates, responsive + print styles.
- `script.js` — state handling, rendering, autosave, import/export.

## Step-by-step plan (from scratch to advanced)

### Phase 1 — Foundation
1. Define user personas: fresher, experienced candidate, freelancer.
2. Finalize MVP sections: Personal info, Summary, Skills, Experience, Education.
3. Build static wireframe for editor + preview.
4. Implement base CSS tokens (colors, spacing, typography).

### Phase 2 — Core functionality
1. Build form model and event listeners.
2. Render preview dynamically from form state.
3. Add list-like handling for experience bullets.
4. Add validation for required fields (name, email).

### Phase 3 — Better UX
1. Add autosave and restore with `localStorage`.
2. Add clear/reset button.
3. Add two resume templates and one-click switch.
4. Make it fully responsive for tablets/mobile.

### Phase 4 — Export and portability
1. Add print stylesheet to generate clean PDF output.
2. Add JSON export for backup.
3. Add JSON import for restoring or sharing profiles.
4. Add optional section toggles (show/hide empty sections).

### Phase 5 — Advanced level upgrades
1. **Template marketplace**: multiple professional templates.
2. **Drag-and-drop section reorder**.
3. **Rich text editor** for summary/highlights.
4. **AI suggestions** for bullet points and summaries.
5. **Multi-language resumes** and localization.
6. **ATS optimization checks** (keyword density + formatting hints).
7. **Auth + cloud storage** (save multiple resumes in account).
8. **Shareable links** + permission controls.
9. **Version history** and rollback.
10. **Role-specific keyword packs** (e.g., SDE, Designer, PM).

### Phase 6 — Production architecture (recommended)

When scaling beyond static files:

- Frontend: React + TypeScript + Tailwind.
- Backend: Node.js/NestJS or Next.js server routes.
- DB: PostgreSQL.
- Auth: Clerk/Auth0/Supabase Auth.
- Storage: S3-compatible for exports/templates.
- PDF generation: Puppeteer or server-side rendering pipeline.
- Search/indexing for templates and skills.
- Monitoring: Sentry + analytics.

### Phase 7 — Quality, security, and deployment
1. Unit tests (renderer and utilities).
2. E2E tests for import/export/print flow.
3. Input sanitization and XSS prevention.
4. Rate limiting for AI endpoints.
5. Deploy to Vercel/Netlify + CI pipeline.
6. Observability dashboards and error alerting.

## Future enhancement checklist

- [ ] Add Certifications, Projects, Languages sections.
- [ ] Add reorderable blocks.
- [ ] Add theme customization panel.
- [ ] Add login + cloud profile sync.
- [ ] Add AI-powered “Improve bullet” button.

---

If you want, this can be upgraded next into a full React + backend SaaS architecture while keeping the same UX and data format.
