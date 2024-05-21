import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LegalInfosComponent } from './legal-infos.component';

describe('LegalInfosComponent', () => {
  let component: LegalInfosComponent;
  let fixture: ComponentFixture<LegalInfosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LegalInfosComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LegalInfosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
