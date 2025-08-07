import {Injectable} from '@angular/core';
import {Document} from '../models/types';

// Типы для ELK
interface ELKPubSub {
  subscribe: (event: string, callback: (data: any) => void) => void;
  publish: (event: string, data: any) => void;
  unsubscribe?: (event: string, handler: (data: any) => void) => void;
}

interface ELK {
  pubsub: ELKPubSub;
}

interface WindowWithELK extends Window {
  ELK?: ELK;
}

/**
 * Сервис для работы с pubsub механизмом
 * Централизованное управление всеми событиями ELK
 */
@Injectable({
  providedIn: 'root'
})
export class PubsubService {

  /**
   * Проверяет доступность ELK в родительском окне
   * @returns {boolean} true если ELK доступен
   */
  /**
   * Проверяет доступность ELK в родительском окне
   * @returns true если ELK доступен
   */
  public isElkAvailable(): boolean {
    const parentWindow = window.parent as WindowWithELK;
    return !!(parentWindow && parentWindow.ELK && parentWindow.ELK.pubsub);
  }

  constructor() {
    // Проверяем доступность при инициализации
    if (!this.isElkAvailable()) {
      console.warn('ELK.pubsub не найден в родительском окне. Приложение будет работать в автономном режиме.');
    }
  }

  /**
   * Подписка на событие
   * @param event - название события
   * @param callback - функция обратного вызова
   */
  subscribe(event: string, callback: (data: any) => void): void {
    if (!this.isElkAvailable()) {
      console.warn(`ELK.pubsub недоступен, подписка на событие "${event}" не будет выполнена`);
      return;
    }
    const parentWindow = window.parent as WindowWithELK;
    parentWindow.ELK!.pubsub.subscribe(event, callback);
  }

  /**
   * Публикация события
   * @param event - название события
   * @param data - данные события
   */
  publish(event: string, data: any): void {
    if (!this.isElkAvailable()) {
      console.warn(`ELK.pubsub недоступен, событие "${event}" не будет опубликовано`);
      return;
    }
    const parentWindow = window.parent as WindowWithELK;
    parentWindow.ELK!.pubsub.publish(event, data);
  }

  /**
   * Публикация события открытия списка документов
   * @param node - узел навигации
   */
  publishOpenDocumentList(node: any): void {
    this.publish('openDocumentListIframe', { node: node });
  }
  /**
   * Публикация события выбора документа
   */
  publishDocumentSelected(document: Document): void {
    this.publish('openDocumentByLink', {
      title: 'Документ',
      globalDocumentId: document.docGUID,
      action: 'EDIT',
      documentType: document.docTypeId,
      subSystem: document.subsystem
    });
  }
}
