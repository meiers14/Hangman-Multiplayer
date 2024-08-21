import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DuelRoyaleComponent } from './duel-royale.component';

describe('DuelRoyaleComponent', () => {
  let component: DuelRoyaleComponent;
  let fixture: ComponentFixture<DuelRoyaleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DuelRoyaleComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DuelRoyaleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
