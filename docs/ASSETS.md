# Ресурсы и лицензии

## Bootstrap

Версия 5.3.8, локальные оригинальные файлы `bootstrap.min.css` и `bootstrap.bundle.min.js`.
Источники: https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css и https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js.
Суммы SHA-384 сверены с официальной документацией: https://getbootstrap.com/docs/5.3/getting-started/introduction/.
Лицензия MIT включена в `vendor/bootstrap/LICENSE`; авторские уведомления сохранены.

## Интерьер

`images/studio.webp` и `images/studio-960.webp` — оптимизированные версии одного изображения, созданного ImageGen для этого учебного проекта. Это иллюстрация вымышленной студии, а не фотография действующего салона. Две версии нужны для адаптивной загрузки.

Промпт:

> Photorealistic editorial architectural photograph of a serene contemporary massage treatment room: massage table with creamy linen and neatly folded towels, curved wall niche, ceramic vase with an olive branch, small bowl and amber oil bottle, warm ivory plaster, light oak and muted sage upholstery, soft morning sunlight and leaf shadows. Wide landscape, natural materials, empty room, no people, no text, logos, watermark or medical equipment.

## Векторные изображения

Шесть иллюстраций услуг, favicon и условная схема созданы как SVG-разметка специально для проекта. Схема не является географической картой реального адреса. Внешние шрифты, фотостоки и аналитика не подключены; карта добавлена в обновлении ниже.

## Тексты и данные

Название, адрес, телефон, специалисты, стоимость и описания — учебные примеры. Нет изображений реальных специалистов, отзывов клиентов или обещаний лечебного результата.

## Фотографии обновления от 5 ноября 2026 года

Шесть фотографий программ `relax.webp`, `back.webp`, `classic.webp`, `aroma.webp`,
`feet.webp`, `slow.webp` и три портрета `anna.webp`, `daria.webp`, `mikhail.webp`
созданы встроенным ImageGen по отдельным промптам и оптимизированы в WebP.
Это синтетические изображения, они не являются фотографиями работающих в студии людей.
Портреты описывают специалистов по массажу, без медицинских званий и атрибутов врача.
Полный набор промптов сохранён в [IMAGE_PROMPTS.md](IMAGE_PROMPTS.md).
Старые SVG-иллюстрации сохранены в images как исходные ресурсы, но карточки используют WebP.

## Карта

Добавлен официальный виджет Яндекс Карт с указателем на адрес «Москва, Тверская улица, д. 18, корп. 1»
(55.765954, 37.605086). Внешние ссылки и карта показывают одну точку. Сам адрес существует,
но присутствие массажной студии по нему не подтверждено: это выбранный адрес макета.
Иконки местоположения, VK и Telegram созданы как встроенные SVG без внешней библиотеки.
Ссылки соцсетей ведут на главные страницы https://vk.com/ и https://telegram.org/,
а не на несуществующие профили студии. Для карты нужен интернет.

Документация: https://yandex.ru/support/maps/ru/concept/get-map-reference.
Пользовательские координаты не запрашиваются, построение маршрута выполняется на стороне картографического сервиса.
