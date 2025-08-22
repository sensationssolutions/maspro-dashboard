import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Editblog } from './editblog';

describe('Editblog', () => {
  let component: Editblog;
  let fixture: ComponentFixture<Editblog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Editblog]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(Editblog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
