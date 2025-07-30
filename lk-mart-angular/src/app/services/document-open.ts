import { Injectable } from '@angular/core';
import { PubsubService } from './pubsub';
import { Document } from '../models/types';

@Injectable({
  providedIn: 'root'
})
export class DocumentOpenService {

  constructor(private pubsubService: PubsubService) {}

  /**
   * Открывает документ в новой вкладке
   * @param document - документ для открытия
   */
  openDocument(document: Document): void {
    if (document && document.docGUID) {
      // Отправляем событие о выборе документа
      this.pubsubService.publishDocumentSelected(
        document.docGUID, 
        document.subsystem, 
        'open'
      );
      
      // Открываем документ в новой вкладке
      window.open(`/api/documents/${document.docGUID}/view`, '_blank');
    }
  }

  /**
   * Открывает документ в модальном окне
   * @param document - документ для открытия
   */
  openDocumentInModal(document: Document): void {
    if (document && document.docGUID) {
      // Отправляем событие о выборе документа
      this.pubsubService.publishDocumentSelected(
        document.docGUID, 
        document.subsystem, 
        'modal'
      );
      
      // Здесь можно добавить логику открытия модального окна
      console.log('Открытие документа в модальном окне:', document);
    }
  }

  /**
   * Открывает документ в iframe
   * @param document - документ для открытия
   */
  openDocumentInIframe(document: Document): void {
    if (document && document.docGUID) {
      // Отправляем событие о выборе документа
      this.pubsubService.publishDocumentSelected(
        document.docGUID, 
        document.subsystem, 
        'iframe'
      );
      
      // Отправляем событие для открытия в iframe
      this.pubsubService.publish('openDocumentIframe', {
        documentId: document.docGUID,
        documentName: document.subsystem,
        url: `/api/documents/${document.docGUID}/view`
      });
    }
  }

  /**
   * Скачивает документ
   * @param document - документ для скачивания
   */
  downloadDocument(document: Document): void {
    if (document && document.docGUID) {
      // Отправляем событие о выборе документа
      this.pubsubService.publishDocumentSelected(
        document.docGUID, 
        document.subsystem, 
        'download'
      );
      
      // Создаем ссылку для скачивания
      const link = document['createElement']('a');
      link.href = `/api/documents/${document.docGUID}/download`;
      link.download = document.subsystem || `document-${document.docGUID}`;
      link.click();
    }
  }
}
