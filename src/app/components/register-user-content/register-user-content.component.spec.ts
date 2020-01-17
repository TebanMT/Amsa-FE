import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterUserContentComponent } from './register-user-content.component';

describe('RegisterUserContentComponent', () => {
  let component: RegisterUserContentComponent;
  let fixture: ComponentFixture<RegisterUserContentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegisterUserContentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterUserContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
