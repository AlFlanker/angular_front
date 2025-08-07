import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';
import {ModalData} from '../models/types';

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
}
