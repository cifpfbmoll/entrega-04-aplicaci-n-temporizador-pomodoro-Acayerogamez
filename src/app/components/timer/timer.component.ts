import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PomodoroService } from '../../services/pomodoro.service';
import { LucideAngularModule, Play, Pause, Square, SkipForward, RefreshCw } from 'lucide-angular';

@Component({
  selector: 'app-timer',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './timer.component.html',
  styleUrls: ['./timer.component.scss']
})
export class TimerComponent {
  protected pomodoroService = inject(PomodoroService);

  protected readonly PlayIcon = Play;
  protected readonly PauseIcon = Pause;
  protected readonly SquareIcon = Square;
  protected readonly SkipForwardIcon = SkipForward;
  protected readonly RefreshCwIcon = RefreshCw;

  get isRunning() {
    return this.pomodoroService.state().isRunning && !this.pomodoroService.state().isPaused;
  }

  get isPaused() {
    return this.pomodoroService.state().isPaused;
  }

  get sessionTypeClass() {
    const type = this.pomodoroService.state().currentSessionType;
    return {
      'session-work': type === 'work',
      'session-short-break': type === 'shortBreak',
      'session-long-break': type === 'longBreak'
    };
  }

  onStartPause(): void {
    const state = this.pomodoroService.state();
    
    if (state.isRunning && !state.isPaused) {
      this.pomodoroService.pause();
    } else if (state.isPaused) {
      this.pomodoroService.resume();
    } else {
      this.pomodoroService.start();
    }
  }

  onStop(): void {
    this.pomodoroService.stop();
  }

  onSkip(): void {
    this.pomodoroService.skip();
  }

  onReset(): void {
    this.pomodoroService.resetAll();
  }
}
