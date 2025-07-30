# Изменения в API получения документов

## Обзор изменений

API получения документов был переработан для улучшения функциональности и производительности.

## Основные изменения

### 1. Метод запроса
- **Было**: `GET /api/documents`
- **Стало**: `POST /api/documents/{scope}`

### 2. Параметры запроса
- **Было**: Параметры передавались в query string
- **Стало**: Параметры передаются в теле запроса (DocumentParams)

### 3. Структура ответа
- **Было**: `DocumentsResponse` с простой структурой
- **Стало**: `DocumentsPageResponse` с расширенной информацией

## Новые типы данных

### DocumentParams
```typescript
interface DocumentParams {
  page: number;           // Номер страницы (начиная с 0)
  size: number;           // Размер страницы (1-100)
  filters: SubsystemFilterItem[];  // Фильтры по подсистемам
  sort: SortCriterion[];  // Критерии сортировки
}
```

### Scope (область поиска)
```typescript
enum Scope {
  USER = 'USER',  // Документы пользователя
  ORG = 'ORG'     // Документы организации
}
```

### Фильтры
```typescript
interface SubsystemFilterItem {
  subsystem: string;           // Код подсистемы
  docTypes: DocTypeStateFilter[];  // Фильтры по типам документов
}

interface DocTypeStateFilter {
  docTypeId: string;    // ID типа документа
  docState: string[];   // Состояния документов
}
```

### Сортировка
```typescript
interface SortCriterion {
  field: string;           // Поле для сортировки
  direction: SortDirection; // Направление сортировки
}

enum SortDirection {
  ASC = 'ASC',
  DESC = 'DESC'
}
```

## Обновленный сервис DocumentApiService

### Основные методы

#### getDocuments()
```typescript
getDocuments(params: DocumentParams, scope: Scope = Scope.USER): Observable<DocumentsPageResponse>
```

#### getDocumentsSimple()
```typescript
getDocumentsSimple(page: number = 0, size: number = 20, scope: Scope = Scope.USER): Observable<DocumentsPageResponse>
```

#### searchDocuments()
```typescript
searchDocuments(filters: SubsystemFilterItem[], page: number = 0, size: number = 20, scope: Scope = Scope.USER): Observable<DocumentsPageResponse>
```

#### getDocumentsWithSort()
```typescript
getDocumentsWithSort(sortCriteria: SortCriterion[], page: number = 0, size: number = 20, scope: Scope = Scope.USER): Observable<DocumentsPageResponse>
```

## Примеры использования

### Простое получение документов
```typescript
this.documentApiService.getDocumentsSimple(0, 20, Scope.USER)
  .subscribe(response => {
    console.log('Документы:', response.page.documents);
    console.log('Пагинация:', response.page.pagination);
    console.log('Доступные фильтры:', response.filters);
  });
```

### Получение с фильтрами
```typescript
const filters: SubsystemFilterItem[] = [
  {
    subsystem: 'SUBSYSTEM1',
    docTypes: [
      { docTypeId: 'TYPE1', docState: ['ACTIVE', 'DRAFT'] }
    ]
  }
];

this.documentApiService.searchDocuments(filters, 0, 20, Scope.USER)
  .subscribe(response => {
    // Обработка ответа
  });
```

### Получение с сортировкой
```typescript
const sortCriteria: SortCriterion[] = [
  { field: 'createdDate', direction: SortDirection.DESC }
];

this.documentApiService.getDocumentsWithSort(sortCriteria, 0, 20, Scope.USER)
  .subscribe(response => {
    // Обработка ответа
  });
```

### Полный запрос с фильтрами и сортировкой
```typescript
const params: DocumentParams = {
  page: 0,
  size: 20,
  filters: [
    {
      subsystem: 'SUBSYSTEM1',
      docTypes: [
        { docTypeId: 'TYPE1', docState: ['ACTIVE'] }
      ]
    }
  ],
  sort: [
    { field: 'createdDate', direction: SortDirection.DESC }
  ]
};

this.documentApiService.getDocuments(params, Scope.USER)
  .subscribe(response => {
    // Обработка ответа
  });
```

## Миграция существующего кода

### Было:
```typescript
this.documentApiService.getDocuments(page, size)
  .subscribe(response => {
    this.documents = response.documents;
    this.pagination = response.pagination;
  });
```

### Стало:
```typescript
this.documentApiService.getDocumentsSimple(page, size, Scope.USER)
  .subscribe(response => {
    this.documents = response.page.documents;
    this.pagination = response.page.pagination;
  });
```

## Структура ответа

```typescript
interface DocumentsPageResponse {
  page: PaginatedDocumentsResponse;      // Документы и пагинация
  filters: AvailableDocumentsFilter;     // Доступные фильтры
  sortable: string[];                    // Список полей для сортировки
  appliedSort: SortCriterion[];          // Примененная сортировка
}

interface PaginatedDocumentsResponse {
  documents: Document[];                 // Список документов
  pagination: PaginationInfo;            // Информация о пагинации
}
```

## Преимущества нового API

1. **Гибкость**: Поддержка сложных фильтров и сортировки
2. **Производительность**: POST запросы более эффективны для сложных параметров
3. **Расширяемость**: Легко добавлять новые параметры
4. **Типизация**: Строгая типизация всех параметров и ответов
5. **Области поиска**: Разделение на пользовательские и организационные документы 