import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="spinner-container" [ngClass]="{'overlay': overlay}">
      <div class="spinner" [ngStyle]="{'width.px': size, 'height.px': size}">
        <div class="double-bounce1"></div>
        <div class="double-bounce2"></div>
      </div>
      @if (message) {
        <p class="spinner-message">{{ message }}</p>
      }
    </div>
  `,
  styles: [`
    .spinner-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    }
    
    .spinner-container.overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(255, 255, 255, 0.8);
      z-index: 9999;
    }
    
    .spinner {
      width: 40px;
      height: 40px;
      position: relative;
    }
    
    .double-bounce1, .double-bounce2 {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background-color: #3f51b5;
      opacity: 0.6;
      position: absolute;
      top: 0;
      left: 0;
      animation: sk-bounce 2.0s infinite ease-in-out;
    }
    
    .double-bounce2 {
      animation-delay: -1.0s;
    }
    
    .spinner-message {
      margin-top: 1rem;
      color: #616161;
      font-size: 0.9rem;
      text-align: center;
    }
    
    @keyframes sk-bounce {
      0%, 100% { 
        transform: scale(0.0);
      } 50% { 
        transform: scale(1.0);
      }
    }
  `]
})
export class LoadingSpinnerComponent {
  @Input() size: number = 40;
  @Input() overlay: boolean = false;
  @Input() message?: string;
}
