import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { ModalData } from '../models/types';

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  
  private showNavigationNodesModalSubject = new Subject<ModalData>();
  public showNavigationNodesModal$ = this.showNavigationNodesModalSubject.asObservable();

  /**
   * Показывает модальное окно выбора навигационных узлов
   * @param data - данные для модального окна
   */
  showNavigationNodesModal(data: ModalData): void {
    this.showNavigationNodesModalSubject.next(data);
  }

  /**
   * Закрывает модальное окно выбора навигационных узлов
   */
  closeNavigationNodesModal(): void {
    this.showNavigationNodesModalSubject.next({
      nodes: [],
      subsystem: '',
      docType: ''
    });
  }

  /**
   * Показывает модальное окно с информацией
   * @param title - заголовок
   * @param message - сообщение
   * @param type - тип сообщения (success, error, warning, info)
   */
  showInfoModal(title: string, message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info'): void {
    // Здесь можно добавить логику для показа информационного модального окна
    console.log(`Показать модальное окно: ${title} - ${message} (${type})`);
  }

  /**
   * Показывает модальное окно подтверждения
   * @param title - заголовок
   * @param message - сообщение
   * @returns Observable с результатом (true - подтверждено, false - отменено)
   */
  showConfirmModal(title: string, message: string): Observable<boolean> {
    const result = new Subject<boolean>();
    
    // Здесь можно добавить логику для показа модального окна подтверждения
    const confirmed = window.confirm(`${title}\n\n${message}`);
    result.next(confirmed);
    result.complete();
    
    return result.asObservable();
  }
}
