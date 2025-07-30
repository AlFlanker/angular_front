import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DocumentsPageResponse, Document, DocumentParams, Scope, SubsystemFilterItem, DocTypeStateFilter, SortCriterion, SortDirection } from '../models/types';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DocumentApiService {

  private readonly API_BASE_URL = `${environment.apiUrl}/documents`; // Базовый URL для API

  constructor(private http: HttpClient) {}

  /**
   * Получает список документов с пагинацией
   * @param params - параметры запроса (страница, размер, фильтры, сортировка)
   * @param scope - область поиска (USER или ORG)
   * @returns Observable с ответом API
   *
   * Пример использования:
   * ```typescript
   * const params: DocumentParams = {
   *   page: 0,
   *   size: 20,
   *   filters: [
   *     {
   *       subsystem: 'SUBSYSTEM1',
   *       docTypes: [
   *         { docTypeId: 'TYPE1', docState: ['ACTIVE', 'DRAFT'] }
   *       ]
   *     }
   *   ],
   *   sort: [
   *     { field: 'createdDate', direction: SortDirection.DESC }
   *   ]
   * };
   * this.getDocuments(params, Scope.USER).subscribe(response => {
   *   console.log('Документы:', response.page.documents);
   *   console.log('Фильтры:', response.filters);
   * });
   * ```
   */
  getDocuments(params: DocumentParams, scope: Scope = Scope.USER): Observable<DocumentsPageResponse> {
    return this.http.post<DocumentsPageResponse>(`${this.API_BASE_URL}/${scope}`, params);
  }

  /**
   * Получает документы с базовыми параметрами пагинации
   * @param page - номер страницы (начиная с 0)
   * @param size - размер страницы
   * @param scope - область поиска (USER или ORG)
   * @returns Observable с ответом API
   */
  getDocumentsSimple(page: number = 0, size: number = 20, scope: Scope = Scope.USER): Observable<DocumentsPageResponse> {
    const params: DocumentParams = {
      page,
      size,
      filters: [],
      sort: []
    };

    return this.getDocuments(params, scope);
  }

  /**
   * Получает документ по ID
   * @param id - ID документа
   * @returns Observable с документом
   */
  getDocument(id: string): Observable<Document> {
    return this.http.get<Document>(`${this.API_BASE_URL}/${id}`);
  }

  /**
   * Создает новый документ
   * @param document - данные документа
   * @returns Observable с созданным документом
   */
  createDocument(document: Partial<Document>): Observable<Document> {
    return this.http.post<Document>(this.API_BASE_URL, document);
  }

  /**
   * Обновляет документ
   * @param id - ID документа
   * @param document - данные для обновления
   * @returns Observable с обновленным документом
   */
  updateDocument(id: string, document: Partial<Document>): Observable<Document> {
    return this.http.put<Document>(`${this.API_BASE_URL}/${id}`, document);
  }

  /**
   * Удаляет документ
   * @param id - ID документа
   * @returns Observable с результатом операции
   */
  deleteDocument(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_BASE_URL}/${id}`);
  }

  /**
   * Поиск документов по фильтрам
   * @param filters - массив фильтров по подсистемам
   * @param page - номер страницы
   * @param size - размер страницы
   * @param scope - область поиска (USER или ORG)
   * @returns Observable с результатами поиска
   */
  searchDocuments(filters: SubsystemFilterItem[], page: number = 0, size: number = 20, scope: Scope = Scope.USER): Observable<DocumentsPageResponse> {
    const params: DocumentParams = {
      page,
      size,
      filters,
      sort: []
    };

    return this.getDocuments(params, scope);
  }

  /**
   * Получает документы с сортировкой
   * @param sortCriteria - критерии сортировки
   * @param page - номер страницы
   * @param size - размер страницы
   * @param scope - область поиска (USER или ORG)
   * @returns Observable с результатами
   */
  getDocumentsWithSort(sortCriteria: SortCriterion[], page: number = 0, size: number = 20, scope: Scope = Scope.USER, filters: SubsystemFilterItem[]): Observable<DocumentsPageResponse> {
    const params: DocumentParams = {
      page,
      size,
      filters: filters,
      sort: sortCriteria
    };

    return this.getDocuments(params, scope);
  }
}
