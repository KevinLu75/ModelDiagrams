import { TestBed } from '@angular/core/testing';

import { GlobalSaveLoadingService } from './global-save-loading.service';

describe('GlobalSaveLoadingService', () => {
  let service: GlobalSaveLoadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GlobalSaveLoadingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
