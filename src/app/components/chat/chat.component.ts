import { Component, Input, OnInit, OnDestroy, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';
import { faPaperPlane, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { Subscription } from 'rxjs';
import { ChatService } from '../../services/chat.service';
import { AuthService } from '../../services/auth.service';
import { Message, ChatRoom } from '../../models/message.model';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, FontAwesomeModule, LoadingSpinnerComponent],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy {
  @Input() productId!: string;
  @Input() sellerId!: string;
  
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;
  
  private chatService = inject(ChatService);
  private authService = inject(AuthService);
  
  currentUser: User | null = null;
  messages: Message[] = [];
  newMessage: string = '';
  loading: boolean = true;
  chatRoomId: string = '';
  
  // Font Awesome icons
  faPaperPlane = faPaperPlane;
  faSpinner = faSpinner;
  
  private messagesSubscription?: Subscription;
  private userSubscription?: Subscription;
  
  ngOnInit(): void {
    this.userSubscription = this.authService.currentUser$.subscribe((user: User | null) => {
      this.currentUser = user;
      if (user) {
        this.initializeChat();
      } else {
        this.loading = false;
      }
    });
  }
  
  ngOnDestroy(): void {
    this.messagesSubscription?.unsubscribe();
    this.userSubscription?.unsubscribe();
  }
  
  async initializeChat(): Promise<void> {
    try {
      // Create or get existing chat room
      this.chatRoomId = await this.chatService.createChatRoom(this.productId, this.sellerId);
      // Subscribe to messages
      this.messagesSubscription = this.chatService.getChatRoomMessages(this.chatRoomId)
      .subscribe(messages => {
        this.messages = messages;
        this.loading = false;
        
        // Mark messages as read
        if (this.currentUser) {
          this.chatService.markMessagesAsRead(this.chatRoomId, this.currentUser.id).subscribe();
        }
        
        // Scroll to bottom of messages
        setTimeout(() => this.scrollToBottom(), 100);
      });
    } catch (error) {
      console.error('Error initializing chat:', error);
      this.loading = false;
    }
  }
  
  async sendMessage(): Promise<void> {
    if (!this.newMessage.trim() || !this.currentUser) {
      return;
    }
    
    try {
      await this.chatService.sendMessage(this.chatRoomId, this.newMessage.trim());
      this.newMessage = '';
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }
  
  isOwnMessage(message: Message): boolean {
    return this.currentUser?.id === message.senderId;
  }
  
  formatTimestamp(timestamp: any): string {
    return new Date(timestamp.seconds).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  scrollToBottom(): void {
    if (this.messagesContainer) {
      const element = this.messagesContainer.nativeElement;
      element.scrollTop = element.scrollHeight;
    }
  }
}
