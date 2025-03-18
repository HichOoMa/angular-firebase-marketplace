import { Injectable, inject } from '@angular/core';
import { 
  Auth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  authState, 
  updateProfile, 
  UserCredential 
} from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc, updateDoc } from '@angular/fire/firestore';
import { Observable, from, of, switchMap } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  
  currentUser$ = authState(this.auth).pipe(
    switchMap(user => {
      if (user) {
        return this.getUserData(user.uid);
      }
      return of(null);
    })
  );

  constructor() {}

  login(email: string, password: string): Observable<UserCredential> {
    return from(signInWithEmailAndPassword(this.auth, email, password));
  }

  register(email: string, password: string, displayName: string): Observable<User | null> {
    return from(createUserWithEmailAndPassword(this.auth, email, password)).pipe(
      switchMap(async (userCredential) => {
        // Update display name
        if (userCredential.user) {
          await updateProfile(userCredential.user, { displayName });
          
          // Create user document in Firestore
          const userData: User = {
            id: userCredential.user.uid,
            email: userCredential.user.email || '',
            displayName: displayName,
            photoURL: userCredential.user.photoURL || '',
            isAdmin: false,
            createdAt: new Date()
          };
          
          await setDoc(doc(this.firestore, 'users', userCredential.user.uid), userData);
          return userData;
        }
        return null;
      })
    );
  }

  logout(): Observable<void> {
    return from(signOut(this.auth));
  }

  getUserData(userId: string): Observable<User | null> {
    // const docRef = doc(this.firestore, 'users', userId);
    // const userDoc = await getDoc(docRef);
    // if (userDoc.exists()) {
    //   return of(userDoc.data() as User);
    // }
    // return of(null);
    return from(getDoc(doc(this.firestore, 'users', userId))).pipe(
      switchMap(docSnap => {
        if (docSnap.exists()) {
          return of(docSnap.data() as User);
        }
        return of(null);
      })
    );
  }

  updateUserProfile(userId: string, data: Partial<User>): Observable<void> {
    return from(updateDoc(doc(this.firestore, 'users', userId), { ...data }));
  }

  isAdmin(userId: string): Observable<boolean> {
    return this.getUserData(userId).pipe(
      switchMap(user => of(user?.isAdmin || false))
    );
  }
}
