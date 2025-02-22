import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClassDiagramComponent } from './class-diagram.component';

describe('ClassDiagramComponent', () => {
  let component: ClassDiagramComponent;
  let fixture: ComponentFixture<ClassDiagramComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClassDiagramComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClassDiagramComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
