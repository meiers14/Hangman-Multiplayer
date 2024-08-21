import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChallengeArenaComponent } from './challenge-arena.component';

describe('ChallengeArenaComponent', () => {
  let component: ChallengeArenaComponent;
  let fixture: ComponentFixture<ChallengeArenaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChallengeArenaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChallengeArenaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
