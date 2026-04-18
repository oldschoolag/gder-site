(function () {
  const entities = Array.isArray(window.GDER_ENTITIES) ? window.GDER_ENTITIES : [];

  const searchInput = document.querySelector('[data-entity-search]');
  const typeFilter = document.querySelector('[data-entity-type-filter]');
  const resultsCount = document.querySelector('[data-entity-count]');
  const list = document.querySelector('[data-entity-list]');
  const empty = document.querySelector('[data-entity-empty]');

  const statEntities = document.querySelector('[data-stat-entities]');
  const statJurisdictions = document.querySelector('[data-stat-jurisdictions]');
  const statTypes = document.querySelector('[data-stat-types]');
  const statConfidence = document.querySelector('[data-stat-confidence]');

  if (!searchInput || !typeFilter || !resultsCount || !list || !empty) return;

  const sortedEntities = [...entities].sort((a, b) => (a.name || '').localeCompare(b.name || ''));

  const uniqueValues = (key) => [...new Set(sortedEntities.map((entity) => entity[key]).filter(Boolean))];
  const entityTypes = uniqueValues('entityType').sort();
  const jurisdictions = uniqueValues('jurisdiction');
  const confidenceTiers = uniqueValues('confidenceTier');

  if (statEntities) statEntities.textContent = String(sortedEntities.length);
  if (statJurisdictions) statJurisdictions.textContent = String(jurisdictions.length);
  if (statTypes) statTypes.textContent = String(entityTypes.length);
  if (statConfidence) statConfidence.textContent = confidenceTiers.length === 1 ? confidenceTiers[0] : confidenceTiers.join(', ');

  for (const entityType of entityTypes) {
    const option = document.createElement('option');
    option.value = entityType;
    option.textContent = entityType;
    typeFilter.appendChild(option);
  }

  function matches(entity, term, selectedType) {
    const haystack = [
      entity.name,
      entity.legalName,
      entity.entityType,
      entity.jurisdiction,
      entity.formationCountry,
      entity.legalWrapperType,
      entity.status,
      entity.basis,
      entity.confidenceTier,
      entity.governanceAnchorType,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    const searchOk = !term || haystack.includes(term);
    const typeOk = !selectedType || entity.entityType === selectedType;
    return searchOk && typeOk;
  }

  function pill(value) {
    const span = document.createElement('span');
    span.className = 'entity-pill';
    span.textContent = value;
    return span;
  }

  function render(items) {
    list.innerHTML = '';
    resultsCount.textContent = `${items.length} ${items.length === 1 ? 'entity' : 'entities'}`;
    empty.hidden = items.length > 0;

    for (const entity of items) {
      const card = document.createElement('a');
      card.className = 'entity-card';
      card.href = entity.canonicalUrl;
      card.target = '_blank';
      card.rel = 'noreferrer';

      const head = document.createElement('div');
      head.className = 'entity-head';

      const titleWrap = document.createElement('div');
      const title = document.createElement('h3');
      title.className = 'entity-title';
      title.textContent = entity.name;
      titleWrap.appendChild(title);

      if (entity.legalName && entity.legalName !== entity.name) {
        const legal = document.createElement('p');
        legal.className = 'entity-legal';
        legal.textContent = entity.legalName;
        titleWrap.appendChild(legal);
      }

      const arrow = document.createElement('span');
      arrow.className = 'entity-arrow';
      arrow.textContent = '↗';

      head.appendChild(titleWrap);
      head.appendChild(arrow);

      const meta = document.createElement('div');
      meta.className = 'entity-meta';
      if (entity.entityType) meta.appendChild(pill(entity.entityType));
      if (entity.legalWrapperType) meta.appendChild(pill(entity.legalWrapperType));
      if (entity.jurisdiction) meta.appendChild(pill(entity.jurisdiction));
      if (entity.confidenceTier) meta.appendChild(pill(`${entity.confidenceTier} confidence`));

      const summary = document.createElement('p');
      summary.className = 'entity-summary';
      summary.textContent = entity.basis || 'No current basis summary attached.';

      card.appendChild(head);
      card.appendChild(meta);
      card.appendChild(summary);
      list.appendChild(card);
    }
  }

  function update() {
    const term = searchInput.value.trim().toLowerCase();
    const selectedType = typeFilter.value;
    const filtered = sortedEntities.filter((entity) => matches(entity, term, selectedType));
    render(filtered);
  }

  searchInput.addEventListener('input', update);
  typeFilter.addEventListener('change', update);
  render(sortedEntities);
})();
