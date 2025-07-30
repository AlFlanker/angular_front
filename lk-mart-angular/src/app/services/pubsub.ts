import { Injectable } from '@angular/core';

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

  /**
   * Проверяет доступность ELK и выбрасывает ошибку если недоступен
   * @throws {Error} если ELK недоступен
   */
  private ensureElkAvailable(): void {
    if (!this.isElkAvailable()) {
      console.warn('ELK.pubsub не найден в родительском окне');
      // throw new Error('ELK.pubsub не найден в родительском окне');
    }
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
   * Отписка от события (закомментировано, так как ELK не поддерживает отписку)
   * @param event - название события
   * @param handler - обработчик события
   */
  unsubscribe(event: string, handler: (data: any) => void): void {
    // TODO: Раскомментировать когда ELK будет поддерживать отписку
    // if (this.isElkAvailable()) {
    //   const parentWindow = window.parent as WindowWithELK;
    //   parentWindow.ELK!.pubsub.unsubscribe!(event, handler);
    // }
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
   * Публикация события выбора навигационного узла
   * @param node - выбранный узел
   * @param subsystem - подсистема
   * @param docType - тип документа
   */
  publishNavigationNodeSelected(node: any, subsystem: string, docType: string): void {
    this.publish('navigationNode.selected', {
      node: node,
      subsystem: subsystem,
      docType: docType,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Публикация события отмены выбора навигационного узла
   * @param subsystem - подсистема
   * @param docType - тип документа
   * @param availableNodes - количество доступных узлов
   */
  publishNavigationNodeCancelled(subsystem: string, docType: string, availableNodes: number): void {
    this.publish('navigationNode.cancelled', {
      subsystem: subsystem,
      docType: docType,
      availableNodes: availableNodes,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Публикация события открытия модального окна
   * @param subsystem - подсистема
   * @param docType - тип документа
   * @param availableNodes - количество доступных узлов
   */
  publishModalOpened(subsystem: string, docType: string, availableNodes: number): void {
    this.publish('navigationNode.modal.opened', {
      subsystem: subsystem,
      docType: docType,
      availableNodes: availableNodes,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Публикация события выбора документа
   * @param documentId - ID документа
   * @param documentName - название документа
   * @param action - действие
   */
  publishDocumentSelected(documentId: string, documentName: string, action: string): void {
    this.publish('documentSelected', {
      documentId: documentId,
      documentName: documentName,
      action: action
    });
  }

  /**
   * Публикация события обновления данных
   * @param type - тип данных
   * @param count - количество элементов
   */
  publishDataRefreshed(type: string, count: number): void {
    this.publish('dataRefreshed', {
      type: type,
      count: count,
      timestamp: Date.now()
    });
  }
}
