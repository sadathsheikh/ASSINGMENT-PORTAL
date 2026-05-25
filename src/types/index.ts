export interface User {
  id: string;
  name: string;
  email: string;
  role: 'teacher' | 'student';
  createdAt?: any;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  totalPoints: number;
  requirements?: string[];
  createdBy: string;
  createdAt?: any;
}

export interface Submission {
  id: string;
  studentId: string;
  assignmentId: string;
  content: string;
  images?: string[];
  submittedAt: any;
  status: 'submitted' | 'graded';
  grade?: number;
  feedback?: string;
}