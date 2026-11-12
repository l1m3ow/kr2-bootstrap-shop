'use strict';

/* Новые сценарии отделены от базовых поиска, форм и Bootstrap-компонентов. */
(() => {
  const programs = window.STUDIO_DATA.services;
  const find = (id) => programs.find((item) => item.id === id);
  const money = (value) => new Intl.NumberFormat('ru-RU').format(value) + ' ₽';
  const escape = (value) => String(value).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;'
  }[c]));
  const cleanIds = (value, limit = programs.length) => Array.isArray(value)
    ? [...new Set(value.filter((id) => typeof id === 'string' && find(id)))].slice(0, limit) : [];
  const readIds = (key, limit) => {
    try { return cleanIds(JSON.parse(localStorage.getItem(key) || '[]'), limit); }
    catch { return []; }
  };
  let noticeTimer;
  const announce = (message) => {
    const box = document.getElementById('featureAnnouncement');
    clearTimeout(noticeTimer);
    box.textContent = message;
    box.classList.add('is-visible');
    noticeTimer = setTimeout(() => box.classList.remove('is-visible'), 4200);
  };
  let favorites = readIds('tiho:favorites:v1');
  let comparison = readIds('tiho:comparison:v1', 3);
  const persist = (key, value) => {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch { return false; }
  };
  const currentService = find(new URLSearchParams(location.search).get('service')) || programs[0];
  document.querySelectorAll('[data-detail-favorite]').forEach((button) => { button.dataset.favorite = currentService.id; });
  document.querySelectorAll('[data-detail-compare]').forEach((button) => { button.dataset.compare = currentService.id; });

  /* 1. Избранное: хранятся только идентификаторы услуг, не данные формы. */
  window.TIHO_PREFS = Object.freeze({ hasFavorite: (id) => favorites.includes(id) });
  const renderFavoriteButtons = () => {
    document.querySelectorAll('[data-favorite]').forEach((button) => {
      const service = find(button.dataset.favorite);
      const active = favorites.includes(service.id);
      button.setAttribute('aria-pressed', String(active));
      button.setAttribute('aria-label', `${active ? 'Убрать из избранного' : 'Добавить в избранное'}: ${service.name}`);
      button.textContent = active ? '♥ В избранном' : '♡ В избранное';
    });
    document.querySelectorAll('.favorite-count').forEach((el) => { el.textContent = favorites.length; });
    document.dispatchEvent(new Event('tiho:favorites-change'));
  };

  /* 2. Сравнение: выбор до трёх программ и таблица в Bootstrap Offcanvas. */
  const renderComparison = () => {
    document.querySelectorAll('[data-compare]').forEach((button) => {
      const service = find(button.dataset.compare);
      const active = comparison.includes(service.id);
      button.setAttribute('aria-pressed', String(active));
      button.setAttribute('aria-label', `${active ? 'Убрать из сравнения' : 'Добавить к сравнению'}: ${service.name}`);
      button.textContent = active ? '✓ В сравнении' : '＋ Сравнить';
    });
    document.getElementById('compareDock').hidden = comparison.length === 0;
    document.getElementById('compareCount').textContent = comparison.length;
    const container = document.getElementById('compareContent');
    document.getElementById('clearCompare').hidden = comparison.length === 0;
    if (!comparison.length) {
      container.innerHTML = '<p class="comparison-empty">Пока ничего не выбрано. Добавьте программы кнопкой «Сравнить» в карточках.</p>';
      return;
    }
    const selected = comparison.map(find);
    const rows = [
      ['Продолжительность', (item) => `${item.duration} минут`],
      ['Стоимость', (item) => money(item.price)],
      ['Формат', (item) => item.format],
      ['Интенсивность', (item) => item.intensity]
    ];
    container.innerHTML = `<div class="table-responsive"><table class="table align-middle compare-table"><caption class="visually-hidden">Сравнение выбранных программ массажа</caption><thead><tr><th scope="col">Параметр</th>${selected.map((item) => `<th scope="col"><img src="images/${item.id}.webp" alt="" width="150" height="90" class="compare-thumb"><span class="d-block mt-2">${escape(item.name)}</span></th>`).join('')}</tr></thead><tbody>${rows.map(([label, get]) => `<tr><th scope="row">${label}</th>${selected.map((item) => `<td>${escape(get(item))}</td>`).join('')}</tr>`).join('')}<tr><th scope="row">Действия</th>${selected.map((item) => `<td><a class="btn btn-outline-primary btn-sm mb-2" href="order.html?service=${item.id}">Выбрать ↗</a><br><button type="button" class="btn btn-link btn-sm p-0" data-remove-compare="${item.id}">Убрать <span class="visually-hidden">${escape(item.name)}</span></button></td>`).join('')}</tr></tbody></table></div>`;
  };
  document.addEventListener('click', (event) => {
    const favorite = event.target.closest('[data-favorite]');
    if (favorite) {
      const id = favorite.dataset.favorite;
      if (!find(id)) return;
      const existed = favorites.includes(id);
      favorites = existed ? favorites.filter((item) => item !== id) : [...favorites, id];
      const saved = persist('tiho:favorites:v1', favorites);
      renderFavoriteButtons();
      // Если карточка исчезла из режима «Только избранное», возвращаем фокус к фильтру.
      if (existed && document.getElementById('favoritesOnly')?.checked) document.getElementById('favoritesOnly').focus();
      announce(`${existed ? 'Услуга убрана из избранного.' : 'Услуга добавлена в избранное.'}${saved ? '' : ' Браузер запретил сохранение: выбор доступен только в этой вкладке.'}`);
    }
    const compare = event.target.closest('[data-compare], [data-remove-compare]');
    if (compare) {
      const id = compare.dataset.compare || compare.dataset.removeCompare;
      if (!find(id)) return;
      const existed = comparison.includes(id);
      if (!existed && comparison.length === 3) { announce('Можно сравнить три программы. Сначала уберите одну из выбранных.'); return; }
      comparison = existed ? comparison.filter((item) => item !== id) : [...comparison, id];
      persist('tiho:comparison:v1', comparison);
      renderComparison();
      if (compare.hasAttribute('data-remove-compare')) {
        const closeButton = document.querySelector('#comparePanel [data-bs-dismiss]');
        closeButton.focus();
      }
      announce(existed ? 'Программа убрана из сравнения.' : 'Программа добавлена к сравнению.');
    }
  });
  document.getElementById('clearCompare').addEventListener('click', () => {
    comparison = [];
    persist('tiho:comparison:v1', comparison);
    renderComparison();
    document.querySelector('#comparePanel [data-bs-dismiss]').focus();
    announce('Сравнение очищено.');
  });
  window.addEventListener('storage', (event) => {
    if (event.key === 'tiho:favorites:v1' || event.key === null) { favorites = readIds('tiho:favorites:v1'); renderFavoriteButtons(); }
    if (event.key === 'tiho:comparison:v1' || event.key === null) { comparison = readIds('tiho:comparison:v1', 3); renderComparison(); }
  });
  const onlyFavorites = document.getElementById('favoritesOnly');
  if (onlyFavorites) {
    onlyFavorites.checked = new URLSearchParams(location.search).get('favorites') === '1';
    onlyFavorites.addEventListener('change', () => document.getElementById('serviceSearch').dispatchEvent(new Event('input')));
  }
  renderFavoriteButtons();
  renderComparison();

  /* 3. Подбор по предпочтениям: ограничение времени соблюдается всегда. */
  const matchForm = document.getElementById('matchForm');
  if (matchForm) {
    const result = document.getElementById('matchResult');
    matchForm.addEventListener('change', () => { result.hidden = true; });
    matchForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const answers = new FormData(matchForm);
      const goal = answers.get('goal');
      const mood = answers.get('mood');
      const maxMinutes = Number(answers.get('minutes'));
      const options = programs.filter((item) => item.duration <= maxMinutes);
      const score = (item) => {
        let points = 0;
        if ((goal === 'office' && item.id === 'back') || (goal === 'feet' && item.id === 'feet')) points += 10;
        if (goal === 'rest' && item.category === 'relax') points += 5;
        if ((mood === 'aroma' && item.id === 'aroma') || (mood === 'slow' && item.id === 'slow') || (mood === 'simple' && item.id === 'relax')) points += 4;
        return points;
      };
      const chosen = [...options].sort((a, b) => score(b) - score(a) || a.duration - b.duration)[0];
      const note = maxMinutes === 30 && goal !== 'feet'
        ? 'При выбранном лимите времени подойдёт короткий формат для стоп и голеней. Для других программ выберите больше времени.'
        : 'Этот вариант соответствует вашим предпочтениям и укладывается в выбранное время.';
      result.innerHTML = `<div class="row g-3 align-items-center"><div class="col-12 col-sm-4"><img src="images/${chosen.id}.webp" alt="${escape(chosen.photoAlt)}" class="match-photo" width="300" height="200"></div><div class="col-12 col-sm-8"><p class="eyebrow mb-2">Ваш вариант · ${chosen.duration} минут</p><h3 class="h4">${escape(chosen.name)}</h3><p class="small">${note}</p><p class="fw-bold">${money(chosen.price)}</p><a class="btn btn-primary btn-sm" href="order.html?service=${chosen.id}">Выбрать программу ↗</a> <a class="small ms-2" href="product.html?service=${chosen.id}">Подробнее</a></div></div>`;
      result.hidden = false;
    });
    document.getElementById('matchModal').addEventListener('hidden.bs.modal', () => { result.hidden = true; });
  }

  /* Загрузка файлов только после явного нажатия пользователя. */
  const download = (text, type, name) => {
    const url = URL.createObjectURL(new Blob([text], { type }));
    const link = document.createElement('a');
    link.href = url; link.download = name;
    document.body.append(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  /* 4. Конструктор подарочной карты: экран, SVG и печатная версия совпадают. */
  const giftForm = document.getElementById('giftForm');
  if (giftForm) {
    const preview = document.getElementById('giftPreview');
    let svg = '';
    const wrap = (text, length) => {
      const lines = []; let line = '';
      for (const char of Array.from(text)) {
        line += char;
        if (Array.from(line).length >= length) { lines.push(line); line = ''; }
      }
      if (line) lines.push(line);
      return lines;
    };
    const updateGift = () => {
      const data = new FormData(giftForm);
      const recipient = String(data.get('recipient')).trim().slice(0, 40) || 'Для особенного человека';
      const message = String(data.get('message')).trim().slice(0, 120) || 'Время, которое можно посвятить себе.';
      const sand = data.get('design') === 'sand';
      const bg = sand ? '#efe3d1' : '#e5ebdc';
      const ink = sand ? '#66513d' : '#354d37';
      svg = `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="620" viewBox="0 0 960 620" role="img" aria-labelledby="giftSvgTitle">
        <title id="giftSvgTitle">Подарочная карта для ${escape(recipient)}</title>
        <rect width="960" height="620" rx="30" fill="${bg}"/>
        <rect x="24" y="24" width="912" height="572" rx="18" fill="none" stroke="${ink}" stroke-opacity=".3"/>
        <circle cx="840" cy="114" r="110" fill="none" stroke="${ink}" stroke-opacity=".14"/>
        <circle cx="840" cy="114" r="78" fill="none" stroke="${ink}" stroke-opacity=".14"/>
        <text x="64" y="100" fill="${ink}" font-family="Georgia,serif" font-size="50">тихо.</text>
        <text x="64" y="142" fill="${ink}" font-family="Arial,sans-serif" font-size="16" letter-spacing="4">ПОДАРОЧНАЯ КАРТА</text>
        <text x="64" y="211" fill="${ink}" font-family="Georgia,serif" font-size="26">${wrap(recipient, 26).map((line, i) => `<tspan x="64" dy="${i ? 32 : 0}">${escape(line)}</tspan>`).join('')}</text>
        <text x="64" y="308" fill="${ink}" font-family="Georgia,serif" font-size="64">${escape(money(Number(data.get('amount'))))}</text>
        <text x="64" y="370" fill="${ink}" font-family="Arial,sans-serif" font-size="23">${wrap(message, 50).slice(0, 3).map((line, i) => `<tspan x="64" dy="${i ? 34 : 0}">${escape(line)}</tspan>`).join('')}</text>
        <path d="M754 460c50-100 100-60 110-120-80-8-126 45-110 120Zm0 0 75-90" fill="none" stroke="${ink}" stroke-width="2" opacity=".4"/>
        <text x="64" y="537" fill="${ink}" font-family="Arial,sans-serif" font-size="15">Оформление подарка · не подтверждает оплату</text>
        <text x="64" y="565" fill="${ink}" font-family="Arial,sans-serif" font-size="14">hello@tiho.example · +7 (000) 123-45-67</text>
        </svg>`;
      preview.innerHTML = svg;
      document.getElementById('giftStatus').textContent = '';
    };
    giftForm.addEventListener('input', updateGift);
    giftForm.addEventListener('change', updateGift);
    giftForm.addEventListener('submit', (event) => event.preventDefault());
    document.getElementById('downloadGift').addEventListener('click', () => {
      updateGift();
      download(svg, 'image/svg+xml;charset=utf-8', 'tiho-gift-card.svg');
      document.getElementById('giftStatus').textContent = 'Файл оформления подготовлен. Сохранение не означает покупку подарочной карты.';
    });
    document.getElementById('printGift').addEventListener('click', () => window.print());
    updateGift();
  }

  /* 5. iCalendar: московское время → UTC, длительность берётся из программы. */
  const calendarButton = document.getElementById('exportCalendar');
  if (calendarButton) {
    const form = document.getElementById('bookingForm');
    const status = document.getElementById('calendarStatus');
    const selectedPlan = () => {
      const service = find(form.elements.service.value);
      const date = form.elements.date.value;
      const time = form.elements.time.value;
      if (!service || !date || !time || !form.elements.date.checkValidity()) return null;
      const start = new Date(`${date}T${time}:00+03:00`);
      if (!Number.isFinite(start.getTime()) || start <= new Date()) return null;
      return { service, start, end: new Date(start.getTime() + service.duration * 60000) };
    };
    const updateCalendar = () => {
      const ready = !!selectedPlan();
      calendarButton.disabled = !ready;
      status.textContent = ready ? 'Время московское (UTC+3). Это личный план, не подтверждённая запись.' : 'Выберите программу и будущие дату и время. Время — московское.';
    };
    const escapeIcs = (value) => String(value).replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/;/g, '\\;').replace(/,/g, '\\,');
    const stamp = (date) => date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const fold = (line) => {
      // RFC 5545: максимум 75 октетов; учитывается UTF-8, а не число букв.
      const output = []; let part = ''; let bytes = 0;
      for (const char of line) {
        const size = new TextEncoder().encode(char).length;
        if (bytes + size > 75) { output.push(part); part = ' '; bytes = 1; }
        part += char; bytes += size;
      }
      output.push(part); return output.join('\r\n');
    };
    calendarButton.addEventListener('click', () => {
      const plan = selectedPlan();
      if (!plan) { updateCalendar(); return; }
      const uid = `${Date.now()}-${Math.random().toString(36).slice(2)}@tiho.example`;
      const lines = [
        'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Tiho//Personal visit planner//RU',
        'CALSCALE:GREGORIAN', 'BEGIN:VEVENT', `UID:${uid}`, `DTSTAMP:${stamp(new Date())}`,
        `DTSTART:${stamp(plan.start)}`, `DTEND:${stamp(plan.end)}`,
        `SUMMARY:${escapeIcs('План: ' + plan.service.name + ' — время не подтверждено')}`,
        `DESCRIPTION:${escapeIcs('Личное напоминание о желаемом визите в студию Тихо. Это не подтверждение бронирования. Согласуйте время со студией. Цена программы: ' + money(plan.service.price) + '.')}`,
        'STATUS:TENTATIVE', 'TRANSP:TRANSPARENT', 'END:VEVENT', 'END:VCALENDAR'
      ];
      download(lines.map(fold).join('\r\n') + '\r\n', 'text/calendar;charset=utf-8', 'tiho-visit-plan.ics');
      status.textContent = 'Файл календаря подготовлен. При импорте проверьте время; запись в студию не подтверждена.';
    });
    form.addEventListener('input', updateCalendar);
    form.addEventListener('change', updateCalendar);
    form.addEventListener('reset', () => setTimeout(updateCalendar, 0));
    updateCalendar();
  }

  /* Цветок-компас: кольцо показывает прокрутку; ссылка #top работает без JS. */
  const flower = document.querySelector('.scroll-flower');
  if (flower) {
    let scheduled = false;
    const progress = () => {
      const height = document.documentElement.scrollHeight - innerHeight;
      const percent = height > 0 ? Math.round(Math.max(0, Math.min(1, scrollY / height)) * 100) : 0;
      flower.style.setProperty('--scroll-progress', `${percent}%`);
      flower.querySelector('.scroll-percent').textContent = `${percent}%`;
      scheduled = false;
    };
    window.addEventListener('scroll', () => {
      if (!scheduled) { requestAnimationFrame(progress); scheduled = true; }
    }, { passive: true });
    window.addEventListener('resize', progress);
    if (window.ResizeObserver) new ResizeObserver(progress).observe(document.body);
    progress();
  }
})();
