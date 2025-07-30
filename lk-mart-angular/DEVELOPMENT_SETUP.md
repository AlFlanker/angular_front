# Настройка среды разработки

## Обзор

В режиме разработки Angular приложение работает на порту 4201, а Spring Boot API на порту 8081. Для корректной работы API запросов настроено проксирование.

## Конфигурация прокси

### Файл proxy.conf.json
```json
{
  "/api": {
    "target": "http://localhost:8081",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "debug"
  }
}
```

Этот файл настраивает перенаправление всех запросов, начинающихся с `/api`, на `http://localhost:8081`.

## Запуск в режиме разработки

### Вариант 1: Запуск с прокси на порту 4200 (рекомендуется)
```bash
npm run start:dev
```

### Вариант 2: Запуск с прокси на автоматическом порту
```bash
npm run start:proxy
```

### Вариант 3: Ручной запуск с прокси
```bash
ng serve --port 4200 --proxy-config proxy.conf.json
```

### Вариант 4: Обычный запуск (без прокси)
```bash
npm start
# или
ng serve
```

## Проверка работы

1. Запустите Spring Boot приложение на порту 8081
2. Запустите Angular приложение с прокси: `npm run start:dev`
3. Откройте браузер на `http://localhost:4200`
4. API запросы будут автоматически перенаправляться на порт 8081

## Environment файлы

Проект использует environment файлы для настройки API URL:

- **development**: `src/environments/environment.ts` - использует `/api` для прокси
- **production**: `src/environments/environment.prod.ts` - использует `/api` для того же домена

## Примеры запросов

### В Angular коде
```typescript
// Этот запрос будет перенаправлен на http://localhost:8081/api/documents/USER
this.http.post('/api/documents/USER', params)
```

### В браузере
- Запрос: `http://localhost:4200/api/documents/USER`
- Перенаправляется на: `http://localhost:8081/api/documents/USER`

## Устранение проблем

### Проблема: API запросы не работают
**Решение**: Убедитесь, что:
1. Spring Boot приложение запущено на порту 8081
2. Angular запущен с прокси: `npm run start:proxy`
3. В консоли браузера нет ошибок CORS

### Проблема: Ошибки CORS
**Решение**: Прокси должен решать проблемы CORS. Если ошибки остаются:
1. Проверьте, что используется правильная команда запуска
2. Убедитесь, что файл `proxy.conf.json` находится в корне проекта
3. Перезапустите Angular dev server

### Проблема: Прокси не работает
**Решение**:
1. Проверьте конфигурацию в `angular.json`
2. Убедитесь, что в `serve.options` есть `"proxyConfig": "proxy.conf.json"`
3. Перезапустите Angular dev server

## Логирование

При использовании прокси в консоли Angular CLI будут отображаться логи перенаправления:
```
[HPM] Proxy created: /api  ->  http://localhost:8081
[HPM] Proxy rewrite rule created: "^/api" ~> ""
```

## Продакшн

В продакшне прокси не используется, так как Angular приложение собирается и раздается через Spring Boot на том же порту. 