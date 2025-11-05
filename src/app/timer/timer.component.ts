import { Component, signal, computed, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';

type TimerStatus = 'stopped' | 'running' | 'paused';

@Component({
  selector: 'app-timer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './timer.component.html',
  styleUrl: './timer.component.scss'
})
export class TimerComponent {
  public status: WritableSignal<TimerStatus> = signal('stopped');
  private remainingTime: WritableSignal<number> = signal(25 * 60);
  public minutes = computed(() => Math.floor(this.remainingTime() / 60));
  public seconds = computed(() => this.remainingTime() % 60);
  private timerId: any = null;

  startTimer() {
    if (this.status() === 'running') return;
    if (this.status() === 'stopped') {
      this.remainingTime.set(25 * 60);
    }
    this.status.set('running');
    this.timerId = setInterval(() => {
      this.remainingTime.update(value => value - 1);
      if (this.remainingTime() < 0) {
        this.stopTimer();
      }
    }, 1000);
  }

  pauseTimer() {
    this.status.set('paused');
    clearInterval(this.timerId);
  }

  stopTimer() {
    this.status.set('stopped');
    clearInterval(this.timerId);
    this.remainingTime.set(25 * 60);
  }
}
