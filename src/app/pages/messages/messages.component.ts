import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEnvelope, faCircle, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { Subscription } from 'rxjs';
import { ChatService } from '../../services/chat.service';
import { AuthService } from '../../services/auth.service';
import { LoadingSpinnerComponent } from '../../components/loading-spinner/loading-spinner.component';
import { ChatRoom } from '../../models/message.model';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterModule, FontAwesomeModule, LoadingSpinnerComponent],
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss']
})
export class MessagesComponent implements OnInit, OnDestroy {
  private chatService = inject(ChatService);
  private authService = inject(AuthService);
  
  currentUser: User | null = null;
  chatRooms: ChatRoom[] = [];
  loading: boolean = true;
  
  // Font Awesome icons
  faEnvelope = faEnvelope;
  faCircle = faCircle;
  faSpinner = faSpinner;
  
  private chatRoomsSubscription?: Subscription;
  private userSubscription?: Subscription;
  
  ngOnInit(): void {
    this.userSubscription = this.authService.currentUser$.subscribe((user: User | null) => {
      this.currentUser = user;
      if (user) {
        this.loadChatRooms(user.id);
      } else {
        this.loading = false;
      }
    });
  }
  
  ngOnDestroy(): void {
    this.chatRoomsSubscription?.unsubscribe();
    this.userSubscription?.unsubscribe();
  }
  
  loadChatRooms(userId: string): void {
    this.chatRoomsSubscription = this.chatService.getChatRooms(userId)
      .subscribe(rooms => {
        this.chatRooms = rooms;
        this.loading = false;
      });
  }
  
  formatTimestamp(timestamp: any): string {
    if (!timestamp) return '';
    
    const date = new Date(timestamp.seconds * 1000);
    const now = new Date();
    
    // If the message is from today, show only the time
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    
    // If the message is from this year, show the month and day
    if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    }
    
    // Otherwise, show the full date
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
  
  getOtherParticipantId(room: ChatRoom): string {
    if (!this.currentUser) return '';
    return room.participants.find(id => id !== this.currentUser!.id) || '';
  }
  
  hasUnreadMessages(room: ChatRoom): boolean {
    if (!room.lastMessage || !this.currentUser) return false;
    return !room.lastMessage.read && room.lastMessage.receiverId === this.currentUser.id;
  }
  
  getLastMessagePreview(room: ChatRoom): string {
    if (!room.lastMessage) return 'No messages yet';
    return room.lastMessage.content.length > 30 
      ? room.lastMessage.content.substring(0, 30) + '...' 
      : room.lastMessage.content;
  }
}
