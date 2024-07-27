import { Component, OnInit, ViewChild, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Firestore, collectionData, collection, addDoc, doc, updateDoc, query, orderBy, getDoc, arrayUnion } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { BottomBarComponent } from '../../components/bottom-bar/bottom-bar.component';

interface Post {
  content: string;
  timestamp: any;
  email: string;
  likes?: number;
  replies?: { content: string; email: string }[];
  id: string;
}

@Component({
  selector: 'app-forum',
  standalone: true,
  imports: [CommonModule, FormsModule, BottomBarComponent],
  templateUrl: './forum.component.html',
  styleUrls: ['./forum.component.css']
})
export class ForumComponent implements OnInit {
  authService = inject(AuthService);
  router = inject(Router);
  user: any = null;
  @ViewChild('postInput') postInput!: ElementRef;
  posts: Observable<Post[]>;

  constructor(private firestore: Firestore) {
    const postsCollection = collection(this.firestore, 'posts');
    const postsQuery = query(postsCollection, orderBy('timestamp', 'desc'));
    this.posts = collectionData(postsQuery, { idField: 'id' }) as Observable<Post[]>;
  }

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.user = {
        email: currentUser.email,
        username: currentUser.displayName,
      };
    }
  }

  sendPost(content: string) {
    if (content.trim() === '' || !this.user) return;
    const postsCollection = collection(this.firestore, 'posts');
    addDoc(postsCollection, {
      content,
      email: this.user.email,
      timestamp: new Date(),
      likes: 0,
      replies: []
    }).then(() => {
      if (this.postInput) {
        this.postInput.nativeElement.value = '';
      }
    }).catch((error) => {
      console.error("Error adding document: ", error);
    });
  }

  async likePost(postId: string) {
    if (!postId) return;
    const postDoc = doc(this.firestore, `posts/${postId}`);
    const postSnap = await getDoc(postDoc);
    if (postSnap.exists()) {
      const postData = postSnap.data() as Post;
      const newLikes = (postData.likes || 0) + 1;
      await updateDoc(postDoc, { likes: newLikes });
    }
  }

  replyToPost(postId: string) {
    if (postId) {
      this.router.navigate(['/reply', postId]); // Navigation vers la page de réponse avec l'ID du post
    }
  }
}
