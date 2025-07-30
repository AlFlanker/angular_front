# Быстрый старт

## Запуск в режиме разработки

### 1. Запустите Spring Boot приложение
```bash
# В корне проекта lk-mart
./gradlew bootRun
# или
java -jar lk-mart-app/build/libs/lk-mart-app.jar
```

### 2. Запустите Angular приложение с прокси
```bash
# В папке lk-mart-angular
npm run start:dev
```

### 3. Откройте браузер
Перейдите на `http://localhost:4200`

## Что происходит

- Angular приложение работает на порту 4200
- Spring Boot API работает на порту 8081
- Все запросы к `/api/*` автоматически перенаправляются на порт 8081
- Проблемы CORS решены через прокси

## Полезные команды

```bash
# Запуск с прокси на порту 4200
npm run start:dev

# Запуск с прокси на автоматическом порту
npm run start:proxy

# Обычный запуск (без прокси)
npm start

# Сборка для продакшна
npm run build
``` 