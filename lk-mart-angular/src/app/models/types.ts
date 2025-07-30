/**
 * Интерфейсы для типов данных приложения LK Mart
 */

export interface NavigationNode {
  id: string;
  name: string;
  url: string;
  subsystem?: string;
  docType?: string;
  [key: string]: any;
}

export interface Document {
  messageDate: number[];
  subsystem: string;
  docGUID: string;
  subsystemName: string;
  docTypeId: string;
  docTypeName: string;
  docState: string;
  organization: string;
  users: string[];
  document: {
    docDate: number[];
    docNum: string;
    tofk: string;
    account: string;
  };
  [key: string]: any;
}

export interface PaginationInfo {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Устаревший интерфейс - заменен на DocumentsPageResponse
export interface DocumentsResponse {
  documents: Document[];
  pagination: PaginationInfo;
}

// Новые типы для обновленного API
export enum Scope {
  USER = 'USER',
  ORG = 'ORG'
}

export enum SortDirection {
  ASC = 'ASC',
  DESC = 'DESC'
}

export interface SortCriterion {
  field: string;
  direction: SortDirection;
}

export interface DocTypeStateFilter {
  docTypeId: string;
  docState?: string[];
}

export interface SubsystemFilterItem {
  subsystem: string;
  docTypes?: DocTypeStateFilter[];
}

export interface DocumentParams {
  page: number;
  size: number;
  filters: SubsystemFilterItem[];
  sort: SortCriterion[];
}

export interface PaginatedDocumentsResponse {
  documents: Document[];
  pagination: PaginationInfo;
}

export interface DocStateFilter {
  docTypeId: string;
  docTypeName: string;
  docStates: string[];
}

export interface FilterOption {
  subsystem: string;
  subsystemName: string;
  docTypes: DocStateFilter[];
}

export interface AvailableDocumentsFilter {
  filterOptions: FilterOption[];
  sortable: string[];
}

export interface DocumentsPageResponse {
  page: PaginatedDocumentsResponse;
  filters: AvailableDocumentsFilter;
  sortable: string[];
  appliedSort: SortCriterion[];
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

export interface ModalData {
  nodes: NavigationNode[];
  subsystem: string;
  docType: string;
}

// AG Grid типы
export interface AgGridColumnDef {
  field: string;
  headerName: string;
  sortable?: boolean;
  filter?: boolean;
  filterParams?: any;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  flex?: number;
  cellRenderer?: string | any;
  cellRendererParams?: any;
  valueFormatter?: (params: any) => string;
  pinned?: 'left' | 'right';
  resizable?: boolean;
  suppressMenu?: boolean;
  menuTabs?: string[];
}

export interface AgGridFilterModel {
  [key: string]: any;
}

export interface AgGridSortModel {
  colId: string;
  sort: 'asc' | 'desc';
}
