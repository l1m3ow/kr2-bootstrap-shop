# Новый репозиторий и публикация

Эти шаги относятся к новому проекту `kr2-bootstrap-shop`. Старый `kr1-html-css-shop`
не нужно переименовывать, удалять или заменять файлами массажной студии.

## 1. Подготовить папку

Распакуйте архив в новую папку `kr2-bootstrap-shop`, например рядом с прежним проектом.
В корне должны находиться `index.html`, `catalog.html`, `product.html`, `order.html`,
`contacts.html`, `README.md` и папки `css`, `js`, `images`, `vendor`, `docs`.
Если распаковщик создал два вложенных каталога с одинаковым названием, открывайте
в VS Code тот, в котором непосредственно лежит `index.html`.

Откройте сайт через браузер или Live Server и проверьте страницы.

## 2. Создать пустой репозиторий на GitHub

В своём аккаунте GitHub выберите «+ → New repository».

- Repository name: `kr2-bootstrap-shop`.
- Description: `Учебный сайт массажной студии «Тихо» на Bootstrap 5`.
- Visibility: `Public`, если нужна обычная публикация учебного проекта через Pages.
- Не добавляйте README, .gitignore или лицензию средствами GitHub: необходимые файлы уже есть в архиве.

Нажмите Create repository. Скопируйте HTTPS-адрес именно созданного репозитория.
В командах ниже используется `https://github.com/l1m3ow/kr2-bootstrap-shop.git`.
Если вы создали проект под другим именем или в другом аккаунте, используйте скопированный адрес.

## 3. Создать первоначальную main

Откройте терминал VS Code внутри новой папки. Выполняйте команды по одной:

```bash
git init -b main
git add README.md .gitignore
git commit -m "chore: initialize Bootstrap coursework"
git remote add origin https://github.com/l1m3ow/kr2-bootstrap-shop.git
git push -u origin main
```

Это создаёт основу main. До следующего шага там будут только README и .gitignore;
страницы сайта пока остаются неподготовленными локальными файлами.
Если Git запрашивает вход, выполните стандартную авторизацию GitHub.

Если появляется «Author identity unknown», настройте своё настоящее имя и e-mail
для коммитов через `git config user.name` и `git config user.email`, затем повторите commit.
Не вводите в качестве e-mail случайные данные из примера.

Если git init -b не поддерживается, выполните `git init`, затем после первого коммита
`git branch -M main`.

## 4. Добавить сайт через ветку и PR

```bash
git switch -c feature/massage-bootstrap
git add .
git status
git commit -m "feat: add Bootstrap massage studio website"
git push -u origin feature/massage-bootstrap
```

На GitHub откройте Compare & pull request. Должно быть:

- base: main;
- compare: feature/massage-bootstrap.

Заголовок: `Add massage studio Bootstrap website`.
В описании укажите пять страниц, Bootstrap-компоненты, локальное подключение,
поиск/фильтры, демо-формы и выполненные проверки.

Проверьте Files changed, создайте PR, затем Merge pull request → Confirm merge.
Вернитесь в терминал:

```bash
git switch main
git pull --ff-only origin main
git status
```

Этот способ показывает честную историю: первоначальная main и один PR законченного сайта.
Он не создаёт задним числом отдельные коммиты практических №9, №10 и №11.

## 5. Включить GitHub Pages

Откройте Settings → Pages у нового репозитория.

- Source: Deploy from a branch.
- Branch: main.
- Folder: / (root).
- Save.

Дождитесь успешного развёртывания. В Actions обычно появляется процесс Pages.
Переходите по адресу, который показывает сам GitHub в Pages.
Для указанного аккаунта и имени ожидается `https://l1m3ow.github.io/kr2-bootstrap-shop/`.
До включения Pages этот адрес может не открываться.

Проверьте пять страниц, поиск, модальное окно и форму. Обновите README фактической
ссылкой и статусом публикации. Для последующих изменений повторяйте цикл:
новая ветка → коммит → push → PR → merge → обновление main.

## 6. Типичные ошибки

- «not a git repository» — терминал открыт не в нужной папке.
- «remote origin already exists» — проверьте `git remote -v`; повторно добавлять origin не требуется.
- «rejected» — не используйте force вслепую; прочитайте причину и сравните историю.
- «nothing to commit» — проверьте текущую ветку и `git status`.
- Сайт выглядит без стилей — в репозитории должна быть вся папка vendor, а пути должны оставаться относительными.
- Ошибка 404 в Pages — проверьте ветку main, папку root и успешное завершение публикации.
- Открывается старый вариант — выполните Ctrl+F5 после завершения публикации.

## 7. Что отправить преподавателю

Ссылку на отдельный репозиторий КР №2. README должен содержать фактический адрес
опубликованного сайта, если Pages используется. Формы нужно объяснять как демонстрационные,
а не как реальную запись в студию.
