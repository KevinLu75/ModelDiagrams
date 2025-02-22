import { TestBed } from '@angular/core/testing';

import { GlobalCodingGenerateService } from './global-coding-generate.service';

describe('GlobalCodingGenerateService', () => {
  let service: GlobalCodingGenerateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GlobalCodingGenerateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
