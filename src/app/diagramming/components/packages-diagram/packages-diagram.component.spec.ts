import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PackagesDiagramComponent } from './packages-diagram.component';

describe('PackagesDiagramComponent', () => {
  let component: PackagesDiagramComponent;
  let fixture: ComponentFixture<PackagesDiagramComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PackagesDiagramComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PackagesDiagramComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
