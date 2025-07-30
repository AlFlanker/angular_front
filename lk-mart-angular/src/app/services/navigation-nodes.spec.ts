import { TestBed } from '@angular/core/testing';

import { NavigationNodes } from './navigation-nodes';

describe('NavigationNodes', () => {
  let service: NavigationNodes;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NavigationNodes);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
