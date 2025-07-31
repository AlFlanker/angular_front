import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';

import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import {
  Document,
  Scope,
  FilterOption,
  SortCriterion,
  SortDirection, SubsystemFilterItem, DocumentParams
} from '../../models/types';
import { DocumentApiService } from '../../services/document-api';
import { DocumentListService } from '../../services/document-list';
import { DocumentOpenService } from '../../services/document-open';
import { NavigationNodesService } from '../../services/navigation-nodes';
import { ModalService } from '../../services/modal';
import { PubsubService } from '../../services/pubsub';

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
    NzToolTipModule,
    NzBadgeModule,
    NzAvatarModule,
    NzDescriptionsModule,
    NzModalModule
  ],
  templateUrl: './document-table.html',
  styleUrl: './document-table.css'
})
export class DocumentTableComponent implements OnInit, OnDestroy {

  documents: Document[] = [];
  loading = false;
  error: string | null = null;
  currentScope: Scope = Scope.USER;
  selectedRow: Document | null = null;

  pageIndex = 1;
  pageSize = 10;
  total = 0;

  // Доступные фильтры
  availableFilters: FilterOption[] = [];
  subsystemFilterOptions: Array<{ text: string; value: string; byDefault?: boolean }> = [];
  docTypeFiltersOptions: Array<{ text: string; value: string }> = [];
  docStateFiltersOptions: Array<{ text: string; value: any }> = [];
  // список всех выбранных фильтров
  selectedOptions: SubsystemFilterItem[] = [];
  // Сортировка
  sortableColumns: string[] = [];
  // Текущая сортировка
  currentSort: SortCriterion[] = [];

  // Состояние сортировки для каждой колонки
  sortState: { [key: string]: SortDirection } = {};

  private subscriptions: Subscription[] = [];

  constructor(
    private documentApiService: DocumentApiService,
    private documentListService: DocumentListService,
    private documentOpenService: DocumentOpenService,
    private navigationNodesService: NavigationNodesService,
    private modalService: ModalService,
    private pubsubService: PubsubService,
    private message: NzMessageService,
    private notification: NzNotificationService
  ) {}

  ngOnInit(): void {
    // Подписываемся на изменения в сервисе списка документов
    this.subscriptions.push(
      this.documentListService.documents$.subscribe(documents => {
        this.documents = documents;
      }),
      this.documentListService.loading$.subscribe(loading => {
        this.loading = loading;
      }),
      this.documentListService.error$.subscribe(error => {
        this.error = error;
        if (error) {
          this.notification.error('Ошибка', error);
        }
      })
    );

    // Загружаем документы при инициализации
    this.loadDocuments();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  /**
   * Переключает режим отображения документов
   */
  switchScope(scope: string): void {
    const newScope = scope as Scope;
    if (this.currentScope !== newScope) {

      this.currentScope = newScope;
      // Очищаем сортировку при смене области
      this.resetAllFilters();
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
    this.documentListService.setLoading(true);
    this.documentListService.clearError();

    const page = this.pageIndex - 1;

    const params: DocumentParams = {
      page: page,
      size: this.pageSize,
      filters: this.selectedOptions,
      sort: this.currentSort
    };

    const request =
      this.documentApiService.getDocuments(params, this.currentScope)

    request.subscribe({
      next: (response) => {
        // Обновляем данные
        this.documents = response.page.documents;
        this.total = response.page.pagination.totalElements;

        // Обновляем фильтры и колонки из ответа API
        if (response.filters) {
          this.updateFiltersFromResponse(response.filters);
        }
      },
      error: (error) => {
        console.error('Ошибка загрузки документов:', error);
        this.documentListService.setError('Ошибка загрузки документов: ' + error.message);
        this.documentListService.updateDocuments([]);
        this.notification.error('Ошибка', 'Не удалось загрузить документы');
      },
      complete: () => {
        this.documentListService.setLoading(false);
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
      this.currentSort = [sortCriterion];
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
   * Обработчик клика по подсистеме
   */
  onSubsystemClick(document: Document): void {
    const subsystem = document['subsystem'] || '';
    const docType = document.docTypeId || '';

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
   * Обновляет данные фильтров из ответа API
   */
  private updateFiltersFromResponse(filters: any): void {
    if (filters && filters.filterOptions) {
      this.availableFilters = filters.filterOptions;
      // Выбор подсистем
      const isOnlyOne = this.availableFilters.length === 1;
      this.subsystemFilterOptions = this.availableFilters.map((dt: FilterOption) => ({
        text: dt.subsystemName,
        value: dt.subsystem,
        byDefault: isOnlyOne
      })) as Array<{ text: string; value: string; byDefault?: boolean }>;
      // Автовыбор подсистемы только при отсутствии пользовательского выбора
      if (isOnlyOne) {
        const subsys = this.subsystemFilterOptions[0].value;
        if (this.selectedOptions.length === 0) {
          this.selectedOptions = this.availableFilters
            .filter(elem => subsys === elem.subsystem)
            .map(elem => this.toSubsystemItem(elem));
        }
        this.updateDocTypeOptions(subsys);
        const docTypeIds =
          this.selectedOptions[0]?.docTypes?.map(dt => dt.docTypeId) || [];
        if (docTypeIds.length > 0) {
          this.updateDocStateOptions(subsys, docTypeIds);
        }
      } else {
        // При наличии нескольких подсистем фильтры типов и статусов очищаем
        this.docTypeFiltersOptions = [];
        this.docStateFiltersOptions = [];
      }
    }


    if (filters && filters.sortable) {
      this.sortableColumns = filters.sortable;
    }
  }

  /**
   * Проверяет, является ли колонка сортируемой
   */
  isColumnSortable(columnName: string): boolean {
    return this.sortableColumns.includes(columnName);
  }

  /**
   * Получает текущее направление сортировки для колонки
   */
  getSortDirection(columnName: string): string | null {
    const dir = this.sortState[columnName];
    if (dir) {
      return dir === SortDirection.ASC
        ? 'ascend'
        : 'descend'
    } else {
      return null;
    }
  }

  /**
   * Обработчик изменения текущих данных страницы
   */
  onCurrentPageDataChange(data: readonly Document[]): void {
    // пока не логики
  }

  /**
   * Выбор эл-та подсистемы
   * @param option
   */
  onSubsystemFilter(option: string | string[]) {
    const opt = Array.isArray(option) ? option : [option];
    this.selectedOptions = this.availableFilters
      .filter(elem => opt.includes(elem.subsystem))
      .map(elem => this.toSubsystemItem(elem));

    this.updateDocTypeOptions(this.selectedOptions[0]?.subsystem || '');
    this.docStateFiltersOptions = [];

    this.loadDocuments();
  }

  private updateDocTypeOptions(subsystem: string): void {
    const sub = this.availableFilters.find(f => f.subsystem === subsystem);
    this.docTypeFiltersOptions = sub
      ? sub.docTypes.map(dt => ({ text: dt.docTypeName, value: dt.docTypeId }))
      : [];
  }

  private updateDocStateOptions(subsystem: string, docTypeIds: string[]): void {
    this.docStateFiltersOptions = [];
    const sub = this.availableFilters
      .find(f => f.subsystem === subsystem);
    if (!sub) { return; }
    sub.docTypes.forEach(dt => {
      if (docTypeIds.includes(dt.docTypeId)) {
        dt.docStates.forEach(state => {
          this.docStateFiltersOptions.push({
            text: `${dt.docTypeName}: ${state}`,
            value: { docTypeId: dt.docTypeId, state: state }
          });
        });
      }
    });
  }

  onDocTypeFilter(option: string | string[]) {
    const docTypeIds = Array.isArray(option)
      ? option
      : [option];
    if (this.selectedOptions.length === 0) {
      return;
    }
    this.selectedOptions[0].docTypes = docTypeIds
      .map(id => ({ docTypeId: id, docState: [] }));
    let subsystem = this.selectedOptions[0].subsystem;
    this.updateDocStateOptions(subsystem, docTypeIds);
    this.loadDocuments();
  }

  onDocStateFilter(option: any | any[]) {
    const selected = Array.isArray(option) ? option : [option];
    if (this.selectedOptions.length === 0) { return; }
    const map: { [key: string]: string[] } = {};
    selected.forEach((val: any) => {
      const { docTypeId, state } = val;
      if (!map[docTypeId]) { map[docTypeId] = []; }
      map[docTypeId].push(state);
    });
    this.selectedOptions[0].docTypes = Object.keys(map).map(id => ({ docTypeId: id, docState: map[id] }));
    this.loadDocuments();
  }

  onDocNumClick(document: Document, event: Event): void {
    event.stopPropagation();
    this.documentOpenService.openDocumentPostMessage(document);
  }

  onDocTypeClick(document: Document): void {
    this.modalService.showInfoModal('Тип документа', document.docTypeName);
  }

  toSubsystemItem(opt: FilterOption): SubsystemFilterItem {
    return {
      subsystem: opt.subsystem,
      docTypes: []
    };
  }

  resetAllFilters(): void {
    // выбранные фильтры
    this.subsystemFilterOptions = [];
    this.docTypeFiltersOptions = [];
    this.docStateFiltersOptions = [];
    this.selectedOptions = [];
    // сбросить сортировку
    this.currentSort = [];
    this.sortState = {};
    // И обновить данные
    this.pageIndex = 1;
    this.loadDocuments();
  }
}

