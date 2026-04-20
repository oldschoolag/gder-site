(function () {
  const entities = Array.isArray(window.GDER_ENTITIES) ? window.GDER_ENTITIES : [];

  function slugify(value) {
    return String(value || '')
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function entityPath(entity) {
    return `/${slugify(entity.name)}/`;
  }

  function byName(a, b) {
    return (a.name || '').localeCompare(b.name || '');
  }

  function setupAutocomplete() {
    const root = document.querySelector('[data-autocomplete-root]');
    const input = document.querySelector('[data-search-input]');
    const suggestions = document.querySelector('[data-search-suggestions]');

    if (!root || !input || !suggestions) return;

    const sortedEntities = [...entities].sort(byName);
    let activeMatches = [];

    function clearSuggestions() {
      suggestions.innerHTML = '';
      suggestions.hidden = true;
      activeMatches = [];
    }

    function goToEntity(entity) {
      if (!entity) return;
      window.location.href = entityPath(entity);
    }

    function renderSuggestions(matches) {
      suggestions.innerHTML = '';
      activeMatches = matches;

      if (!matches.length) {
        clearSuggestions();
        return;
      }

      const list = document.createElement('div');
      list.className = 'suggestion-list';

      for (const entity of matches.slice(0, 8)) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'suggestion-item';

        const name = document.createElement('strong');
        name.textContent = entity.name;

        const meta = document.createElement('span');
        const wrapper = entity.legalWrapperType || 'Wrapper pending';
        const jurisdiction = entity.jurisdiction || 'Jurisdiction pending';
        meta.textContent = `${wrapper} · ${jurisdiction}`;

        button.appendChild(name);
        button.appendChild(meta);
        button.addEventListener('click', function () {
          goToEntity(entity);
        });

        list.appendChild(button);
      }

      suggestions.appendChild(list);
      suggestions.hidden = false;
    }

    function updateSuggestions() {
      const value = input.value.trim().toLowerCase();
      if (!value) {
        clearSuggestions();
        return;
      }

      const startsWith = [];
      const includes = [];

      for (const entity of sortedEntities) {
        const name = (entity.name || '').toLowerCase();
        const legal = (entity.legalName || '').toLowerCase();
        if (name.startsWith(value) || legal.startsWith(value)) {
          startsWith.push(entity);
        } else if (name.includes(value) || legal.includes(value)) {
          includes.push(entity);
        }
      }

      renderSuggestions(startsWith.concat(includes));
    }

    input.addEventListener('input', updateSuggestions);

    input.addEventListener('keydown', function (event) {
      if (event.key !== 'Enter') return;
      event.preventDefault();

      const value = input.value.trim().toLowerCase();
      if (!value) return;

      const exact = activeMatches.find(function (entity) {
        return (entity.name || '').toLowerCase() === value || (entity.legalName || '').toLowerCase() === value;
      });

      if (exact) {
        goToEntity(exact);
        return;
      }

      if (activeMatches.length === 1) {
        goToEntity(activeMatches[0]);
      }
    });

    document.addEventListener('click', function (event) {
      if (!root.contains(event.target)) {
        clearSuggestions();
      }
    });
  }

  function setupListingForm() {
    const form = document.querySelector('[data-listing-form]');
    if (!form) return;

    const title = document.querySelector('[data-listing-title]');
    const intro = document.querySelector('[data-listing-intro]');
    const entityNameInput = document.querySelector('[data-field-entity-name]');
    const hiddenMode = document.querySelector('[data-field-mode]');
    const hiddenEntity = document.querySelector('[data-field-entity-slug]');

    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode');
    const slug = params.get('entity');

    if (mode === 'edit' && slug) {
      const entity = entities.find(function (item) {
        return slugify(item.name) === slug;
      });

      if (entity) {
        if (title) title.textContent = 'Request edit';
        if (intro) {
          intro.textContent = 'Submit the updated information and use an official email address connected to the entity.';
        }
        if (entityNameInput) entityNameInput.value = entity.name;
        if (hiddenMode) hiddenMode.value = 'edit';
        if (hiddenEntity) hiddenEntity.value = slug;
      }
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();

      const formData = new FormData(form);
      const modeValue = formData.get('mode') || 'new';
      const entityValue = formData.get('entityName') || 'Entity';
      const subjectPrefix = modeValue === 'edit' ? 'GDER edit request' : 'GDER listing request';
      const subject = `${subjectPrefix}: ${entityValue}`;

      const lines = [
        `Request type: ${modeValue}`,
        `Entity name: ${formData.get('entityName') || ''}`,
        `Legal name: ${formData.get('legalName') || ''}`,
        `Entity type: ${formData.get('entityType') || ''}`,
        `Documented wrapper: ${formData.get('legalWrapperType') || ''}`,
        `Jurisdiction: ${formData.get('jurisdiction') || ''}`,
        `Governance: ${formData.get('governance') || ''}`,
        `Operating control: ${formData.get('operatingControl') || ''}`,
        `Official website: ${formData.get('officialWebsite') || ''}`,
        `Supporting evidence / sources: ${formData.get('evidenceLinks') || ''}`,
        `Representative name: ${formData.get('representativeName') || ''}`,
        `Representative role: ${formData.get('representativeRole') || ''}`,
        `Official entity email: ${formData.get('officialEmail') || ''}`,
        `Additional notes: ${formData.get('notes') || ''}`,
      ];

      const mailto = `mailto:hello@gder.net?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;
      window.location.href = mailto;
    });
  }

  setupAutocomplete();
  setupListingForm();
})();
