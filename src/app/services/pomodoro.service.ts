import { Injectable, computed, signal } from '@angular/core';

export type SessionType = 'work' | 'shortBreak' | 'longBreak';

export interface PomodoroConfig {
  workDuration: number;      // minutos
  shortBreakDuration: number; // minutos
  longBreakDuration: number;  // minutos
  sessionsBeforeLongBreak: number;
}

export interface PomodoroState {
  currentSessionType: SessionType;
  timeRemaining: number; // segundos
  isRunning: boolean;
  isPaused: boolean;
  completedSessions: number;
}

@Injectable({
  providedIn: 'root'
})
export class PomodoroService {
  // Configuración por defecto
  private configSignal = signal<PomodoroConfig>({
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    sessionsBeforeLongBreak: 4
  });

  // Estado del temporizador
  private stateSignal = signal<PomodoroState>({
    currentSessionType: 'work',
    timeRemaining: 25 * 60,
    isRunning: false,
    isPaused: false,
    completedSessions: 0
  });

  // Timer interval reference
  private timerInterval: any = null;
  private audioContext: AudioContext | null = null;

  // Computed signals para acceso público
  public config = computed(() => this.configSignal());
  public state = computed(() => this.stateSignal());
  
  public currentSessionTypeLabel = computed(() => {
    const type = this.stateSignal().currentSessionType;
    switch(type) {
      case 'work': return 'Sesión de Trabajo';
      case 'shortBreak': return 'Descanso Corto';
      case 'longBreak': return 'Descanso Largo';
    }
  });

  public formattedTime = computed(() => {
    const seconds = this.stateSignal().timeRemaining;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  });

  public progress = computed(() => {
    const state = this.stateSignal();
    const config = this.configSignal();
    let totalSeconds = 0;
    
    switch(state.currentSessionType) {
      case 'work':
        totalSeconds = config.workDuration * 60;
        break;
      case 'shortBreak':
        totalSeconds = config.shortBreakDuration * 60;
        break;
      case 'longBreak':
        totalSeconds = config.longBreakDuration * 60;
        break;
    }
    
    return ((totalSeconds - state.timeRemaining) / totalSeconds) * 100;
  });

  constructor() {
    this.initializeAudio();
  }

  private initializeAudio(): void {
    if (typeof window !== 'undefined' && window.AudioContext) {
      this.audioContext = new AudioContext();
    }
  }

  public start(): void {
    if (this.stateSignal().isRunning && !this.stateSignal().isPaused) {
      return;
    }

    this.stateSignal.update(state => ({
      ...state,
      isRunning: true,
      isPaused: false
    }));

    this.timerInterval = setInterval(() => {
      this.tick();
    }, 1000);
  }

  public pause(): void {
    if (!this.stateSignal().isRunning) {
      return;
    }

    this.stateSignal.update(state => ({
      ...state,
      isPaused: true
    }));

    this.clearTimer();
  }

  public resume(): void {
    if (!this.stateSignal().isPaused) {
      return;
    }

    this.start();
  }

  public stop(): void {
    this.clearTimer();
    
    const config = this.configSignal();
    const currentType = this.stateSignal().currentSessionType;
    
    let duration = config.workDuration;
    if (currentType === 'shortBreak') {
      duration = config.shortBreakDuration;
    } else if (currentType === 'longBreak') {
      duration = config.longBreakDuration;
    }

    this.stateSignal.update(state => ({
      ...state,
      timeRemaining: duration * 60,
      isRunning: false,
      isPaused: false
    }));
  }

  public skip(): void {
    this.clearTimer();
    this.moveToNextSession();
  }

  private tick(): void {
    const currentState = this.stateSignal();
    
    if (currentState.timeRemaining > 0) {
      this.stateSignal.update(state => ({
        ...state,
        timeRemaining: state.timeRemaining - 1
      }));
    } else {
      this.playNotificationSound();
      this.moveToNextSession();
    }
  }

  private moveToNextSession(): void {
    const config = this.configSignal();
    const currentState = this.stateSignal();
    
    let nextSessionType: SessionType;
    let nextDuration: number;
    let completedSessions = currentState.completedSessions;

    if (currentState.currentSessionType === 'work') {
      completedSessions++;
      
      if (completedSessions % config.sessionsBeforeLongBreak === 0) {
        nextSessionType = 'longBreak';
        nextDuration = config.longBreakDuration;
      } else {
        nextSessionType = 'shortBreak';
        nextDuration = config.shortBreakDuration;
      }
    } else {
      nextSessionType = 'work';
      nextDuration = config.workDuration;
    }

    this.stateSignal.set({
      currentSessionType: nextSessionType,
      timeRemaining: nextDuration * 60,
      isRunning: false,
      isPaused: false,
      completedSessions: completedSessions
    });

    this.clearTimer();
  }

  private clearTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  public updateConfig(newConfig: Partial<PomodoroConfig>): void {
    this.configSignal.update(config => ({
      ...config,
      ...newConfig
    }));

    // Si el temporizador no está en ejecución, actualizar el tiempo restante
    if (!this.stateSignal().isRunning) {
      const currentType = this.stateSignal().currentSessionType;
      const updatedConfig = this.configSignal();
      
      let duration = updatedConfig.workDuration;
      if (currentType === 'shortBreak') {
        duration = updatedConfig.shortBreakDuration;
      } else if (currentType === 'longBreak') {
        duration = updatedConfig.longBreakDuration;
      }

      this.stateSignal.update(state => ({
        ...state,
        timeRemaining: duration * 60
      }));
    }
  }

  private playNotificationSound(): void {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.5);
  }

  public resetAll(): void {
    this.clearTimer();
    const config = this.configSignal();
    
    this.stateSignal.set({
      currentSessionType: 'work',
      timeRemaining: config.workDuration * 60,
      isRunning: false,
      isPaused: false,
      completedSessions: 0
    });
  }
}
