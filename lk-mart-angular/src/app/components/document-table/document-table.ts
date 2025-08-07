import {Component, OnDestroy, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';

import {NzTableModule} from 'ng-zorro-antd/table';
import {NzButtonModule} from 'ng-zorro-antd/button';

import {NzCardModule} from 'ng-zorro-antd/card';
import {NzTagModule} from 'ng-zorro-antd/tag';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {NzSpinModule} from 'ng-zorro-antd/spin';
import {NzAlertModule} from 'ng-zorro-antd/alert';
import {NzSpaceModule} from 'ng-zorro-antd/space';
import {NzDividerModule} from 'ng-zorro-antd/divider';
import {NzTypographyModule} from 'ng-zorro-antd/typography';
import {NzBadgeModule} from 'ng-zorro-antd/badge';
import {NzAvatarModule} from 'ng-zorro-antd/avatar';
import {NzDescriptionsModule} from 'ng-zorro-antd/descriptions';
import {NzModalModule} from 'ng-zorro-antd/modal';
import {FormsModule} from '@angular/forms';
import {NzDropDownModule} from 'ng-zorro-antd/dropdown';
import {NzSelectModule} from 'ng-zorro-antd/select';
import {NzCheckboxModule} from 'ng-zorro-antd/checkbox';
import {NzCollapseModule} from 'ng-zorro-antd/collapse';
import {NzTreeSelectModule} from 'ng-zorro-antd/tree-select';
import {NzMessageService} from 'ng-zorro-antd/message';
import {NzNotificationService} from 'ng-zorro-antd/notification';
import {
  AppliedFilters,
  ColumnFilter,
  Document,
  DocumentParams,
  DocumentTypeFilter,
  FilterOption,
  SubsystemOption,
  DocTypeOption,
  StatusOption,
  Scope,
  SortCriterion,
  SortDirection,
  SubsystemFilter
} from '../../models/types';
import {NzTreeNodeOptions} from 'ng-zorro-antd/core/tree';
import {DocumentApiService} from '../../services/document-api';
import {DocumentOpenService} from '../../services/document-open';
import {NavigationNodesService} from '../../services/navigation-nodes';
import {ModalService} from '../../services/modal';
import {NzTooltipDirective} from 'ng-zorro-antd/tooltip';
import {NzCalendarComponent} from 'ng-zorro-antd/calendar';

@Component({
  selector: 'app-document-table',
  standalone: true,
  imports: [
    CommonModule,
    NzTableModule,
    NzButtonModule,
    NzCardModule,
    NzTagModule,
    NzIconModule,
    NzSpinModule,
    NzAlertModule,
    NzSpaceModule,
    NzDividerModule,
    NzTypographyModule,
    NzBadgeModule,
    NzAvatarModule,
    NzDescriptionsModule,
    NzModalModule,
    FormsModule,
    NzDropDownModule,
    NzSelectModule,
    NzCheckboxModule,
    NzCollapseModule,
    NzTreeSelectModule,
    NzTooltipDirective,
    NzCalendarComponent
  ],
  templateUrl: './document-table.html',
  styleUrl: './document-table.css'
})
export class DocumentTableComponent implements OnInit, OnDestroy {

  documents: Document[] = [];
  loading = false;
  error: string | null = null;
  currentScope: Scope = Scope.USER;

  pageIndex = 1;
  pageSize = 20;
  total = 0;

  // Доступные фильтры
  // Выбор даты
  currentDocDate: Date | null = null;
  tempDocDate: Date | null = null;

  // Поиск по номеру документа
  docNumFilterValue: string | null = null;
  tempDocNumFilterValue: string | null = null;

  // Поиск по лицевому счёту
  accountFilterValue: string | null = null;
  tempAccountFilterValue: string | null = null;

  // Поиск по коду ТОФК
  tofkFilterValue: string | null = null;
  tempTofkFilterValue: string | null = null;

  availableFilters: FilterOption[] = [];
  subsystemOptions: SubsystemOption[] = [];
  allDocTypeOptions: DocTypeOption[] = [];
  allStatusOptions: StatusOption[] = [];
  // доступные опции для селектов
  docTypeFilterOptions: DocTypeOption[] = [];
  statusTreeNodes: NzTreeNodeOptions[] = [];

  // Каскадные фильтры
  dateFilterVisible = false;
  docNumFilterVisible = false;
  accountFilterVisible = false;
  tofkFilterVisible = false;

  // Связанные фильтры
  subsystemFilterVisible = false;
  docTypeFilterVisible = false;
  statusFilterVisible = false;

  // Свойства для связанных фильтров
  subsystemFilterValue: string | null = null;
  tempSubsystemFilter: string | null = null;
  docTypeFilterValue: string[] = [];
  tempDocTypeFilter: string[] = [];
  statusFilterValue: string[] = [];
  tempStatusFilter: string[] = [];

  // Примененные фильтры (для сравнения)
  appliedFilters: AppliedFilters = {
    docNum: null,
    account: null,
    tofk: null,
    subsystem: null,
    docType: [],
    status: [],
    date: null
  };
  // Сортировка
  sortableColumns: string[] = [];
  // Текущая сортировка
  currentSort: SortCriterion[] = [];

  // Состояние сортировки для каждой колонки
  sortState: { [key: string]: SortDirection } = {};

  constructor(
    private documentApiService: DocumentApiService,
    private documentOpenService: DocumentOpenService,
    private navigationNodesService: NavigationNodesService,
    private modalService: ModalService,
    private message: NzMessageService,
    private notification: NzNotificationService
  ) {}

  ngOnInit(): void {
    // Загружаем документы при инициализации
    this.loadDocuments();

    // Инициализируем примененные фильтры
    this.saveAppliedFilters();
  }

  ngOnDestroy(): void {
  }

  /**
   * Переключает режим отображения документов
   */
  switchScope(scope: string): void {
    const newScope = scope as Scope;
    if (this.currentScope !== newScope) {
      this.currentScope = newScope;
      // Очищаем сортировку при смене области и перезагружаем
      this.reloadAll()
    }
  }

  /**
   * Проверяет, активен ли указанный режим
   */
  isScopeActive(scope: string): boolean {
    return this.currentScope === scope as Scope;
  }

  /**
   * Загружает документы
   */
  loadDocuments(): void {
    this.loading = true;
    const page = this.pageIndex - 1;

    const params: DocumentParams = {
      page: page,
      size: this.pageSize,
      filters: {
        subsystemFilters: [],
        columnFilters: [],
        filterDate: null
      },
      sort: this.currentSort
    };

    this.addDateFilterToParams(params);
    this.applyColumnFilters(params);

    // Применяем связанные фильтры
    this.addSubsystemFilterToParams(params);

    const request =
      this.documentApiService.getDocuments( params, this.currentScope)

    request.subscribe({
      next: (response) => {
        // Обновляем данные
        this.documents = response.page.documents;
        this.total = response.page.pagination.totalElements;

        if (response.filters) {
          this.updateFiltersFromResponse(response.filters);
        }
      },
      error: (error) => {
        console.error('Ошибка загрузки документов:', error);
        this.notification.error('Ошибка', 'Не удалось загрузить документы');
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  /**
   * Обработчик изменения страницы
   */
  onPageIndexChange(pageIndex: number): void {
    this.pageIndex = pageIndex;
    this.loadDocuments();
  }

  /**
   * Обработчик изменения размера страницы
   */
  onPageSizeChange(pageSize: number): void {
    this.pageSize = pageSize;
    this.pageIndex = 1; // Сбрасываем на первую страницу
    this.loadDocuments();
  }

  /**
   * Обработчик изменения сортировки
   * Ограничение: искусственно запрещаю сортировки по нескольким столбцам сразу
   * из-за косяка с отображением фильтров
   */
  onSortChange(sort: any): void {
    const columnName = sort.key;

    // Проверяем, поддерживается ли сортировка для данной колонки
    if (columnName && !this.isColumnSortable(columnName)) {
      return;
    }

    let direction = this.resolveDirection(sort);

    // Если направление сортировки не null
    if (direction) {
      // Обновляем состояние сортировки
      this.sortState[columnName] = direction;
      const sortCriterion: SortCriterion = {
        field: columnName,
        direction: direction
      }
      // 1 Фильтр сортировки на запрос
      let findIndex = this.currentSort
        .findIndex(e => e.field === columnName);

      if (findIndex > -1 ) {
        this.currentSort[findIndex] = sortCriterion;
      } else {
        this.currentSort.push(sortCriterion);
      }
    } else {
      delete this.sortState[columnName];
      const existingSortIndex = this.currentSort.findIndex(
        (sort: SortCriterion) => sort.field === columnName
      );

      if (existingSortIndex !== -1) {
        // удаляем из фильтров для сортировки
        this.currentSort.splice(existingSortIndex, 1);
      }
    }

    // Загружаем документы с новой сортировкой
    this.loadDocuments();
  }

  /**
   * Обработчик клика по подсистеме
   */
  onSubsystemClick(document: Document): void {
    const subsystem = document.subsystem;
    const docType = document.docTypeId;

    this.navigationNodesService.getNavigationNodes(subsystem, docType)
      .subscribe({
        next: (nodes) => {
          if (nodes.length > 0) {
            this.modalService.showNavigationNodesModal({
              nodes: nodes,
              subsystem: subsystem,
              docType: docType
            });
          } else {
            this.message.warning('Навигационные узлы не найдены');
          }
        },
        error: (error) => {
          console.error('Ошибка получения навигационных узлов:', error);
          this.notification.error('Ошибка', 'Не удалось получить навигационные узлы');
        }
      });
  }

  /**
   * Форматирует дату
   */
  formatDate(dateArray: number[]): string {
    if (!dateArray || !Array.isArray(dateArray) || dateArray.length < 3) return '';

    const [year, month, day, hour, minute, second] = dateArray;
    const date = new Date(year, month - 1, day, hour || 0, minute || 0, second || 0);

    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: hour !== undefined ? '2-digit' : undefined,
      minute: minute !== undefined ? '2-digit' : undefined
    });
  }

  /**
   * Проверяет, является ли колонка сортируемой
   */
  isColumnSortable(columnName: string): boolean {
    return this.sortableColumns.includes(columnName);
  }

  /**
   * Обработчик изменения текущих данных страницы
   */
  onCurrentPageDataChange(data: readonly Document[]): void {
    // пока нет логики
  }

  onDocNumClick(document: Document, event: Event): void {
    event.stopPropagation();
    this.documentOpenService.openDocument(document);
  }

  reloadAll(): void {
    this.resetAllFilters();
    this.loadDocuments();
  }

  isDocNumFilterActive(): boolean {
    return this.isTextFilterActive(this.docNumFilterValue);
  }

  isMessageDateFilterActive(): boolean {
    return this.currentDocDate !== null;
  }

  getCurrentDocDate(): string {
    if (!this.currentDocDate) {
      return "";
    }

    return this.currentDocDate.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }

  getCurrentDocNum(): string {
    return this.getCurrentFilterValue(this.docNumFilterValue);
  }

  onDateValueChange(value: Date): void {
    this.tempDocDate = value;
  }

  resetDateFilter(): void {
    this.currentDocDate = null;
    this.tempDocDate = null;
    this.dateFilterVisible = false;
  }

  applyDateFilter(): void {
    this.currentDocDate = this.tempDocDate;
    this.dateFilterVisible = false;
  }

  /**
   * Применяет фильтр по номеру документа
   */
  applyDocNumFilter(): void {
    this.docNumFilterValue = this.tempDocNumFilterValue;
    this.docNumFilterVisible = false;
  }

  onDateFilterOpen(): void {
    this.tempDocDate = this.currentDocDate;
  }

  onDocNumFilterOpen(): void {
    this.tempDocNumFilterValue = this.docNumFilterValue || '';
  }

  resetDocNumFilter(): void {
    this.docNumFilterValue = null;
    this.tempDocNumFilterValue = null;
    this.docNumFilterVisible = false;
  }

  // Методы для фильтра по лицевому счёту
  isAccountFilterActive(): boolean {
    return this.isTextFilterActive(this.accountFilterValue);
  }

  getCurrentAccount(): string {
    return this.getCurrentFilterValue(this.accountFilterValue);
  }

  onAccountFilterOpen(): void {
    this.tempAccountFilterValue = this.accountFilterValue || '';
  }

  applyAccountFilter(): void {
    this.accountFilterValue = this.tempAccountFilterValue;
    this.accountFilterVisible = false;
  }

  resetAccountFilter(): void {
    this.accountFilterValue = null;
    this.tempAccountFilterValue = null;
    this.accountFilterVisible = false;
  }

  isTofkFilterActive(): boolean {
    return this.isTextFilterActive(this.tofkFilterValue);
  }

  getCurrentTofk(): string {
    return this.getCurrentFilterValue(this.tofkFilterValue);
  }

  onTofkFilterOpen(): void {
    this.tempTofkFilterValue = this.tofkFilterValue || '';
  }

  applyTofkFilter(): void {
    this.tofkFilterValue = this.tempTofkFilterValue;
    this.tofkFilterVisible = false;
  }

  resetTofkFilter(): void {
    this.tofkFilterValue = null;
    this.tempTofkFilterValue = null;
    this.tofkFilterVisible = false;
  }

  isSubsystemFilterActive(): boolean {
    return this.subsystemFilterValue !== null
      && this.subsystemFilterValue.trim() !== '';
  }

  getCurrentSubsystem(): string {
    const code = this.subsystemFilterValue;
    return code ? (this.subsystemOptions.find(o => o.value === code)?.label || code) : '';
  }

  onSubsystemFilterOpen(): void {
    this.tempSubsystemFilter = this.subsystemFilterValue || '';
  }

  onTempSubsystemFilterChange(value: string | null): void {
    this.tempSubsystemFilter = value;
    this.tempDocTypeFilter = [];
    this.tempStatusFilter = [];
    this.updateDocTypeFilterOptions(value);
    this.updateStatusFilterOptions([]);
  }

  applySubsystemFilter(): void {
    this.subsystemFilterValue = this.tempSubsystemFilter;
    // при смене подсистемы очищаем связанные значения
    this.docTypeFilterValue = [];
    this.statusFilterValue = [];
    this.updateDocTypeFilterOptions(this.subsystemFilterValue);
    this.updateStatusFilterOptions([]);
    this.subsystemFilterVisible = false;
  }

  resetSubsystemFilter(): void {
    this.subsystemFilterValue = null;
    this.tempSubsystemFilter = null;
    this.docTypeFilterValue = [];
    this.tempDocTypeFilter = [];
    this.statusFilterValue = [];
    this.tempStatusFilter = [];
    this.docTypeFilterOptions = [];
    this.statusTreeNodes = [];
    this.subsystemFilterVisible = false;
  }

  isDocTypeFilterActive(): boolean {
    return this.docTypeFilterValue.length > 0;
  }

  getCurrentDocType(): string {
    return this.docTypeFilterValue.length > 0
      ? this.docTypeFilterValue
          .map(id => this.allDocTypeOptions.find(o => o.value === id)?.label || id)
          .join(', ')
      : '';
  }

  onDocTypeFilterOpen(): void {
    this.tempDocTypeFilter = [...this.docTypeFilterValue];
  }

  onTempDocTypeFilterChange(values: string[]): void {
    this.tempDocTypeFilter = values;
    this.updateStatusFilterOptions(values);
  }

  applyDocTypeFilter(): void {
    this.docTypeFilterValue = [...this.tempDocTypeFilter];
    this.updateStatusFilterOptions(this.docTypeFilterValue);
    this.docTypeFilterVisible = false;
  }

  resetDocTypeFilter(): void {
    this.docTypeFilterValue = [];
    this.tempDocTypeFilter = [];
    this.docTypeFilterVisible = false;
    this.statusFilterValue = [];
    this.tempStatusFilter = [];
    this.updateStatusFilterOptions([]);
  }

  isStatusFilterActive(): boolean {
    return this.statusFilterValue.length > 0;
  }

  getCurrentStatus(): string {
    return this.statusFilterValue.length > 0
      ? this.statusFilterValue
          .map(val => this.allStatusOptions.find(o => o.value === val)?.label || val)
          .join(', ')
      : '';
  }

  onStatusFilterOpen(): void {
    this.tempStatusFilter = [...this.statusFilterValue];
    this.updateStatusFilterOptions(this.docTypeFilterValue);
  }

  onTempStatusFilterChange(values: string[]): void {
    this.tempStatusFilter = values;
  }

  applyStatusFilter(): void {
    this.statusFilterValue = [...this.tempStatusFilter];
    this.statusFilterVisible = false;
  }

  resetStatusFilter(): void {
    this.statusFilterValue = [];
    this.tempStatusFilter = [];
    this.statusFilterVisible = false;
  }

  /**
   * Проверяет, есть ли активные фильтры для применения
   */
  hasActiveFilters(): boolean {
    return this.hasFilterChanges();
  }

  /**
   * Проверяет, есть ли примененные фильтры
   */
  hasAnyAppliedFilters(): boolean {
    return this.appliedFilters.docNum !== null ||
           this.appliedFilters.account !== null ||
           this.appliedFilters.tofk !== null ||
           this.appliedFilters.subsystem !== null ||
           this.appliedFilters.docType.length > 0 ||
           this.appliedFilters.status.length > 0 ||
           this.appliedFilters.date !== null;
  }

  /**
   * Применяет все активные фильтры и загружает документы
   */
  applyAllFilters(): void {
    const hasChanges = this.hasActiveFilters();

    if (hasChanges) {
      // Если есть изменения в фильтрах, сбрасываем на первую страницу
      this.pageIndex = 1;
      // Сохраняем текущие фильтры как примененные
      this.saveAppliedFilters();
    }
    // Если нет изменений, сохраняем текущую пагинацию

    this.loadDocuments();
  }

  // Ограничение на выбор даты (3 дня до текущей даты и после 2 дней)
  disableOutside3Days(current: Date): boolean {
    const today = new Date();
    const minDate = new Date(today);
    const maxDate = new Date(today);

    minDate.setDate(today.getDate() - 3);
    maxDate.setDate(today.getDate() + 2);

    return current < minDate || current > maxDate;
  }

  /**
   * Обработчик клика по ссылке на документ(ToDo:Доделать!!!)
   * @param document - документ
   * @param event - событие
   */
  onDocLinkClick(document: Document): void {
    console.log('onDocLinkClick', document);
    this.documentOpenService.openDocument(document);
  }

  private isTextFilterActive(filterValue: string | null): boolean {
    return filterValue !== null && filterValue.trim() !== '';
  }

  private getCurrentFilterValue(filterValue: string | null): string {
    return filterValue || '';
  }

  /**
   * Применяет фильтр по дате к параметрам запроса
   */
  private addDateFilterToParams(params: DocumentParams): void {
    if (this.isMessageDateFilterActive()) {
      params.filters.filterDate = this.currentDocDate;
    }
  }

  /**
   * Применяет все активные колоночные фильтры к параметрам запроса
   */
  private applyColumnFilters(params: DocumentParams): void {
    this.addDocNumFilterToParams(params);
    this.addAccountFilterToParams(params);
    this.addTofkFilterToParams(params);
  }

  /**
   * Применяет фильтр по номеру документа к параметрам запроса
   */
  private addDocNumFilterToParams(params: DocumentParams): void {
    if (this.isDocNumFilterActive()) {
      const docNumFilter: ColumnFilter = {
        column: 'doc_num',
        searchValue: this.getCurrentFilterValue(this.docNumFilterValue)
      };
      params.filters.columnFilters?.push(docNumFilter);
    }
  }

  /**
   * Применяет фильтр по лицевому счёту к параметрам запроса
   */
  private addAccountFilterToParams(params: DocumentParams): void {
    if (this.isAccountFilterActive()) {
      const accountFilter: ColumnFilter = {
        column: 'account',
        searchValue: this.getCurrentFilterValue(this.accountFilterValue)
      };
      params.filters.columnFilters?.push(accountFilter);
    }
  }

  /**
   * Применяет фильтр по коду ТОФК к параметрам запроса
   */
  private addTofkFilterToParams(params: DocumentParams): void {
    if (this.isTofkFilterActive()) {
      const tofkFilter: ColumnFilter = {
        column: 'tofk',
        searchValue: this.getCurrentFilterValue(this.tofkFilterValue)
      };
      params.filters.columnFilters?.push(tofkFilter);
    }
  }

  /**
   * Обновляет опции фильтра типов документов на основе выбранной подсистемы
   */
  private updateDocTypeFilterOptions(subsystem: string | null): void {
    if (!subsystem) {
      this.docTypeFilterOptions = [];
      return;
    }

    this.docTypeFilterOptions = this.allDocTypeOptions
      .filter(dt => dt.subsystem.value === subsystem);
  }

  /**
   * Обновляет опции фильтра статусов на основе выбранных типов документов
   */
  private updateStatusFilterOptions(docTypeIds: string[]): void {
    const subsystem = this.tempSubsystemFilter || this.subsystemFilterValue;
    if (!subsystem || docTypeIds.length === 0) {
      this.statusTreeNodes = [];
      return;
    }

    this.statusTreeNodes = docTypeIds.map(docTypeId => {
      const docTypeOption = this.allDocTypeOptions.find(
        dt => dt.value === docTypeId && dt.subsystem.value === subsystem
      );
      const children = this.allStatusOptions
        .filter(st => st.subsystem.value === subsystem && st.docType.value === docTypeId)
        .map(st => ({ title: st.label, key: st.value, isLeaf: true }));
      return {
        title: docTypeOption?.label || docTypeId,
        key: docTypeId,
        selectable: false,
        children
      } as NzTreeNodeOptions;
    });
  }

  /**
   * Применяет связанные фильтры (подсистема, тип документа, статус) к параметрам запроса
   */
  private addSubsystemFilterToParams(params: DocumentParams): void {
    if (this.isSubsystemFilterActive()) {
      const subsystemFilter: SubsystemFilter = {
        subsystem: this.subsystemFilterValue!,
        documentTypes: []
      };

      // Добавляем типы документов если они выбраны
      this.addDocTypesId(subsystemFilter);

      if (!params.filters.subsystemFilters) {
        params.filters.subsystemFilters = [];
      }

      params.filters.subsystemFilters.push(subsystemFilter);
    }
  }

  private addDocTypesId(subsystemFilter: SubsystemFilter) {
    if (this.isDocTypeFilterActive()) {
      subsystemFilter.documentTypes = this.docTypeFilterValue
        .map(docTypeId => {
          const docTypeFilter: DocumentTypeFilter = {
            documentTypeId: docTypeId,
            documentStates: []
          };

          // Добавляем статусы если они выбраны
          this.addDocStatus(docTypeFilter);

          return docTypeFilter;
        });
    }
  }

  private addDocStatus(docTypeFilter: DocumentTypeFilter) {
    if (this.isStatusFilterActive()) {
      docTypeFilter.documentStates = this.statusFilterValue;
    }
  }

  /**
   * Сохраняет текущие фильтры как примененные
   */
  private saveAppliedFilters(): void {
    this.appliedFilters = {
      docNum: this.docNumFilterValue,
      account: this.accountFilterValue,
      tofk: this.tofkFilterValue,
      subsystem: this.subsystemFilterValue,
      docType: [...this.docTypeFilterValue],
      status: [...this.statusFilterValue],
      date: this.currentDocDate ? new Date(this.currentDocDate) : null
    };
  }

  /**
   * Сравниваем два массива
   */
  private arraysEqual(arr1: string[], arr2: string[]): boolean {
    if (arr1.length !== arr2.length) {
      return false;
    }
    return arr1.every((value, index) => value === arr2[index]);
  }

  /**
   * Сравниваем две даты
   */
  private datesEqual(date1: Date | null, date2: Date | null): boolean {
    if (date1 === null && date2 === null) {
      return true;
    }
    if (date1 === null || date2 === null) {
      return false;
    }
    return date1.getTime() === date2.getTime();
  }

  /**
   * Проверяем, есть ли изменения в фильтрах по сравнению с примененными
   */
  private hasFilterChanges(): boolean {
    // Проверяем фильтр по номеру документа
    if (this.docNumFilterValue !== this.appliedFilters.docNum) {
      return true;
    }

    // Проверяем фильтр по лицевому счёту
    if (this.accountFilterValue !== this.appliedFilters.account) {
      return true;
    }

    // Проверяем фильтр по коду ТОФК
    if (this.tofkFilterValue !== this.appliedFilters.tofk) {
      return true;
    }

    // Проверяем фильтр по подсистеме
    if (this.subsystemFilterValue !== this.appliedFilters.subsystem) {
      return true;
    }

    // Проверяем фильтр по типу документа
    if (!this.arraysEqual(this.docTypeFilterValue, this.appliedFilters.docType)) {
      return true;
    }

    // Проверяем фильтр по статусу
    if (!this.arraysEqual(this.statusFilterValue, this.appliedFilters.status)) {
      return true;
    }

    // Проверяем фильтр по дате
    return !this.datesEqual(this.currentDocDate, this.appliedFilters.date);
  }

  private resolveDirection(sort: { key: string; value: 'ascend' | 'descend' | null }) {
    let direction;
    if (sort.value === 'ascend') {
      direction = SortDirection.ASC;
    } else if (sort.value === 'descend') {
      direction = SortDirection.DESC;
    }
    return direction;
  }

  /**
   * Обновляет данные фильтров из ответа API
   */
  private updateFiltersFromResponse(filters: any): void {
    if (filters && filters.filterOptions) {
      this.availableFilters = filters.filterOptions;

      this.subsystemOptions = [];
      this.allDocTypeOptions = [];
      this.allStatusOptions = [];

      this.availableFilters.forEach(f => {
        const subsystem: SubsystemOption = {
          label: f.subsystemName,
          value: f.subsystem
        };
        this.subsystemOptions.push(subsystem);

        f.docTypes.forEach(dt => {
          const docType: DocTypeOption = {
            label: dt.docTypeName,
            value: dt.docTypeId,
            subsystem
          };
          this.allDocTypeOptions.push(docType);

          dt.docStates.forEach(state => {
            this.allStatusOptions.push({
              label: state,
              value: state,
              subsystem,
              docType
            });
          });
        });
      });

      if (this.subsystemOptions.length === 1) {
        const subsys = this.subsystemOptions[0].value;
        this.subsystemFilterValue = this.subsystemFilterValue || subsys;
        this.updateDocTypeFilterOptions(this.subsystemFilterValue);
      } else {
        this.docTypeFilterOptions = [];
        this.statusTreeNodes = [];
      }
    }

    if (filters && filters.sortable) {
      this.sortableColumns = filters.sortable;
    }
  }

  private resetAllFilters(): void {
    // Сброс фильтров по номеру документа
    this.docNumFilterValue = null;
    this.tempDocNumFilterValue = null;
    this.docNumFilterVisible = false;

    // Сброс фильтров по дате
    this.currentDocDate = null;
    this.tempDocDate = null;
    this.dateFilterVisible = false;

    // Сброс фильтров по лицевому счёту
    this.accountFilterValue = null;
    this.tempAccountFilterValue = null;
    this.accountFilterVisible = false;

    // Сброс фильтров по коду ТОФК
    this.tofkFilterValue = null;
    this.tempTofkFilterValue = null;
    this.tofkFilterVisible = false;

    // Сброс новых связанных фильтров
    this.subsystemFilterValue = null;
    this.tempSubsystemFilter = null;
    this.subsystemFilterVisible = false;
    this.docTypeFilterValue = [];
    this.tempDocTypeFilter = [];
    this.docTypeFilterVisible = false;
    this.statusFilterValue = [];
    this.tempStatusFilter = [];
    this.statusFilterVisible = false;
    this.subsystemOptions = [];
    this.allDocTypeOptions = [];
    this.allStatusOptions = [];
    this.docTypeFilterOptions = [];
    this.statusTreeNodes = [];

    // Сброс сортировки(пока условно)
    this.currentSort = [];
    this.sortState = {};

    // Сбрасываем на первую страницу, но не загружаем документы автоматически
    this.pageIndex = 1;

    // Сбрасываем примененные фильтры
    this.appliedFilters = {
      docNum: null,
      account: null,
      tofk: null,
      subsystem: null,
      docType: [],
      status: [],
      date: null
    };
  }
}
