import React, { useState } from 'react';
import { Save, GraduationCap } from 'lucide-react';
import TabNav from '../components/ui/TabNav';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profile');
  
  const tabs = [
    { id: 'profile', label: 'Profile' },
    { id: 'institute', label: 'Institute Details' },
    // { id: 'notifications', label: 'Notifications' },
    { id: 'security', label: 'Security' },
    { id: 'payment', label: 'Payment Settings' }
  ];
  
  return (
    <div className="space-y-6 overflow-scroll">
      <div>
        <h1 className="text-4xl font-semibold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your account and application preferences
        </p>
      </div>
      
      {/* Tab navigation */}
      <TabNav tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* Tab content */}
      <div className="bg-white shadow rounded-lg p-6">
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="flex items-center">
              <div className="w-20 h-20 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold">
                A
              </div>
              <div className="ml-6">
                <h2 className="text-xl font-semibold">Admin User</h2>
                <p className="text-gray-500">admin@sktutorials.com</p>
                <button className="mt-2 text-primary text-sm hover:underline">
                  Change Profile Photo
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="input-field"
                  defaultValue="Admin User"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="input-field"
                  defaultValue="admin@sktutorials.com"
                />
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  className="input-field"
                  defaultValue="+91 9876543210"
                />
              </div>
              
              <div>
                <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">
                  Position
                </label>
                <input
                  type="text"
                  id="position"
                  name="position"
                  className="input-field"
                  defaultValue="Administrator"
                />
              </div>
              
              <div className="md:col-span-2">
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  rows={3}
                  className="input-field"
                  defaultValue="Administrator for SK Tutorials management system."
                ></textarea>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button type="button" className="btn-primary flex items-center">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </button>
            </div>
          </div>
        )}
        
        {activeTab === 'institute' && (
          <div className="space-y-6">
            <div className="flex items-center">
              <div className="w-20 h-20 bg-primary rounded-lg flex items-center justify-center text-white">
                <GraduationCap className="h-10 w-10" />
              </div>
              <div className="ml-6">
                <h2 className="text-xl font-semibold">SK Tutorials</h2>
                <p className="text-gray-500">Educational Institute</p>
                <button className="mt-2 text-primary text-sm hover:underline">
                  Change Institute Logo
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="inst-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Institute Name
                </label>
                <input
                  type="text"
                  id="inst-name"
                  name="inst-name"
                  className="input-field"
                  defaultValue="SK Tutorials"
                />
              </div>
              
              <div>
                <label htmlFor="inst-type" className="block text-sm font-medium text-gray-700 mb-1">
                  Institute Type
                </label>
                <select id="inst-type" name="inst-type" className="input-field">
                  <option value="coaching">Coaching Institute</option>
                  <option value="school">School</option>
                  <option value="college">College</option>
                  <option value="university">University</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="inst-email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="inst-email"
                  name="inst-email"
                  className="input-field"
                  defaultValue="contact@sktutorials.com"
                />
              </div>
              
              <div>
                <label htmlFor="inst-phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="inst-phone"
                  name="inst-phone"
                  className="input-field"
                  defaultValue="+91 9876543210"
                />
              </div>
              
              <div className="md:col-span-2">
                <label htmlFor="inst-address" className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <textarea
                  id="inst-address"
                  name="inst-address"
                  rows={3}
                  className="input-field"
                  defaultValue="123 Education Street, Knowledge Park, Mumbai, Maharashtra, 400001"
                ></textarea>
              </div>
              
              <div>
                <label htmlFor="inst-website" className="block text-sm font-medium text-gray-700 mb-1">
                  Website
                </label>
                <input
                  type="url"
                  id="inst-website"
                  name="inst-website"
                  className="input-field"
                  defaultValue="https://www.sktutorials.com"
                />
              </div>
              
              <div>
                <label htmlFor="est-year" className="block text-sm font-medium text-gray-700 mb-1">
                  Establishment Year
                </label>
                <input
                  type="number"
                  id="est-year"
                  name="est-year"
                  className="input-field"
                  defaultValue="2010"
                />
              </div>
            </div>
            
            <div className="flex justify-end">
              <button type="button" className="btn-primary flex items-center">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </button>
            </div>
          </div>
        )}
        
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <h2 className="text-lg font-medium">Notification Preferences</h2>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="email-notifications"
                    name="email-notifications"
                    type="checkbox"
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    defaultChecked
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="email-notifications" className="font-medium text-gray-700">
                    Email Notifications
                  </label>
                  <p className="text-gray-500">Receive email notifications about important updates and activities.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="sms-notifications"
                    name="sms-notifications"
                    type="checkbox"
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    defaultChecked
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="sms-notifications" className="font-medium text-gray-700">
                    SMS Notifications
                  </label>
                  <p className="text-gray-500">Receive SMS alerts for critical updates like fee due dates and exam schedules.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="app-notifications"
                    name="app-notifications"
                    type="checkbox"
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    defaultChecked
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="app-notifications" className="font-medium text-gray-700">
                    In-App Notifications
                  </label>
                  <p className="text-gray-500">Receive notifications within the application for all updates and activities.</p>
                </div>
              </div>
            </div>
            
            <h3 className="text-lg font-medium mt-8">Notification Types</h3>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="student-updates"
                    name="student-updates"
                    type="checkbox"
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    defaultChecked
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="student-updates" className="font-medium text-gray-700">
                    Student Updates
                  </label>
                  <p className="text-gray-500">Notifications about new students, profile updates, etc.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="fee-updates"
                    name="fee-updates"
                    type="checkbox"
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    defaultChecked
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="fee-updates" className="font-medium text-gray-700">
                    Fee Updates
                  </label>
                  <p className="text-gray-500">Notifications about fee payments, dues, and receipts.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="exam-notifications"
                    name="exam-notifications"
                    type="checkbox"
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    defaultChecked
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="exam-notifications" className="font-medium text-gray-700">
                    Exam Notifications
                  </label>
                  <p className="text-gray-500">Notifications about upcoming exams, results, and performance.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="attendance-notifications"
                    name="attendance-notifications"
                    type="checkbox"
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    defaultChecked
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="attendance-notifications" className="font-medium text-gray-700">
                    Attendance Notifications
                  </label>
                  <p className="text-gray-500">Notifications about attendance updates and reports.</p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button type="button" className="btn-primary flex items-center">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </button>
            </div>
          </div>
        )}
        
        {activeTab === 'security' && (
          <div className="space-y-6">
            <h2 className="text-lg font-medium">Account Security</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-md font-medium mb-2">Change Password</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label htmlFor="current-password" className="block text-sm font-medium text-gray-700 mb-1">
                      Current Password
                    </label>
                    <input
                      type="password"
                      id="current-password"
                      name="current-password"
                      className="input-field"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      id="new-password"
                      name="new-password"
                      className="input-field"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      id="confirm-password"
                      name="confirm-password"
                      className="input-field"
                    />
                  </div>
                </div>
                
                <div className="mt-4">
                  <button type="button" className="btn-primary">
                    Update Password
                  </button>
                </div>
              </div>
              
              <div className="pt-6 border-t">
                <h3 className="text-md font-medium mb-2">Two-Factor Authentication</h3>
                <p className="text-gray-500 mb-4">
                  Add an extra layer of security to your account by enabling two-factor authentication.
                </p>
                
                <div className="flex items-start mb-4">
                  <div className="flex items-center h-5">
                    <input
                      id="enable-2fa"
                      name="enable-2fa"
                      type="checkbox"
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="enable-2fa" className="font-medium text-gray-700">
                      Enable Two-Factor Authentication
                    </label>
                    <p className="text-gray-500">Require a verification code when signing in.</p>
                  </div>
                </div>
                
                <button type="button" className="btn-secondary">
                  Configure Two-Factor Authentication
                </button>
              </div>
              
              <div className="pt-6 border-t">
                <h3 className="text-md font-medium mb-2">Login Sessions</h3>
                <p className="text-gray-500 mb-4">
                  Manage your active login sessions and devices.
                </p>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Current Session</p>
                      <p className="text-sm text-gray-500">Windows • Chrome • Mumbai, India</p>
                      <p className="text-xs text-gray-400">May 15, 2025 (Active now)</p>
                    </div>
                    <div>
                      <span className="badge badge-green">Current</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Mobile App</p>
                      <p className="text-sm text-gray-500">Android • SK Tutorials App • Mumbai, India</p>
                      <p className="text-xs text-gray-400">May 14, 2025 (2 days ago)</p>
                    </div>
                    <div>
                      <button className="text-red-600 hover:text-red-800 text-sm font-medium">
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
                
                <button type="button" className="btn-secondary mt-4 text-red-600 border-red-600 hover:bg-red-50">
                  Logout from All Devices
                </button>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'payment' && (
          <div className="space-y-6">
            <h2 className="text-lg font-medium">Payment Settings</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-md font-medium mb-2">Fee Structure</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="academic-year" className="block text-sm font-medium text-gray-700 mb-1">
                      Academic Year
                    </label>
                    <select id="academic-year" name="academic-year" className="input-field">
                      <option value="2025-2026">2025-2026</option>
                      <option value="2024-2025">2024-2025</option>
                      <option value="2023-2024">2023-2024</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="fee-cycle" className="block text-sm font-medium text-gray-700 mb-1">
                      Fee Collection Cycle
                    </label>
                    <select id="fee-cycle" name="fee-cycle" className="input-field">
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="semester">Semester</option>
                      <option value="annual">Annual</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="late-fee" className="block text-sm font-medium text-gray-700 mb-1">
                      Late Fee Amount (₹)
                    </label>
                    <input
                      type="number"
                      id="late-fee"
                      name="late-fee"
                      className="input-field"
                      defaultValue="200"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="grace-period" className="block text-sm font-medium text-gray-700 mb-1">
                      Grace Period (Days)
                    </label>
                    <input
                      type="number"
                      id="grace-period"
                      name="grace-period"
                      className="input-field"
                      defaultValue="7"
                    />
                  </div>
                </div>
              </div>
              
              <div className="pt-6 border-t">
                <h3 className="text-md font-medium mb-2">Payment Methods</h3>
                <p className="text-gray-500 mb-4">
                  Configure accepted payment methods for fee collection.
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="cash-payment"
                        name="cash-payment"
                        type="checkbox"
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                        defaultChecked
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="cash-payment" className="font-medium text-gray-700">
                        Cash Payment
                      </label>
                      <p className="text-gray-500">Accept direct cash payments at the institute.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="card-payment"
                        name="card-payment"
                        type="checkbox"
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                        defaultChecked
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="card-payment" className="font-medium text-gray-700">
                        Credit/Debit Card
                      </label>
                      <p className="text-gray-500">Accept card payments through payment gateway.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="upi-payment"
                        name="upi-payment"
                        type="checkbox"
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                        defaultChecked
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="upi-payment" className="font-medium text-gray-700">
                        UPI Payments
                      </label>
                      <p className="text-gray-500">Accept UPI payments (GPay, PhonePe, etc.).</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="netbanking-payment"
                        name="netbanking-payment"
                        type="checkbox"
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                        defaultChecked
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="netbanking-payment" className="font-medium text-gray-700">
                        Net Banking
                      </label>
                      <p className="text-gray-500">Accept net banking payments through payment gateway.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="cheque-payment"
                        name="cheque-payment"
                        type="checkbox"
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                        defaultChecked
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="cheque-payment" className="font-medium text-gray-700">
                        Cheque/DD
                      </label>
                      <p className="text-gray-500">Accept payments via cheque or demand draft.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="pt-6 border-t">
                <h3 className="text-md font-medium mb-2">Receipt Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="receipt-prefix" className="block text-sm font-medium text-gray-700 mb-1">
                      Receipt Number Prefix
                    </label>
                    <input
                      type="text"
                      id="receipt-prefix"
                      name="receipt-prefix"
                      className="input-field"
                      defaultValue="SKT-"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="receipt-start" className="block text-sm font-medium text-gray-700 mb-1">
                      Receipt Start Number
                    </label>
                    <input
                      type="number"
                      id="receipt-start"
                      name="receipt-start"
                      className="input-field"
                      defaultValue="1001"
                    />
                  </div>
                  
                  <div className="flex items-start md:col-span-2">
                    <div className="flex items-center h-5">
                      <input
                        id="auto-email-receipt"
                        name="auto-email-receipt"
                        type="checkbox"
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                        defaultChecked
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="auto-email-receipt" className="font-medium text-gray-700">
                        Automatically Email Receipts
                      </label>
                      <p className="text-gray-500">Send receipt via email when payment is recorded.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button type="button" className="btn-primary flex items-center">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;