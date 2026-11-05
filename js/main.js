'use strict';

// Общие данные локальные: сайт работает без API и без сохранения заявок.
const services = window.STUDIO_DATA.services;
const staff = window.STUDIO_DATA.staff;
const params = new URLSearchParams(window.location.search);
const serviceById = (id) => services.find((service) => service.id === id);
const priceText = (price) => new Intl.NumberFormat('ru-RU').format(price) + ' ₽';
const setText = (id, value) => {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
};
const localDate = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

/* Каталог: реальные поиск, фильтр и сортировка существующих карточек. */
const grid = document.getElementById('serviceGrid');
if (grid) {
  const search = document.getElementById('serviceSearch');
  const category = document.getElementById('categoryFilter');
  const sort = document.getElementById('sortServices');
  const items = Array.from(grid.children);
  const applyFilters = () => {
    const query = search.value.trim().toLocaleLowerCase('ru-RU');
    const sorted = [...items].sort((a, b) => {
      const first = serviceById(a.dataset.serviceId);
      const second = serviceById(b.dataset.serviceId);
      if (sort.value === 'price') return first.price - second.price;
      if (sort.value === 'duration') return first.duration - second.duration;
      return services.indexOf(first) - services.indexOf(second);
    });
    let visible = 0;
    sorted.forEach((item) => {
      const service = serviceById(item.dataset.serviceId);
      const matches = (category.value === 'all' || service.category === category.value)
        && `${service.name} ${service.desc}`.toLocaleLowerCase('ru-RU').includes(query);
      item.hidden = !matches;
      if (matches) visible += 1;
      grid.append(item);
    });
    setText('serviceCount', `Найдено услуг: ${visible}`);
    document.getElementById('emptyResults').hidden = visible !== 0;
  };
  search.addEventListener('input', applyFilters);
  category.addEventListener('change', applyFilters);
  sort.addEventListener('change', applyFilters);
  document.getElementById('resetFilters').addEventListener('click', () => {
    search.value = '';
    category.value = 'all';
    sort.value = 'default';
    applyFilters();
  });
}

/* Одна страница описания показывает именно выбранную услугу. */
const detail = document.getElementById('serviceDetail');
if (detail) {
  const requested = params.get('service');
  const service = serviceById(requested || 'relax');
  if (!service) {
    detail.hidden = true;
    document.getElementById('detailExtra').hidden = true;
    document.getElementById('serviceNotFound').hidden = false;
    document.title = 'Услуга не найдена — Тихо';
  } else {
    document.title = `${service.name} — Тихо`;
    document.querySelector('meta[name="description"]').content = `${service.name}: ${service.duration} минут, ${priceText(service.price)}. Программа студии Тихо.`;
    const fields = {
      detailName: service.name, detailLead: service.lead, detailDesc: service.desc,
      detailCategory: service.categoryName, detailTag: service.tag,
      detailPrice: priceText(service.price), detailDuration: `${service.duration} минут`,
      detailText: service.details, tableDuration: `${service.duration} минут`,
      tablePrice: priceText(service.price), tableIntensity: service.intensity,
      tableFormat: service.format
    };
    Object.entries(fields).forEach(([id, value]) => setText(id, value));
    const detailImage = document.getElementById('detailImage');
    detailImage.src = `images/${service.id}.webp`;
    detailImage.alt = service.photoAlt;
    document.getElementById('detailOrder').href = `order.html?service=${encodeURIComponent(service.id)}`;
    document.getElementById('detailQuick').dataset.service = service.id;
  }
}

/* Bootstrap Modal управляет открытием, фоном, Escape и фокусом. */
const modalElement = document.getElementById('quickBookingModal');
const quickForm = document.getElementById('quickForm');
const quickService = document.getElementById('quickService');
const quickSuccess = document.getElementById('quickSuccess');
const fullBookingLink = document.getElementById('fullBookingLink');
const updateFullLink = () => {
  fullBookingLink.href = quickService.value
    ? `order.html?service=${encodeURIComponent(quickService.value)}` : 'order.html';
};
if (modalElement && quickForm) {
  modalElement.addEventListener('show.bs.modal', (event) => {
    quickForm.reset();
    const id = event.relatedTarget?.dataset.service;
    if (serviceById(id)) quickService.value = id;
    updateFullLink();
  });
  quickService.addEventListener('change', updateFullLink);
}

/* Валидация двух демо-форм без сети и без записи персональных данных. */
function attachDemoForm(form, success, onValid) {
  const controls = Array.from(form.elements).filter((field) => field.willValidate);
  const validateField = (field) => {
    field.setCustomValidity('');
    if (field.name === 'phone') {
      const digits = field.value.replace(/\D/g, '');
      field.setCustomValidity(digits.length === 10 ? '' : 'Введите 10 цифр после +7.');
    }
    if (field.name === 'name') {
      field.setCustomValidity(field.value.trim().length >= 2 ? '' : 'Введите имя от двух символов.');
    }
    if (field.name === 'date') field.min = localDate();
  };
  const clearState = () => {
    form.classList.remove('was-validated');
    success.hidden = true;
    controls.forEach((field) => {
      field.removeAttribute('aria-invalid');
      field.setCustomValidity('');
    });
  };
  const onEdit = (event) => {
    success.hidden = true;
    const field = event.target;
    if (!field.willValidate) return;
    validateField(field);
    if (form.classList.contains('was-validated')) {
      field.setAttribute('aria-invalid', String(!field.checkValidity()));
    }
  };
  form.addEventListener('input', onEdit);
  form.addEventListener('change', onEdit);
  form.addEventListener('reset', () => {
    clearState();
    // Значения полей сбрасываются после события reset.
    setTimeout(() => {
      if (form.id === 'bookingForm') updateSummary();
      if (form.id === 'quickForm') updateFullLink();
    }, 0);
  });
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    success.hidden = true;
    controls.forEach(validateField);
    form.classList.add('was-validated');
    if (!form.checkValidity()) {
      controls.forEach((field) => field.setAttribute('aria-invalid', String(!field.checkValidity())));
      const firstInvalid = controls.find((field) => !field.checkValidity());
      if (firstInvalid) firstInvalid.focus();
      return;
    }
    controls.forEach((field) => field.removeAttribute('aria-invalid'));
    success.textContent = onValid(new FormData(form));
    success.hidden = false;
  });
}
if (quickForm) {
  attachDemoForm(quickForm, quickSuccess, (data) => {
    const service = serviceById(data.get('service'));
    return `${data.get('name').trim()}, поля заполнены корректно: ${service.name}, ${priceText(service.price)}. Отправка заявки пока не подключена: данные не отправлены и время не забронировано.`;
  });
}

const bookingForm = document.getElementById('bookingForm');
function updateSummary() {
  if (!bookingForm) return;
  const service = serviceById(bookingForm.elements.service.value);
  const person = staff.find((item) => item.id === bookingForm.elements.specialist.value);
  setText('summaryName', service ? service.name : 'Выберите услугу');
  setText('summaryDuration', service ? `${service.duration} минут` : '—');
  setText('summaryPrice', service ? priceText(service.price) : '—');
  setText('summarySpecialist', person ? person.name : 'Любой');
  const date = bookingForm.elements.date.value;
  const time = bookingForm.elements.time.value;
  const readableDate = date ? date.split('-').reverse().join('.') : '';
  setText('summaryDate', [readableDate, time].filter(Boolean).join(' · ') || 'Не выбраны');
}
if (bookingForm) {
  const success = document.getElementById('bookingSuccess');
  document.getElementById('bookingDate').min = localDate();
  const service = serviceById(params.get('service'));
  if (service) bookingForm.elements.service.value = service.id;
  const person = staff.find((item) => item.id === params.get('specialist'));
  if (person) bookingForm.elements.specialist.value = person.id;
  bookingForm.addEventListener('input', updateSummary);
  bookingForm.addEventListener('change', updateSummary);
  updateSummary();
  attachDemoForm(bookingForm, success, (data) => {
    const selected = serviceById(data.get('service'));
    return `${data.get('name').trim()}, форма заполнена корректно: ${selected.name}, ${data.get('date').split('-').reverse().join('.')} в ${data.get('time')}, ${priceText(selected.price)}. Данные не отправлялись; время не забронировано.`;
  });
}
