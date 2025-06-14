import  supabase  from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Attendance = Database['public']['Tables']['attendance']['Row'];
type AttendanceInsert = Database['public']['Tables']['attendance']['Insert'];
type AttendanceUpdate = Database['public']['Tables']['attendance']['Update'];

export const attendanceService = {
  async getAll() {
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getByStudentId(studentId: string) {
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('student_id', studentId)
      .order('date', { ascending: false });

    if (error) throw error;
    return data;
  },

  async create(attendance: AttendanceInsert) {
    const { data, error } = await supabase
      .from('attendance')
      .insert(attendance)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async bulkCreate(attendanceRecords: AttendanceInsert[]) {
    const { data, error } = await supabase
      .from('attendance')
      .insert(attendanceRecords)
      .select();

    if (error) throw error;
    return data;
  },

  async update(id: string, attendance: AttendanceUpdate) {
    const { data, error } = await supabase
      .from('attendance')
      .update(attendance)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};