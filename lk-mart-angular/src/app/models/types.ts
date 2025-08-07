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

export interface DocumentTypeFilter {
  documentTypeId: string;
  documentStates?: string[];
}

export interface SubsystemFilter {
  subsystem: string;
  documentTypes?: DocumentTypeFilter[];
}

export interface DocumentParams {
  page: number;
  size: number;
  filters: DocumentFilters;
  sort: SortCriterion[];
}

export interface DocumentFilters {
  subsystemFilters?: SubsystemFilter[] | null,
  columnFilters?: ColumnFilter[] | null,
  filterDate?: Date | null
}

export interface ColumnFilter {
  column: string,
  searchValue: string
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

export interface ModalData {
  nodes: NavigationNode[];
  subsystem: string;
  docType: string;
}

export interface AppliedFilters {
  docNum: string | null;
  account: string | null;
  tofk: string | null;
  subsystem: string | null;
  docType: string[];
  status: string[];
  date: Date | null;
}
