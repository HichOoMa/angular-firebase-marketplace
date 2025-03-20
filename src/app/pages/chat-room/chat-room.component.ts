import { Component, OnInit, OnDestroy, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { LoadingSpinnerComponent } from '../../components/loading-spinner/loading-spinner.component';
import { faPaperPlane, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { Subscription, switchMap } from 'rxjs';
import { ChatService } from '../../services/chat.service';
import { AuthService } from '../../services/auth.service';
import { Message, ChatRoom } from '../../models/message.model';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-chat-room',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, FontAwesomeModule, LoadingSpinnerComponent],
  templateUrl: './chat-room.component.html',
  styleUrls: ['./chat-room.component.scss']
})
export class ChatRoomComponent implements OnInit, OnDestroy {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;
  
  private chatService = inject(ChatService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  
  currentUser: User | null = null;
  messages: Message[] = [];
  newMessage: string = '';
  loading: boolean = true;
  chatRoomId: string = '';
  chatRoom: ChatRoom | null = null;
  
  // Font Awesome icons
  faPaperPlane = faPaperPlane;
  faArrowLeft = faArrowLeft;
  
  private messagesSubscription?: Subscription;
  private userSubscription?: Subscription;
  private chatRoomSubscription?: Subscription;
  
  ngOnInit(): void {
    this.userSubscription = this.authService.currentUser$.subscribe((user: User | null) => {
      this.currentUser = user;
      if (user) {
        this.initializeChat();
      } else {
        this.loading = false;
        this.router.navigate(['/auth/login']);
      }
    });
  }
  
  ngOnDestroy(): void {
    this.messagesSubscription?.unsubscribe();
    this.userSubscription?.unsubscribe();
    this.chatRoomSubscription?.unsubscribe();
  }
  
  initializeChat(): void {
    this.route.params.subscribe(params => {
      this.chatRoomId = params['id'];
      
      if (!this.chatRoomId) {
        this.router.navigate(['/messages']);
        return;
      }
      
      // Get chat room details
      this.chatRoomSubscription = this.chatService.setCurrentChatRoom(this.chatRoomId).subscribe(room => {
        this.chatRoom = room;
        
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
      });
    });
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
    if (!timestamp) return '';
    
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  formatDate(timestamp: any): string {
    if (!timestamp) return '';
    
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  
  scrollToBottom(): void {
    if (this.messagesContainer) {
      const element = this.messagesContainer.nativeElement;
      element.scrollTop = element.scrollHeight;
    }
  }
  
  goBack(): void {
    this.router.navigate(['/messages']);
  }
}
