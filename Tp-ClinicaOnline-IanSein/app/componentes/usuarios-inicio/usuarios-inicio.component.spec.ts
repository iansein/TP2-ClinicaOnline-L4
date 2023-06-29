import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsuariosInicioComponent } from './usuarios-inicio.component';

describe('UsuariosInicioComponent', () => {
  let component: UsuariosInicioComponent;
  let fixture: ComponentFixture<UsuariosInicioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UsuariosInicioComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsuariosInicioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
