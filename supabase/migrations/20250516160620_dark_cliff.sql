/*
  # Initial Schema Setup for SK Tutorials

  1. New Tables
    - students
      - id (uuid, primary key)
      - name (text)
      - email (text, unique)
      - phone (text)
      - address (text)
      - dob (date)
      - category (text)
      - course (text)
      - enrollment_date (timestamptz)
      - created_at (timestamptz)
      - updated_at (timestamptz)
    
    - payments
      - id (uuid, primary key)
      - student_id (uuid, foreign key)
      - amount (numeric)
      - payment_date (timestamptz)
      - payment_method (text)
      - status (text)
      - description (text)
      - created_at (timestamptz)
    
    - attendance
      - id (uuid, primary key)
      - student_id (uuid, foreign key)
      - date (date)
      - status (text)
      - subject (text)
      - created_at (timestamptz)
    
    - performance
      - id (uuid, primary key)
      - student_id (uuid, foreign key)
      - exam_name (text)
      - date (date)
      - marks (numeric)
      - total_marks (numeric)
      - percentage (numeric)
      - created_at (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Students table
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  address text,
  dob date,
  category text NOT NULL,
  course text NOT NULL,
  enrollment_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  amount numeric NOT NULL CHECK (amount > 0),
  payment_date timestamptz DEFAULT now(),
  payment_method text NOT NULL,
  status text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Attendance table
CREATE TABLE IF NOT EXISTS attendance (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  date date NOT NULL,
  status text NOT NULL,
  subject text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Performance table
CREATE TABLE IF NOT EXISTS performance (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  exam_name text NOT NULL,
  date date NOT NULL,
  marks numeric NOT NULL,
  total_marks numeric NOT NULL,
  percentage numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow authenticated users to read students"
  ON students FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to insert students"
  ON students FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update students"
  ON students FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to read payments"
  ON payments FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to insert payments"
  ON payments FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated users to read attendance"
  ON attendance FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to insert attendance"
  ON attendance FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated users to read performance"
  ON performance FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to insert performance"
  ON performance FOR INSERT TO authenticated WITH CHECK (true);