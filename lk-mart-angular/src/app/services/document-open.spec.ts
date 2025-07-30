import { TestBed } from '@angular/core/testing';

import { DocumentOpen } from './document-open';

describe('DocumentOpen', () => {
  let service: DocumentOpen;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DocumentOpen);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
