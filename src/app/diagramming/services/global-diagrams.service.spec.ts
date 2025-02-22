import { TestBed } from '@angular/core/testing';

import { GlobalDiagramsService } from './global-diagrams.service';

describe('GlobalDiagramsService', () => {
  let service: GlobalDiagramsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GlobalDiagramsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
