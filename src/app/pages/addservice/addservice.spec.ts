import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Addservice } from './addservice';

describe('Addservice', () => {
  let component: Addservice;
  let fixture: ComponentFixture<Addservice>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Addservice]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Addservice);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
