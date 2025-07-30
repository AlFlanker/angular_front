import { TestBed } from '@angular/core/testing';

import { Pubsub } from './pubsub';

describe('Pubsub', () => {
  let service: Pubsub;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Pubsub);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
