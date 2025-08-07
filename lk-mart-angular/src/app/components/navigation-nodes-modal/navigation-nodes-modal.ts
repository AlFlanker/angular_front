import {Component, OnDestroy, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Subscription} from 'rxjs';
import {NavigationNode} from '../../models/types';
import {ModalService} from '../../services/modal';
import {PubsubService} from '../../services/pubsub';
import {NzModalComponent} from 'ng-zorro-antd/modal';
import {NzButtonComponent} from 'ng-zorro-antd/button';
import {NzFlexDirective} from 'ng-zorro-antd/flex';
import {NzDescriptionsComponent, NzDescriptionsItemComponent} from 'ng-zorro-antd/descriptions';

@Component({
  selector: 'app-navigation-nodes-modal',
  standalone: true,
  imports: [CommonModule, NzModalComponent, NzButtonComponent, NzFlexDirective, NzDescriptionsComponent, NzDescriptionsItemComponent],
  templateUrl: './nz-navigation-nodes-modal.html',
  styleUrl: './navigation-nodes-modal.css'
})
export class NavigationNodesModalComponent implements OnInit, OnDestroy {

  isVisible = false;
  nodes: NavigationNode[] = [];
  selectedNode: NavigationNode | null = null;
  subsystem = '';
  docType = '';

  private subscription: Subscription | null = null;

  constructor(
    private modalService: ModalService,
    private pubsubService: PubsubService
  ) {}

  ngOnInit(): void {
    // Подписываемся на события показа модального окна
    this.subscription = this.modalService.showNavigationNodesModal$.subscribe(data => {
      this.showModal(data.nodes, data.subsystem, data.docType);
    });
  }

  ngOnDestroy(): void {
    // Отписываемся от событий
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  /**
   * Показывает модальное окно с навигационными узлами
   * @param nodes - массив навигационных узлов
   * @param subsystem - подсистема
   * @param docType - тип документа
   */
  showModal(nodes: NavigationNode[], subsystem: string, docType: string): void {
    //  Если узел один, то давать выбор нет смысла
    if (nodes && nodes.length === 1) {
      this.selectedNode = nodes[0];
      // Отправляем запрос на открытие списковой формы
      this.pubsubService.publishOpenDocumentList(this.selectedNode);
      return;
    }

    this.nodes = nodes || [];
    this.subsystem = subsystem || '';
    this.docType = docType || '';
    this.selectedNode = null;
    this.isVisible = true;
  }

  /**
   * Закрывает модальное окно
   */
  closeModal(): void {
    this.isVisible = false;
    this.nodes = [];
    this.selectedNode = null;
  }

  /**
   * Выбирает навигационный узел
   * @param node - выбранный узел
   */
  selectNode(node: NavigationNode): void {
    this.selectedNode = node;
  }

  /**
   * Подтверждает выбор узла
   */
  confirmSelection(): void {
    if (this.selectedNode) {
      // Отправляем запрос на открытие списковой формы
      this.pubsubService.publishOpenDocumentList(this.selectedNode);

      // Закрываем модальное окно
      this.closeModal();
    }
  }
}
