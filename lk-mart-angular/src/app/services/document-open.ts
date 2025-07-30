import { Injectable } from '@angular/core';
import { Document } from '../models/types';

@Injectable({
  providedIn: 'root'
})
export class DocumentOpenService {

  constructor() {}

  /**
   * Открывает документ в новой вкладке
   * @param document - документ для открытия
   */
  openDocument(document: Document): void {
    if (document && document.docGUID) {
      window.parent.postMessage({
        type: 'openDocument',
        documentId: document.docGUID,
        subsystem: document.subsystem
      }, '*');
    }
  }

  /**
   * Открывает документ в модальном окне
   * @param document - документ для открытия
   */
  openDocumentInModal(document: Document): void {
    if (document && document.docGUID) {
      window.parent.postMessage({
        type: 'openDocumentModal',
        documentId: document.docGUID,
        subsystem: document.subsystem
      }, '*');
    }
  }

  /**
   * Открывает документ в iframe
   * @param document - документ для открытия
   */
  openDocumentInIframe(document: Document): void {
    if (document && document.docGUID) {
      window.parent.postMessage({
        type: 'openDocumentIframe',
        documentId: document.docGUID,
        subsystem: document.subsystem,
        url: `/api/documents/${document.docGUID}/view`
      }, '*');
    }
  }

  /**
   * Скачивает документ
   * @param document - документ для скачивания
   */
  downloadDocument(document: Document): void {
    if (document && document.docGUID) {
      window.parent.postMessage({
        type: 'downloadDocument',
        documentId: document.docGUID,
        subsystem: document.subsystem,
        url: `/api/documents/${document.docGUID}/download`
      }, '*');
    }
  }
}
