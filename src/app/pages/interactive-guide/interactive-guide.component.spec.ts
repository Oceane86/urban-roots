import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InteractiveGuideComponent } from './interactive-guide.component';

describe('InteractiveGuideComponent', () => {
  let component: InteractiveGuideComponent;
  let fixture: ComponentFixture<InteractiveGuideComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InteractiveGuideComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(InteractiveGuideComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
