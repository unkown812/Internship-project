import { useState, useEffect } from 'react';
import { studentService } from '../services/studentService';
import type { Database } from '../lib/database.types';

type Student = Database['public']['Tables']['students']['Row'];

export function useStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    loadStudents();
  }, []);

  async function loadStudents() {
    try {
      setLoading(true);
      const data = await studentService.getAll();
      setStudents(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load students'));
    } finally {
      setLoading(false);
    }
  }

  async function addStudent(student: Database['public']['Tables']['students']['Insert']) {
    try {
      const newStudent = await studentService.create(student);
      setStudents(prev => [newStudent, ...prev]);
      return newStudent;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to add student');
    }
  }

  async function updateStudent(id: string, student: Database['public']['Tables']['students']['Update']) {
    try {
      const updatedStudent = await studentService.update(id, student);
      setStudents(prev => prev.map(s => s.id === id ? updatedStudent : s));
      return updatedStudent;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update student');
    }
  }

  async function deleteStudent(id: string) {
    try {
      await studentService.delete(id);
      setStudents(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to delete student');
    }
  }

  return {
    students,
    loading,
    error,
    loadStudents,
    addStudent,
    updateStudent,
    deleteStudent
  };
}