import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CooperationMissionComponent } from './cooperation-mission.component';

describe('CooperationMissionComponent', () => {
  let component: CooperationMissionComponent;
  let fixture: ComponentFixture<CooperationMissionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CooperationMissionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CooperationMissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
