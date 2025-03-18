export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  isAdmin: boolean;
  createdAt: Date;
}
