import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Editservice } from './editservice';

describe('Editservice', () => {
  let component: Editservice;
  let fixture: ComponentFixture<Editservice>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Editservice]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Editservice);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
