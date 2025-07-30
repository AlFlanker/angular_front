# LK Mart - Angular 20 Frontend

## Описание
Современный веб-интерфейс для системы управления документами LK Mart, построенный на Angular 20.

## Основные возможности
- 📄 Управление документами
- 🔍 Поиск и фильтрация
- 📊 Табличное представление данных
- 🔗 Интеграция с навигационными узлами
- 📱 Адаптивный дизайн

## Структура проекта
```
static/
├── index.html              # Главная страница Angular приложения
├── browser/                # Собранные Angular файлы
│   ├── favicon.ico
│   ├── styles-*.css
│   ├── polyfills-*.js
│   └── main-*.js
├── lk-mart-angular/        # Исходный код Angular проекта
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/
│   │   │   ├── services/
│   │   │   └── models/
│   │   └── styles.css
│   ├── package.json
│   └── angular.json
├── package.json            # Скрипты для управления проектом
└── README.md              # Этот файл
```

## Технологии
- **Angular 20** - основной фреймворк
- **TypeScript** - язык программирования
- **RxJS** - реактивное программирование
- **Bootstrap** - CSS фреймворк
- **Spring Boot** - бэкенд (отдельно)

## Быстрый старт

### 1. Установка зависимостей
```bash
cd lk-mart-angular
npm install
```

### 2. Разработка
```bash
# Запуск в режиме разработки
npm start

# Или через Angular CLI
ng serve
```

### 3. Сборка для продакшена
```bash
# Сборка проекта
npm run build

# Копирование файлов в корень static
cp -r dist/lk-mart-angular/* ../
```

### 4. Запуск с Spring Boot
```bash
# В корне проекта lk-mart
./gradlew bootRun
```

После запуска приложение будет доступно по адресу: `http://localhost:8080/`

## Разработка

### Структура компонентов
- `DocumentTableComponent` - таблица документов
- `NavigationNodesModalComponent` - модальное окно навигации

### Сервисы
- `PubsubService` - коммуникация с ELK.pubsub
- `DocumentApiService` - API для работы с документами
- `DocumentListService` - управление состоянием списка документов
- `ModalService` - управление модальными окнами
- `NavigationNodesService` - работа с навигационными узлами
- `DocumentOpenService` - открытие и скачивание документов

### Модели данных
- `Document` - модель документа
- `NavigationNode` - модель навигационного узла
- `PaginationInfo` - информация о пагинации

## Миграция с AngularJS

### Что было сделано
- ✅ Удален весь старый AngularJS код
- ✅ Создана новая Angular 20 архитектура
- ✅ Перенесена вся функциональность
- ✅ Улучшен UI/UX
- ✅ Добавлена типизация TypeScript

### Основные улучшения
- 🚀 Современный фреймворк Angular 20
- 📝 Строгая типизация TypeScript
- 🔄 Реактивное программирование с RxJS
- 🎨 Улучшенный дизайн
- 📱 Адаптивность
- 🛠️ Лучшая архитектура компонентов

## Тестирование
```bash
# Запуск тестов
npm test

# Запуск тестов в режиме watch
npm run test:watch
```

## Деплой

### Локальный деплой
1. Соберите Angular проект: `npm run build`
2. Скопируйте файлы: `cp -r dist/lk-mart-angular/* ../`
3. Запустите Spring Boot: `./gradlew bootRun`

### Продакшен деплой
1. Соберите Angular проект: `npm run build --prod`
2. Скопируйте файлы в папку static
3. Соберите Spring Boot JAR: `./gradlew build`
4. Запустите JAR файл

## Поддержка
Для вопросов и предложений обращайтесь к команде разработки. 