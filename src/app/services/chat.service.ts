import { Injectable, inject } from '@angular/core';
import { 
  Firestore, 
  collection, 
  collectionData, 
  doc, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  getDocs,
  onSnapshot,
  Timestamp,
  getDoc
} from '@angular/fire/firestore';
import { Observable, from, map, of, switchMap, BehaviorSubject } from 'rxjs';
import { Message, ChatRoom } from '../models/message.model';
import { AuthService } from './auth.service';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private firestore = inject(Firestore);
  private authService = inject(AuthService);
  
  private messagesCollection = collection(this.firestore, 'messages');
  private chatRoomsCollection = collection(this.firestore, 'chatRooms');
  
  private currentChatRoom = new BehaviorSubject<ChatRoom | null>(null);
  currentChatRoom$ = this.currentChatRoom.asObservable();

  constructor() {}

  getChatRooms(userId: string): Observable<ChatRoom[]> {
    const roomsQuery = query(
      this.chatRoomsCollection,
      where('participants', 'array-contains', userId),
      orderBy('createdAt', 'desc')
    );
    
    return collectionData(roomsQuery, { idField: 'id' }) as Observable<ChatRoom[]>;
  }

  getChatRoomMessages(roomId: string): Observable<Message[]> {
    const messagesQuery = query(
      this.messagesCollection,
      where('roomId', '==', roomId),
      orderBy('timestamp', 'asc')
    );
    
    return collectionData(messagesQuery, { idField: 'id' }) as Observable<Message[]>;
  }

  async sendMessage(roomId: string, content: string): Promise<void> {
    const currentUser = await this.authService.currentUser$.pipe(
      map(user => {
        if (!user) throw new Error('User must be logged in to send messages');
        return user;
      })
    ).toPromise();
    
    const roomDoc = doc(this.firestore, `chatRooms/${roomId}`);
    const roomSnapshot = await getDoc(roomDoc);
    
    if (!roomSnapshot.exists()) {
      throw new Error('Chat room does not exist');
    }
    
    const roomData = roomSnapshot.data() as ChatRoom;
    const receiverId = roomData.participants.find(id => id !== currentUser!.id);
    
    if (!receiverId) {
      throw new Error('Receiver not found in chat room');
    }
    
    const newMessage: Omit<Message, 'id'> = {
      senderId: currentUser!.id,
      senderName: currentUser!.displayName,
      receiverId,
      content,
      timestamp: new Date(),
      read: false,
      productId: roomData.productId
    };
    
    // Add message to messages collection
    await addDoc(this.messagesCollection, newMessage);
    
    // Update last message in chat room
    await updateDoc(roomDoc, {
      lastMessage: newMessage
    });
  }

  async createChatRoom(productId: string, sellerId: string): Promise<string> {
    const currentUser = await this.authService.currentUser$.pipe(
      map(user => {
        if (!user) throw new Error('User must be logged in to create a chat room');
        return user;
      })
    ).toPromise();
    
    // Check if chat room already exists for this product and these users
    const existingRoomQuery = query(
      this.chatRoomsCollection,
      where('participants', 'array-contains', currentUser!.id),
      where('productId', '==', productId)
    );
    
    const querySnapshot = await getDocs(existingRoomQuery);
    
    // If room exists with these participants, return its ID
    for (const doc of querySnapshot.docs) {
      const roomData = doc.data() as ChatRoom;
      if (roomData.participants.includes(sellerId)) {
        this.currentChatRoom.next({ ...roomData, id: doc.id });
        return doc.id;
      }
    }
    
    // Create new chat room
    const newRoom: Omit<ChatRoom, 'id'> = {
      participants: [currentUser!.id, sellerId],
      productId,
      createdAt: new Date()
    };
    
    const docRef = await addDoc(this.chatRoomsCollection, newRoom);
    this.currentChatRoom.next({ ...newRoom, id: docRef.id });
    return docRef.id;
  }

  setCurrentChatRoom(roomId: string): Observable<ChatRoom | null> {
    return from(getDoc(doc(this.firestore, `chatRooms/${roomId}`))).pipe(
      map(docSnap => {
        if (docSnap.exists()) {
          const room = { ...docSnap.data(), id: docSnap.id } as ChatRoom;
          this.currentChatRoom.next(room);
          return room;
        }
        this.currentChatRoom.next(null);
        return null;
      })
    );
  }

  markMessagesAsRead(roomId: string, userId: string): Observable<void> {
    return this.getChatRoomMessages(roomId).pipe(
      switchMap(messages => {
        const unreadMessages = messages.filter(
          msg => !msg.read && msg.receiverId === userId
        );
        
        if (unreadMessages.length === 0) {
          return of(undefined);
        }
        
        const markReadPromises = unreadMessages.map(msg => 
          updateDoc(doc(this.firestore, `messages/${msg.id}`), { read: true })
        );
        
        return from(Promise.all(markReadPromises)).pipe(map(() => undefined));
      })
    );
  }

  getUnreadMessageCount(userId: string): Observable<number> {
    const unreadQuery = query(
      this.messagesCollection,
      where('receiverId', '==', userId),
      where('read', '==', false)
    );
    
    return collectionData(unreadQuery).pipe(
      map((messages: any[]) => messages.length)
    );
  }
}
