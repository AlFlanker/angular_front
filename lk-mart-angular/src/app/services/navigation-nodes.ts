import {Injectable} from '@angular/core';
import {from, Observable} from 'rxjs';
import {NavigationNode} from '../models/types';
import {PubsubService} from './pubsub';

@Injectable({
  providedIn: 'root'
})
export class NavigationNodesService {

  private readonly REQUEST_TIMEOUT_MS = 10000;

  constructor(private pubsubService: PubsubService) {}

  /**
   * Получает навигационные узлы из родительского окна
   * @param backend - мнемоника подсистемы
   * @param docType - тип документа для фильтрации
   * @returns Observable с массивом узлов
   */
  getNavigationNodes(backend: string, docType: string): Observable<NavigationNode[]> {
    return from(this.getNavigationNodesPromise(backend, docType));
  }

  /**
   * Получает навигационные узлы через Promise
   * @param backend - мнемоника подсистемы
   * @param docType - тип документа для фильтрации
   * @returns Promise с массивом узлов
   */
  private getNavigationNodesPromise(backend: string, docType: string): Promise<NavigationNode[]> {
    return new Promise((resolve, reject) => {
      const requestId = this.generateRequestId();
      let timeoutId: number;

      // Создаем обработчик ответа
      const responseHandler = (response: any) => {
        if (response.requestId === requestId) {
          clearTimeout(timeoutId);

          if (response.error) {
            reject(new Error(response.error));
          } else {
            resolve(response.nodes || []);
          }
        }
      };

      // Устанавливаем таймаут
      timeoutId = window.setTimeout(() => {
        reject(new Error('Таймаут запроса навигационных узлов'));
      }, this.REQUEST_TIMEOUT_MS);

      try {
        // Подписываемся на ответ
        this.pubsubService.subscribe('navigationNodesResponse', responseHandler);

        // Отправляем запрос
        this.pubsubService.publish('getNavigationNodes', {
          backend: backend,
          docType: docType,
          requestId: requestId
        });
      } catch (error) {
        clearTimeout(timeoutId);
        reject(error);
      }
    });
  }

  /**
   * Генерирует уникальный идентификатор запроса
   * @returns уникальный ID
   */
  private generateRequestId(): string {
    return 'req_' + Date.now();
  }

}
