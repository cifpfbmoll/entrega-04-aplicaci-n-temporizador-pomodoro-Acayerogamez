import { Injectable, signal, WritableSignal, computed } from '@angular/core';

// Definimos los posibles estados del temporizador
export type TimerStatus = 'stopped' | 'running' | 'paused';

@Injectable({
  providedIn: 'root'
})
export class PomodoroService {
  // --- SEÑALES DE ESTADO (Signals) ---
  // Guardan el estado actual de la aplicación

  // Duraciones configurables (en minutos)
  public workDuration: WritableSignal<number> = signal(25);
  public breakDuration: WritableSignal<number> = signal(5);

  // Estado actual del temporizador
  public status: WritableSignal<TimerStatus> = signal('stopped');

  // Tiempo restante en segundos
  private remainingTime: WritableSignal<number> = signal(this.workDuration() * 60);

  // --- SEÑALES COMPUTADAS ---
  // Derivan su valor de otras señales. Se actualizan automáticamente.

  // Minutos para mostrar en la UI
  public minutes = computed(() => Math.floor(this.remainingTime() / 60));
  // Segundos para mostrar en la UI
  public seconds = computed(() => this.remainingTime() % 60);

  private timerId: any = null;

  constructor() { }

  // --- MÉTODOS PÚBLICOS (Lógica de negocio) ---

  startTimer() {
    if (this.status() === 'running') return;

    // Si el temporizador estaba parado, lo inicializamos
    if (this.status() === 'stopped') {
      this.remainingTime.set(this.workDuration() * 60);
    }

    this.status.set('running');

    this.timerId = setInterval(() => {
      this.remainingTime.update(value => value - 1);
      if (this.remainingTime() <= 0) {
        this.stopTimer();
        // Aquí se podría añadir lógica para cambiar a descanso, etc.
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

  // Método para actualizar las duraciones desde la UI
  updateDurations(work: number, rest: number) {
    this.workDuration.set(work);
    this.breakDuration.set(rest);
    if (this.status() === 'stopped') {
      this.stopTimer(); // Reinicia el contador con la nueva duración
    }
  }
}
