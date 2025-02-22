import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsecaseDiagramComponent } from './usecase-diagram.component';

describe('UsecaseDiagramComponent', () => {
  let component: UsecaseDiagramComponent;
  let fixture: ComponentFixture<UsecaseDiagramComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsecaseDiagramComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsecaseDiagramComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
