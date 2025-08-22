import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Addblog } from './addblog';

describe('Addblog', () => {
  let component: Addblog;
  let fixture: ComponentFixture<Addblog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Addblog]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(Addblog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
