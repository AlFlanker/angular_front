import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DocumentTableComponent} from './components/document-table/document-table';
import {NavigationNodesModalComponent} from './components/navigation-nodes-modal/navigation-nodes-modal';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    DocumentTableComponent,
    NavigationNodesModalComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent {
  title = 'lk-mart-angular';
}
