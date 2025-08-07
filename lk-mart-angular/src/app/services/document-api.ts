import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {DocumentParams, DocumentsPageResponse, Scope} from '../models/types';
import {environment} from '../../environments/environment';
import {CONTEXT_PATH_URL} from './context-config';

@Injectable({
  providedIn: 'root'
})
export class DocumentApiService {

  private readonly API_BASE_URL = `${CONTEXT_PATH_URL}${environment.apiUrl}/documents`;

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
}
