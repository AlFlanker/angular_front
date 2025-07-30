# Установка AG Grid для LK Mart Angular

## Шаги установки

### 1. Установка пакетов
```bash
cd lk-mart-app/src/main/resources/static/lk-mart-angular
npm install ag-grid-angular@^34.0.0 ag-grid-community@^34.0.0
```

### 2. Использование нового Theming API (v33+)
AG Grid v33+ использует новый Theming API вместо CSS файлов. Стили подключаются автоматически через JavaScript.

**Важно**: Не нужно добавлять CSS импорты AG Grid в `angular.json` или `styles.css`.

### 3. Обновление импортов в компоненте
После установки пакетов добавьте импорты в `document-table.ts`:

```typescript
import { AgGridModule } from 'ag-grid-angular';
import { 
  ColDef, 
  GridApi, 
  GridReadyEvent, 
  FilterChangedEvent, 
  SortChangedEvent,
  ModuleRegistry,
  AllCommunityModule,
  themeBalham
} from 'ag-grid-community';

// Регистрируем все модули AG Grid Community
ModuleRegistry.registerModules([AllCommunityModule]);
```

### 4. Настройка темы
Используйте новый Theming API для настройки внешнего вида:

```typescript
// В компоненте
gridTheme = themeBalham.withParams({
  accentColor: '#007bff',
  foregroundColor: '#495057',
  backgroundColor: '#ffffff',
  headerBackgroundColor: '#f8f9fa',
  rowHoverColor: '#e9ecef',
  selectedRowBackgroundColor: '#007bff',
  borderColor: '#dee2e6',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  fontSize: '14px',
  spacing: 6
});
```

### 5. Обновление HTML шаблона
Используйте `[theme]` вместо `class`:

```html
<ag-grid-angular
    [theme]="gridTheme"
    [columnDefs]="columnDefs"
    [rowData]="documents"
    ...>
</ag-grid-angular>
```

### 6. Обновление декоратора компонента
Добавьте AgGridModule в imports:

```typescript
@Component({
  selector: 'app-document-table',
  standalone: true,
  imports: [CommonModule, AgGridModule],
  templateUrl: './document-table.html',
  styleUrl: './document-table.css'
})
```

## Функциональность

После установки AG Grid Community таблица будет поддерживать:

- **Фильтрация**: По всем колонкам с предустановленными значениями из API
- **Сортировка**: По колонкам, указанным в `sortable` из ответа API
- **Пагинация**: Встроенная пагинация AG Grid
- **Выбор строк**: Одиночный выбор строк
- **Адаптивность**: Автоматическое изменение размера колонок
- **Кастомные рендереры**: Кнопки для подсистем и действий
- **Изменение размера колонок**: Drag & Drop для изменения ширины колонок
- **Меню колонок**: Контекстное меню для каждой колонки

### Ограничения Community версии:
- ❌ Range Selection (выбор диапазона ячеек) - требует Enterprise
- ❌ Fill Handle (автозаполнение) - требует Enterprise
- ❌ Excel Export - требует Enterprise
- ❌ Advanced Filter Panel - требует Enterprise

## Структура данных

### Фильтры из API:
```json
{
  "filters": {
    "filterOptions": [
      {
        "subsystem": "EXP04",
        "subsystemName": "ПУР04",
        "docTypes": [
          {
            "docTypeId": "MSC_ApplInvoice",
            "docTypeName": "Счет",
            "docStates": ["Удален", "На подписании", "Завершен", ...]
          }
        ]
      }
    ],
    "sortable": ["doc_guid", "doc_num", "doc_date", "organization", "tofk", "account"]
  }
}
```

### Соответствие полей:
- `subsystem` → `subsystemName` (отображается в таблице)
- `docTypeId` → `docTypeName` (отображается в таблице)
- `docStates` → доступные значения для фильтра статуса

## Дополнительные возможности

### Community версия:
- Группировка данных
- Детализация строк
- Кастомные фильтры
- Drag & Drop колонок
- Контекстные меню

### Enterprise версия (требует лицензию):
Для добавления Enterprise функций:

1. Установите Enterprise пакет:
```bash
npm install ag-grid-enterprise
```

2. Обновите импорты:
```typescript
import { AllEnterpriseModule, ModuleRegistry } from 'ag-grid-enterprise';
ModuleRegistry.registerModules([AllEnterpriseModule]);
```

3. Добавьте Enterprise функции:
- Экспорт в Excel/CSV
- Range Selection (выбор диапазона ячеек)
- Fill Handle (автозаполнение)
- Advanced Filter Panel
- Master Detail
- Tree Data
- Pivoting 