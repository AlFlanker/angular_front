import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Document, PaginationInfo } from '../models/types';
import { PubsubService } from './pubsub';

@Injectable({
  providedIn: 'root'
})
export class DocumentListService {

  private documentsSubject = new BehaviorSubject<Document[]>([]);
  private paginationSubject = new BehaviorSubject<PaginationInfo>({
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0,
    hasNext: false,
    hasPrevious: false
  });

  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);

  public documents$ = this.documentsSubject.asObservable();
  public pagination$ = this.paginationSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();
  public error$ = this.errorSubject.asObservable();

  constructor(private pubsubService: PubsubService) {}

  /**
   * Обновляет список документов
   * @param documents - новый список документов
   */
  updateDocuments(documents: Document[]): void {
    this.documentsSubject.next(documents);
    // Публикуем событие только если ELK доступен
    if (this.pubsubService.isElkAvailable()) {
      this.pubsubService.publishDataRefreshed('documents', documents.length);
    }
  }

  /**
   * Обновляет информацию о пагинации
   * @param pagination - новая информация о пагинации
   */
  updatePagination(pagination: PaginationInfo): void {
    this.paginationSubject.next(pagination);
  }

  /**
   * Устанавливает состояние загрузки
   * @param loading - состояние загрузки
   */
  setLoading(loading: boolean): void {
    this.loadingSubject.next(loading);
  }

  /**
   * Устанавливает ошибку
   * @param error - сообщение об ошибке
   */
  setError(error: string | null): void {
    this.errorSubject.next(error);
  }

  /**
   * Очищает ошибку
   */
  clearError(): void {
    this.errorSubject.next(null);
  }

  /**
   * Получает текущий список документов
   */
  getCurrentDocuments(): Document[] {
    return this.documentsSubject.value;
  }

  /**
   * Получает текущую информацию о пагинации
   */
  getCurrentPagination(): PaginationInfo {
    return this.paginationSubject.value;
  }

  /**
   * Добавляет документ в список
   * @param document - документ для добавления
   */
  addDocument(document: Document): void {
    const currentDocuments = this.getCurrentDocuments();
    this.updateDocuments([...currentDocuments, document]);
  }

  /**
   * Обновляет документ в списке
   * @param document - обновленный документ
   */
  updateDocument(document: Document): void {
    const currentDocuments = this.getCurrentDocuments();
    const updatedDocuments = currentDocuments.map(doc =>
      doc.docGUID === document.docGUID ? document : doc
    );
    this.updateDocuments(updatedDocuments);
  }

  /**
   * Удаляет документ из списка
   * @param documentId - ID документа для удаления
   */
  removeDocument(documentId: string): void {
    const currentDocuments = this.getCurrentDocuments();
    const filteredDocuments = currentDocuments.filter(doc => doc.docGUID !== documentId);
    this.updateDocuments(filteredDocuments);
  }

  /**
   * Очищает список документов
   */
  clearDocuments(): void {
    this.updateDocuments([]);
  }
}
