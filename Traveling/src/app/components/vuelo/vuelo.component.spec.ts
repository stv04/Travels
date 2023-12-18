import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VueloComponent } from './vuelo.component';

describe('VueloComponent', () => {
  let component: VueloComponent;
  let fixture: ComponentFixture<VueloComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [VueloComponent]
    });
    fixture = TestBed.createComponent(VueloComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
