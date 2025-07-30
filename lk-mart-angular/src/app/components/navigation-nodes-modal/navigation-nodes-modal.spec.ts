import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavigationNodesModal } from './navigation-nodes-modal';

describe('NavigationNodesModal', () => {
  let component: NavigationNodesModal;
  let fixture: ComponentFixture<NavigationNodesModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavigationNodesModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NavigationNodesModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
