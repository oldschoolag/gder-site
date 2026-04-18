(function () {
  const entities = Array.isArray(window.GDER_ENTITIES) ? window.GDER_ENTITIES : [];

  const searchInput = document.querySelector('[data-entity-search]');
  const typeFilter = document.querySelector('[data-entity-type-filter]');
  const resultsCount = document.querySelector('[data-entity-count]');
  const list = document.querySelector('[data-entity-list]');
  const empty = document.querySelector('[data-entity-empty]');
  const featuredList = document.querySelector('[data-featured-list]');

  const statEntities = document.querySelector('[data-stat-entities]');
  const statJurisdictions = document.querySelector('[data-stat-jurisdictions]');
  const statTypes = document.querySelector('[data-stat-types]');
  const statAnchorTypes = document.querySelector('[data-stat-anchor-types]');

  if (!searchInput || !typeFilter || !resultsCount || !list || !empty) return;

  const sortedEntities = [...entities].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  const uniqueValues = (key) => [...new Set(sortedEntities.map((entity) => entity[key]).filter(Boolean))];

  const entityTypes = uniqueValues('entityType').sort();
  const jurisdictions = uniqueValues('jurisdiction');
  const anchorTypes = uniqueValues('governanceAnchorType');

  if (statEntities) statEntities.textContent = String(sortedEntities.length);
  if (statJurisdictions) statJurisdictions.textContent = String(jurisdictions.length);
  if (statTypes) statTypes.textContent = String(entityTypes.length);
  if (statAnchorTypes) statAnchorTypes.textContent = String(anchorTypes.length);

  for (const entityType of entityTypes) {
    const option = document.createElement('option');
    option.value = entityType;
    option.textContent = entityType;
    typeFilter.appendChild(option);
  }

  const featuredIds = [
    'dao-arbitrum-foundation',
    'dao-ens-foundation-limited',
    'dao-uniswap-foundation',
  ];

  const featuredEntities = featuredIds
    .map((id) => sortedEntities.find((entity) => entity.id === id))
    .filter(Boolean);

  if (featuredList) {
    const fallback = featuredEntities.length ? featuredEntities : sortedEntities.slice(0, 3);

    for (const entity of fallback) {
      const card = document.createElement('article');
      card.className = 'featured-card';

      const topline = document.createElement('div');
      topline.className = 'featured-card-topline';

      const label = document.createElement('span');
      label.className = 'featured-card-label';
      label.textContent = entity.entityType || 'entity';

      const link = document.createElement('a');
      link.className = 'featured-card-link';
      link.href = entity.canonicalUrl;
      link.target = '_blank';
      link.rel = 'noreferrer';
      link.textContent = 'Official source ↗';

      topline.appendChild(label);
      topline.appendChild(link);

      const title = document.createElement('h3');
      title.textContent = entity.name;

      const meta = document.createElement('p');
      meta.className = 'featured-card-meta';
      meta.textContent = [entity.jurisdiction, entity.legalWrapperType].filter(Boolean).join(' • ');

      const summary = document.createElement('p');
      summary.textContent = entity.basis || 'No summary attached.';

      card.appendChild(topline);
      card.appendChild(title);
      if (meta.textContent) card.appendChild(meta);
      card.appendChild(summary);
      featuredList.appendChild(card);
    }
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
      const row = document.createElement('a');
      row.className = 'entity-card';
      row.href = entity.canonicalUrl;
      row.target = '_blank';
      row.rel = 'noreferrer';

      const main = document.createElement('div');
      main.className = 'entity-main';

      const title = document.createElement('h3');
      title.className = 'entity-title';
      title.textContent = entity.name;
      main.appendChild(title);

      if (entity.legalName && entity.legalName !== entity.name) {
        const legal = document.createElement('p');
        legal.className = 'entity-legal';
        legal.textContent = entity.legalName;
        main.appendChild(legal);
      }

      const meta = document.createElement('div');
      meta.className = 'entity-meta';
      if (entity.entityType) meta.appendChild(pill(entity.entityType));
      if (entity.legalWrapperType) meta.appendChild(pill(entity.legalWrapperType));
      if (entity.jurisdiction) meta.appendChild(pill(entity.jurisdiction));

      main.appendChild(meta);

      const summary = document.createElement('p');
      summary.className = 'entity-summary';
      summary.textContent = entity.basis || 'No current basis summary attached.';

      const link = document.createElement('div');
      link.className = 'entity-link';
      link.textContent = 'Official source ↗';

      row.appendChild(main);
      row.appendChild(summary);
      row.appendChild(link);
      list.appendChild(row);
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
