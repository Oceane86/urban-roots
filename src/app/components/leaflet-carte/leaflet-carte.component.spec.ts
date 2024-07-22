import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeafletCarteComponent } from './leaflet-carte.component';

describe('LeafletCarteComponent', () => {
  let component: LeafletCarteComponent;
  let fixture: ComponentFixture<LeafletCarteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeafletCarteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeafletCarteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
