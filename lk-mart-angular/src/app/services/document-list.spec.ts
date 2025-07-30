import { TestBed } from '@angular/core/testing';

import { DocumentList } from './document-list';

describe('DocumentList', () => {
  let service: DocumentList;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DocumentList);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
