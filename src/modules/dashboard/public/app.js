const API_KEY_STORAGE = 'llf_dashboard_api_key';

function getApiKey() {
  return localStorage.getItem(API_KEY_STORAGE) || '';
}

function setStatus(message) {
  document.getElementById('status-line').textContent = message;
}

async function apiFetch(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': getApiKey(),
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    let message = `Erreur ${response.status}`;
    try {
      const body = await response.json();
      message = body.error || message;
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  return response;
}

function scoreClass(score) {
  if (score >= 70) return 'score-hot';
  if (score >= 40) return 'score-warm';
  return 'score-cold';
}

function buildFilterQuery() {
  const params = new URLSearchParams();
  const search = document.getElementById('filter-search').value.trim();
  const city = document.getElementById('filter-city').value.trim();
  const sector = document.getElementById('filter-sector').value.trim();
  const status = document.getElementById('filter-status').value;
  const minScore = document.getElementById('filter-min-score').value;

  if (search) params.set('search', search);
  if (city) params.set('city', city);
  if (sector) params.set('sector', sector);
  if (status) params.set('status', status);
  if (minScore) params.set('minScore', minScore);

  return params.toString();
}

function renderRow(prospect) {
  const tr = document.createElement('tr');

  tr.innerHTML = `
    <td>${escapeHtml(prospect.companyName)}</td>
    <td>${escapeHtml(prospect.city || '-')}</td>
    <td>${escapeHtml(prospect.sector || '-')}</td>
    <td><span class="score-badge ${scoreClass(prospect.score)}">${prospect.score}</span></td>
    <td>${escapeHtml(prospect.status)}</td>
    <td>${escapeHtml(truncate(prospect.description || prospect.scoreReason || '', 120))}</td>
    <td class="actions"></td>
  `;

  const actionsCell = tr.querySelector('.actions');

  const detailBtn = makeButton('Details', 'secondary', () => showDetail(prospect.id));
  actionsCell.appendChild(detailBtn);

  if (prospect.status === 'pending_validation' || prospect.status === 'new') {
    actionsCell.appendChild(makeButton('Valider', '', () => act(prospect.id, 'validate')));
    actionsCell.appendChild(makeButton('Refuser', 'danger', () => act(prospect.id, 'reject')));
  }
  if (prospect.status === 'validated') {
    actionsCell.appendChild(makeButton('Generer message', 'secondary', () => act(prospect.id, 'generate-message')));
  }
  if (prospect.status === 'message_generated') {
    actionsCell.appendChild(makeButton('Envoyer', '', () => promptSend(prospect)));
  }

  return tr;
}

function makeButton(label, className, onClick) {
  const btn = document.createElement('button');
  btn.textContent = label;
  if (className) btn.className = className;
  btn.addEventListener('click', onClick);
  return btn;
}

function escapeHtml(value) {
  const div = document.createElement('div');
  div.textContent = value;
  return div.innerHTML;
}

function truncate(value, length) {
  return value.length > length ? `${value.slice(0, length)}...` : value;
}

async function loadProspects() {
  setStatus('Chargement...');
  try {
    const query = buildFilterQuery();
    const response = await apiFetch(`/api/prospects${query ? `?${query}` : ''}`);
    const data = await response.json();
    const tbody = document.getElementById('prospects-body');
    tbody.innerHTML = '';
    data.items.forEach((p) => tbody.appendChild(renderRow(p)));
    setStatus(`${data.total} prospect(s)`);
  } catch (error) {
    setStatus(`Erreur : ${error.message}`);
  }
}

async function act(id, action) {
  try {
    await apiFetch(`/api/prospects/${id}/${action}`, { method: 'POST', body: '{}' });
    await loadProspects();
  } catch (error) {
    setStatus(`Erreur : ${error.message}`);
  }
}

async function promptSend(prospect) {
  const channel = window.prompt('Canal (email, whatsapp, contact_form) :', prospect.email ? 'email' : 'whatsapp');
  if (!channel) return;

  let whatsappConsentConfirmed = false;
  if (channel === 'whatsapp') {
    whatsappConsentConfirmed = window.confirm(
      'Confirmez-vous que ce prospect a explicitement consenti a etre contacte par WhatsApp ?',
    );
    if (!whatsappConsentConfirmed) {
      setStatus('Envoi WhatsApp annule : consentement non confirme.');
      return;
    }
  }

  try {
    await apiFetch(`/api/prospects/${prospect.id}/send`, {
      method: 'POST',
      body: JSON.stringify({ channel, whatsappConsentConfirmed }),
    });
    setStatus('Message envoye.');
    await loadProspects();
  } catch (error) {
    setStatus(`Erreur : ${error.message}`);
  }
}

async function showDetail(id) {
  try {
    const response = await apiFetch(`/api/prospects/${id}`);
    const p = await response.json();
    document.getElementById('detail-content').innerHTML = `
      <h2>${escapeHtml(p.companyName)}</h2>
      <p><strong>Score :</strong> ${p.score}/100 - ${escapeHtml(p.scoreReason || '')}</p>
      <p><strong>Ville / Secteur :</strong> ${escapeHtml(p.city || '-')} / ${escapeHtml(p.sector || '-')}</p>
      <p><strong>Adresse :</strong> ${escapeHtml(p.address || '-')}</p>
      <p><strong>Telephone :</strong> ${escapeHtml(p.phone || '-')} | <strong>Email :</strong> ${escapeHtml(p.email || '-')}</p>
      <p><strong>Site web :</strong> ${escapeHtml(p.website || '-')}</p>
      <p><strong>Description :</strong> ${escapeHtml(p.description || '-')}</p>
      <p><strong>Besoins probables :</strong> ${escapeHtml((p.probableNeeds || []).join(', ') || '-')}</p>
      <p><strong>Logiciel actuel :</strong> ${escapeHtml(p.currentSoftware || '-')}</p>
      <p><strong>Potentiel :</strong> ${escapeHtml(p.commercialPotential)} | <strong>Urgence :</strong> ${escapeHtml(p.urgency)}</p>
      <p><strong>Statut :</strong> ${escapeHtml(p.status)}</p>
      ${p.generatedMessage ? `<p><strong>Message genere :</strong><br />${escapeHtml(p.generatedMessage).replace(/\n/g, '<br />')}</p>` : ''}
    `;
    document.getElementById('detail-modal').classList.remove('hidden');
  } catch (error) {
    setStatus(`Erreur : ${error.message}`);
  }
}

async function exportProspects(format) {
  try {
    const response = await apiFetch(`/api/prospects/export/${format}`);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prospects.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    setStatus(`Erreur export : ${error.message}`);
  }
}

document.getElementById('save-api-key').addEventListener('click', () => {
  const value = document.getElementById('api-key').value.trim();
  if (value) {
    localStorage.setItem(API_KEY_STORAGE, value);
    setStatus('Cle API enregistree.');
    loadProspects();
  }
});

document.getElementById('apply-filters').addEventListener('click', loadProspects);
document.getElementById('close-modal').addEventListener('click', () => {
  document.getElementById('detail-modal').classList.add('hidden');
});

document.querySelectorAll('[data-export]').forEach((btn) => {
  btn.addEventListener('click', () => exportProspects(btn.dataset.export));
});

document.getElementById('trigger-run').addEventListener('click', async () => {
  setStatus('Lancement du run de prospection (peut prendre plusieurs minutes)...');
  try {
    await apiFetch('/api/prospecting/run', { method: 'POST', body: JSON.stringify({ triggeredBy: 'dashboard' }) });
    setStatus('Run termine.');
    await loadProspects();
  } catch (error) {
    setStatus(`Erreur : ${error.message}`);
  }
});

document.getElementById('api-key').value = getApiKey();
if (getApiKey()) loadProspects();
