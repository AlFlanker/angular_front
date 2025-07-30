import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { NavigationNode, ModalData } from '../../models/types';
import { ModalService } from '../../services/modal';
import { PubsubService } from '../../services/pubsub';

@Component({
  selector: 'app-navigation-nodes-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navigation-nodes-modal.html',
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
    this.nodes = nodes || [];
    this.subsystem = subsystem || '';
    this.docType = docType || '';
    this.selectedNode = null;
    this.isVisible = true;
    
    // Формируем событие об открытии модального окна
    this.pubsubService.publishModalOpened(subsystem, docType, nodes.length);
  }

  /**
   * Закрывает модальное окно
   */
  closeModal(): void {
    // Если модальное окно было открыто, но узел не выбран, формируем событие отмены
    if (this.isVisible && this.nodes.length > 0) {
      this.pubsubService.publishNavigationNodeCancelled(this.subsystem, this.docType, this.nodes.length);
    }
    
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
      // Формируем событие о выборе навигационного узла
      this.pubsubService.publishNavigationNodeSelected(this.selectedNode, this.subsystem, this.docType);
      
      // Отправляем запрос на открытие списковой формы
      this.pubsubService.publishOpenDocumentList(this.selectedNode);
      
      // Закрываем модальное окно
      this.closeModal();
    }
  }

  /**
   * Обработчик клика по фону модального окна
   * @param event - событие клика
   */
  onOverlayClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }
}
