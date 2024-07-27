import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PasswordValidatorTsComponent } from './password-validator.ts.component';

describe('PasswordValidatorTsComponent', () => {
  let component: PasswordValidatorTsComponent;
  let fixture: ComponentFixture<PasswordValidatorTsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PasswordValidatorTsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PasswordValidatorTsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
