import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Edittestimonial } from './edittestimonial';

describe('Edittestimonial', () => {
  let component: Edittestimonial;
  let fixture: ComponentFixture<Edittestimonial>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Edittestimonial]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Edittestimonial);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
