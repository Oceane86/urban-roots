import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Firestore, doc, updateDoc, arrayUnion, getDoc } from '@angular/fire/firestore';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Location } from '@angular/common';

@Component({
  selector: 'app-reply',
  standalone: true,
  templateUrl: './reply.component.html',
  styleUrls: ['./reply.component.css'],
  imports: [CommonModule, FormsModule] 
})
export class ReplyPageComponent implements OnInit {
  @ViewChild('replyInput') replyInput!: ElementRef<HTMLTextAreaElement>;
  post: any = null; // Initialize as null
  user: any = null;

  constructor(
    private firestore: Firestore,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private location: Location
  ) {}

  ngOnInit(): void {
    const postId = this.route.snapshot.paramMap.get('id');
    if (postId) {
      this.loadPost(postId);
    }
    this.user = this.authService.getCurrentUser();
  }

  async loadPost(postId: string) {
    console.log(`Loading post with ID: ${postId}`);
    const postDoc = doc(this.firestore, `posts/${postId}`);
    const postSnap = await getDoc(postDoc);
    if (postSnap.exists()) {
      this.post = postSnap.data();
      this.post.id = postSnap.id;
      console.log('Post loaded:', this.post);
    } else {
      console.error("Post not found!");
    }
  }
  
  async sendReply() {
    if (!this.post || !this.replyInput) return;
  
    const replyContent = this.replyInput.nativeElement.value.trim();
    if (replyContent && this.user) {
      const postId = this.post.id;
      console.log(`Sending reply to post with ID: ${postId}`);
      if (!postId) {
        console.error("Post ID is undefined.");
        return;
      }
  
      const postDoc = doc(this.firestore, `posts/${postId}`);
      const newReply = {
        content: replyContent,
        email: this.user.email
      };
  
      try {
        await updateDoc(postDoc, {
          replies: arrayUnion(newReply)
        });
        this.replyInput.nativeElement.value = '';
        await this.loadPost(postId);
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error("Error updating document: ", error.message);
        } else {
          console.error("An unknown error occurred: ", error);
        }
      }
    }
  }

  goBack(route: string) {
    this.router.navigate([route]);
  }
}  