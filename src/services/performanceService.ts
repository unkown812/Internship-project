import  supabase  from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Performance = Database['public']['Tables']['performance']['Row'];
type PerformanceInsert = Database['public']['Tables']['performance']['Insert'];
type PerformanceUpdate = Database['public']['Tables']['performance']['Update'];

export const performanceService = {
  async getAll() {
    const { data, error } = await supabase
      .from('performance')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getByStudentId(studentId: string) {
    const { data, error } = await supabase
      .from('performance')
      .select('*')
      .eq('student_id', studentId)
      .order('date', { ascending: false });

    if (error) throw error;
    return data;
  },

  async create(performance: PerformanceInsert) {
    const { data, error } = await supabase
      .from('performance')
      .insert(performance)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, performance: PerformanceUpdate) {
    const { data, error } = await supabase
      .from('performance')
      .update(performance)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};