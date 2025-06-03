export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      students: {
        Row: {
          id: string
          name: string
          email: string
          phone: string | null
          address: string | null
          dob: string | null
          category: string
          course: string
          enrollment_date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone?: string | null
          address?: string | null
          dob?: string | null
          category: string
          course: string
          enrollment_date?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string | null
          address?: string | null
          dob?: string | null
          category?: string
          course?: string
          enrollment_date?: string
          created_at?: string
          updated_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          student_id: string
          amount: number
          payment_date: string
          payment_method: string
          status: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          student_id: string
          amount: number
          payment_date?: string
          payment_method: string
          status: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          amount?: number
          payment_date?: string
          payment_method?: string
          status?: string
          description?: string | null
          created_at?: string
        }
      }
      attendance: {
        Row: {
          id: string
          student_id: string
          date: string
          status: string
          subject: string
          created_at: string
        }
        Insert: {
          id?: string
          student_id: string
          date: string
          status: string
          subject: string
          created_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          date?: string
          status?: string
          subject?: string
          created_at?: string
        }
      }
      performance: {
        Row: {
          id: string
          student_id: string
          exam_name: string
          date: string
          marks: number
          total_marks: number
          percentage: number
          created_at: string
        }
        Insert: {
          id?: string
          student_id: string
          exam_name: string
          date: string
          marks: number
          total_marks: number
          percentage: number
          created_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          exam_name?: string
          date?: string
          marks?: number
          total_marks?: number
          percentage?: number
          created_at?: string
        }
      }
    }
  }
}