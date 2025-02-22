import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComponentsDiagramComponent } from './components-diagram.component';

describe('ComponentsDiagramComponent', () => {
  let component: ComponentsDiagramComponent;
  let fixture: ComponentFixture<ComponentsDiagramComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComponentsDiagramComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComponentsDiagramComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
