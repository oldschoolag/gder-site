(function () {
  const entities = Array.isArray(window.GDER_ENTITIES) ? window.GDER_ENTITIES : [];
  const searchInput = document.querySelector('[data-entity-search]');
  const typeFilter = document.querySelector('[data-entity-type-filter]');
  const resultsCount = document.querySelector('[data-entity-count]');
  const list = document.querySelector('[data-entity-list]');
  const empty = document.querySelector('[data-entity-empty]');

  if (!searchInput || !typeFilter || !resultsCount || !list || !empty) return;

  const entityTypes = [...new Set(entities.map((entity) => entity.entityType).filter(Boolean))].sort();

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

  function createMetaPill(label, value) {
    const pill = document.createElement('span');
    pill.className = 'entity-pill';
    pill.textContent = `${label}: ${value}`;
    return pill;
  }

  function render(items) {
    list.innerHTML = '';
    resultsCount.textContent = `${items.length} researched ${items.length === 1 ? 'entity' : 'entities'}`;
    empty.hidden = items.length > 0;

    for (const entity of items) {
      const article = document.createElement('article');
      article.className = 'entity-card';

      const head = document.createElement('div');
      head.className = 'entity-card-head';

      const titleWrap = document.createElement('div');

      const title = document.createElement('h3');
      title.textContent = entity.name;
      titleWrap.appendChild(title);

      if (entity.legalName && entity.legalName !== entity.name) {
        const legal = document.createElement('p');
        legal.className = 'entity-legal-name';
        legal.textContent = entity.legalName;
        titleWrap.appendChild(legal);
      }

      head.appendChild(titleWrap);

      if (entity.canonicalUrl) {
        const link = document.createElement('a');
        link.className = 'entity-link';
        link.href = entity.canonicalUrl;
        link.target = '_blank';
        link.rel = 'noreferrer';
        link.textContent = 'Official site';
        head.appendChild(link);
      }

      const meta = document.createElement('div');
      meta.className = 'entity-meta';

      if (entity.entityType) meta.appendChild(createMetaPill('Type', entity.entityType));
      if (entity.legalWrapperType) meta.appendChild(createMetaPill('Wrapper', entity.legalWrapperType));
      if (entity.jurisdiction) meta.appendChild(createMetaPill('Jurisdiction', entity.jurisdiction));
      if (entity.confidenceTier) meta.appendChild(createMetaPill('Confidence', entity.confidenceTier));

      const basis = document.createElement('p');
      basis.className = 'entity-basis';
      basis.textContent = entity.basis || 'No current summary attached.';

      article.appendChild(head);
      article.appendChild(meta);
      article.appendChild(basis);
      list.appendChild(article);
    }
  }

  function update() {
    const term = searchInput.value.trim().toLowerCase();
    const selectedType = typeFilter.value;
    const items = entities.filter((entity) => matches(entity, term, selectedType));
    render(items);
  }

  searchInput.addEventListener('input', update);
  typeFilter.addEventListener('change', update);
  render(entities);
})();
