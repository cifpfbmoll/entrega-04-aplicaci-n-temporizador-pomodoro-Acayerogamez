import { Component, signal, computed, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common'; // MUY IMPORTANTE

// El tipo de estado lo definimos aquí mismo
type TimerStatus = 'stopped' | 'running' | 'paused';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule], // Necesitamos esto para usar *ngIf y el pipe 'number'
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  // --- TODA LA LÓGICA ESTÁ AQUÍ DENTRO ---

  // Señales de estado
  public status: WritableSignal<TimerStatus> = signal('stopped');
  public workDuration: WritableSignal<number> = signal(25);
  public breakDuration: WritableSignal<number> = signal(5);
  private remainingTime: WritableSignal<number> = signal(this.workDuration() * 60);

  // Señales computadas para la vista
  public minutes = computed(() => Math.floor(this.remainingTime() / 60));
  public seconds = computed(() => this.remainingTime() % 60);

  private timerId: any = null;

  // Métodos del temporizador
  startTimer() {
    if (this.status() === 'running') return;
    if (this.status() === 'stopped') {
      this.remainingTime.set(this.workDuration() * 60);
    }
    this.status.set('running');
    this.timerId = setInterval(() => {
      this.remainingTime.update(value => value - 1);
      if (this.remainingTime() <= 0) {
        this.stopTimer();
        alert('¡Tiempo completado!');
      }
    }, 1000);
  }

  pauseTimer() {
    if (this.status() !== 'running') return;
    this.status.set('paused');
    clearInterval(this.timerId);
  }

  stopTimer() {
    this.status.set('stopped');
    clearInterval(this.timerId);
    this.remainingTime.set(this.workDuration() * 60);
  }
}
