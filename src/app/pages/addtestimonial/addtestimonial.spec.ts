import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Addtestimonial } from './addtestimonial';

describe('Addtestimonial', () => {
  let component: Addtestimonial;
  let fixture: ComponentFixture<Addtestimonial>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Addtestimonial]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Addtestimonial);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
