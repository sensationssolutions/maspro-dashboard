import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Addcareers } from './addcareers';

describe('Addcareers', () => {
  let component: Addcareers;
  let fixture: ComponentFixture<Addcareers>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Addcareers]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Addcareers);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
