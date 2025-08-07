import {Injectable} from '@angular/core';
import {PubsubService} from './pubsub';
import {Document} from '../models/types';

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
      this.pubsubService.publishDocumentSelected(document);
    }
  }
}
