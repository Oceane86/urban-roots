// src/app/pages/quiz/quiz.component.ts


import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface Question {
  text: string;
  options: string[];
}

interface Article {
  title: string;
  content: string;
}

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.css']
})
export class QuizComponent {
  questions: Question[] = [
    {
      text: "Quel type de sol avez-vous?",
      options: ["Argileux", "Sableux", "Limoneux", "Tourbeux"]
    },
    {
      text: "Combien de soleil reçoit votre jardin?",
      options: ["Plein soleil", "Mi-ombre", "Ombre complète"]
    },
    {
      text: "À quelle fréquence arrosez-vous vos plantes?",
      options: ["Tous les jours", "Deux fois par semaine", "Une fois par semaine", "Moins d'une fois par semaine"]
    }
  ];

  articles: Record<string, Article> = {
    "Argileux": { title: "Jardinage sur Sol Argileux", content: "Le sol argileux retient bien l'eau, mais peut être difficile à travailler. Ajoutez du compost pour améliorer la structure du sol." },
    "Sableux": { title: "Jardinage sur Sol Sableux", content: "Le sol sableux se draine bien, mais ne retient pas les nutriments. Ajoutez de la matière organique pour enrichir le sol." },
    "Limoneux": { title: "Jardinage sur Sol Limoneux", content: "Le sol limoneux est idéal pour le jardinage, offrant un bon drainage et de nombreux nutriments." },
    "Tourbeux": { title: "Jardinage sur Sol Tourbeux", content: "Le sol tourbeux est riche en matière organique mais peut être acide. Ajustez le pH si nécessaire." },
    "Plein soleil": { title: "Plantes pour Plein Soleil", content: "Les plantes qui aiment le plein soleil incluent les tomates, les poivrons et de nombreuses herbes." },
    "Mi-ombre": { title: "Plantes pour Mi-ombre", content: "Les plantes pour mi-ombre incluent les épinards, la laitue et les fougères." },
    "Ombre complète": { title: "Plantes pour Ombre Complète", content: "Les plantes qui tolèrent l'ombre complète incluent les hostas, les fougères et les plantes de sous-bois." },
    "Tous les jours": { title: "Arrosage Quotidien", content: "L'arrosage quotidien peut être nécessaire pour les plantes en pots et les jeunes plants, surtout par temps chaud." },
    "Deux fois par semaine": { title: "Arrosage Bihebdomadaire", content: "La plupart des jardins bénéficient d'un arrosage en profondeur deux fois par semaine." },
    "Une fois par semaine": { title: "Arrosage Hebdomadaire", content: "Un arrosage hebdomadaire est suffisant pour les plantes bien établies dans des climats modérés." },
    "Moins d'une fois par semaine": { title: "Arrosage Peu Fréquent", content: "Certaines plantes, comme les succulentes, préfèrent un arrosage peu fréquent." }
  };

  currentIndex = 0;
  answers: string[] = new Array(this.questions.length).fill('');
  displayedArticles: Article[] = [];
  quizCompleted = false;

  get currentQuestion(): Question {
    return this.questions[this.currentIndex];
  }

  get progressWidth(): string {
    return ((this.currentIndex + 1) / this.questions.length) * 100 + '%';
  }

  nextQuestion(): void {
    if (this.currentIndex < this.questions.length - 1) {
      this.currentIndex++;
    }
  }

  prevQuestion(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    }
  }

  submitQuiz(): void {
    console.log('Submitting quiz...');
    this.displayedArticles = this.answers
      .map(answer => this.articles[answer])
      .filter(article => article !== undefined) as Article[];
    console.log('Displayed Articles:', this.displayedArticles);
    this.quizCompleted = true;
    console.log('Quiz Completed:', this.quizCompleted);
  }

  resetQuiz(): void {
    this.answers = new Array(this.questions.length).fill('');
    this.displayedArticles = [];
    this.currentIndex = 0;
    this.quizCompleted = false;
  }
}
