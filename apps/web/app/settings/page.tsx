"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { User, Shield, Moon, Sun, Key, Edit2, Save, X, Eye, EyeOff } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { toast } from "sonner"

interface UserProfile {
  id: string
  email: string
  full_name: string
  role: string
  is_active: boolean
  department?: string
  permissions: string[]
  created_at: string
  updated_at: string
  last_login?: string
}

export default function SettingsPage() {
  const { user: authUser } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [darkMode, setDarkMode] = useState(false)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    full_name: "",
    department: ""
  })

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: ""
  })

  useEffect(() => {
    loadUserProfile()
  }, [])

  const loadUserProfile = async () => {
    try {
      setLoading(true)
      const response = await apiClient.getUserProfile()
      if (response.success && response.data) {
        setProfile(response.data)
        setProfileForm({
          full_name: response.data.full_name || "",
          department: response.data.department || ""
        })
      } else {
        toast.error("Failed to load profile")
      }
    } catch (error) {
      console.error("Error loading profile:", error)
      toast.error("Error loading profile")
    } finally {
      setLoading(false)
    }
  }

  const handleProfileUpdate = async () => {
    try {
      const response = await apiClient.updateUserProfile(profileForm)
      if (response.success) {
        setProfile(prev => prev ? {
          ...prev,
          full_name: profileForm.full_name,
          department: profileForm.department
        } : null)
        setIsEditingProfile(false)
        toast.success("Profile updated successfully")
      } else {
        toast.error(response.error || "Failed to update profile")
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error("Error updating profile")
    }
  }

  const handlePasswordChange = async () => {
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      toast.error("New passwords don't match")
      return
    }

    if (passwordForm.new_password.length < 8) {
      toast.error("Password must be at least 8 characters long")
      return
    }

    try {
      const response = await apiClient.changePassword({
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password
      })

      if (response.success) {
        setPasswordForm({
          current_password: "",
          new_password: "",
          confirm_password: ""
        })
        setIsChangingPassword(false)
        toast.success("Password changed successfully")
      } else {
        toast.error(response.error || "Failed to change password")
      }
    } catch (error) {
      console.error("Error changing password:", error)
      toast.error("Error changing password")
    }
  }

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-gray-500">Failed to load profile information</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm sm:text-base text-gray-600">Manage your account preferences and application settings</p>
      </div>

      <div className="space-y-4 sm:space-y-6">
        {/* User Profile Section */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-base sm:text-lg font-medium text-gray-900 flex items-center">
              <User className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Profile Information
            </h2>
            <button
              onClick={() => setIsEditingProfile(!isEditingProfile)}
              className="flex items-center px-2 py-1 sm:px-3 sm:py-1 text-xs sm:text-sm text-blue-600 hover:text-blue-800"
            >
              {isEditingProfile ? (
                <>
                  <X className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  Cancel
                </>
              ) : (
                <>
                  <Edit2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  Edit
                </>
              )}
            </button>
          </div>
          <div className="p-4 sm:p-6 space-y-4">
            {isEditingProfile ? (
              <>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={profileForm.full_name}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, full_name: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Department
                    </label>
                    <input
                      type="text"
                      value={profileForm.department}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, department: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter department"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2 sm:space-x-3 pt-4">
                  <button
                    onClick={() => setIsEditingProfile(false)}
                    className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleProfileUpdate}
                    className="px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-600 text-white text-xs sm:text-sm font-medium rounded-md hover:bg-blue-700 flex items-center"
                  >
                    <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    Save Changes
                  </button>
                </div>
              </>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="text-xs sm:text-sm font-medium text-gray-500">Email</label>
                    <p className="text-sm sm:text-base text-gray-900 break-all">{profile.email}</p>
                  </div>
                  <div>
                    <label className="text-xs sm:text-sm font-medium text-gray-500">Full Name</label>
                    <p className="text-sm sm:text-base text-gray-900">{profile.full_name}</p>
                  </div>
                  <div>
                    <label className="text-xs sm:text-sm font-medium text-gray-500">Department</label>
                    <p className="text-sm sm:text-base text-gray-900">{profile.department || "Not specified"}</p>
                  </div>
                </div>
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="text-xs sm:text-sm font-medium text-gray-500">Role</label>
                    <div className="flex items-center">
                      <Shield className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-blue-600" />
                      <span className="capitalize px-2 py-0.5 sm:py-1 bg-blue-100 text-blue-800 rounded-full text-xs sm:text-sm">
                        {profile.role}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs sm:text-sm font-medium text-gray-500">Status</label>
                    <span className={`inline-flex items-center px-2 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm ${
                      profile.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {profile.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div>
                    <label className="text-xs sm:text-sm font-medium text-gray-500">Member Since</label>
                    <p className="text-sm sm:text-base text-gray-900">{formatDate(profile.created_at)}</p>
                  </div>
                  {profile.last_login && (
                    <div>
                      <label className="text-xs sm:text-sm font-medium text-gray-500">Last Login</label>
                      <p className="text-sm sm:text-base text-gray-900">{formatDate(profile.last_login)}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Change Password Section */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-base sm:text-lg font-medium text-gray-900 flex items-center">
              <Key className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Password Security
            </h2>
            <button
              onClick={() => setIsChangingPassword(!isChangingPassword)}
              className="flex items-center px-2 py-1 sm:px-3 sm:py-1 text-xs sm:text-sm text-blue-600 hover:text-blue-800"
            >
              {isChangingPassword ? (
                <>
                  <X className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  Cancel
                </>
              ) : (
                <>
                  <Key className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  Change Password
                </>
              )}
            </button>
          </div>
          <div className="p-4 sm:p-6">
            {isChangingPassword ? (
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? "text" : "password"}
                      value={passwordForm.current_password}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, current_password: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('current')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPasswords.current ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? "text" : "password"}
                      value={passwordForm.new_password}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, new_password: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                      placeholder="Enter new password (min 8 characters)"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('new')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPasswords.new ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? "text" : "password"}
                      value={passwordForm.confirm_password}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, confirm_password: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('confirm')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPasswords.confirm ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="text-xs sm:text-sm text-gray-500">
                  Password must be at least 8 characters long and contain uppercase, lowercase, numbers, and special characters.
                </div>
                <div className="flex justify-end space-x-2 sm:space-x-3 pt-4">
                  <button
                    onClick={() => {
                      setIsChangingPassword(false)
                      setPasswordForm({
                        current_password: "",
                        new_password: "",
                        confirm_password: ""
                      })
                    }}
                    className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePasswordChange}
                    disabled={!passwordForm.current_password || !passwordForm.new_password || !passwordForm.confirm_password}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    <Key className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    Change Password
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-sm sm:text-base text-gray-600 mb-4">Keep your account secure by using a strong password.</p>
                <p className="text-xs sm:text-sm text-gray-500">
                  Last password update: {formatDate(profile.updated_at)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Permissions Section */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-200">
            <h2 className="text-base sm:text-lg font-medium text-gray-900 flex items-center">
              <Shield className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Permissions
            </h2>
          </div>
          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
              {profile.permissions.map((permission) => (
                <div
                  key={permission}
                  className="flex items-center px-2 py-1 sm:px-3 sm:py-2 bg-blue-50 text-blue-700 rounded-md text-sm"
                >
                  <Shield className="h-3 w-3 sm:h-3 sm:w-3 mr-1 sm:mr-2" />
                  {permission.replace('_', ' ').toUpperCase()}
                </div>
              ))}
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-3">
              Permissions are managed by administrators. Contact your admin to request changes.
            </p>
          </div>
        </div>

        {/* Appearance Settings */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-200">
            <h2 className="text-base sm:text-lg font-medium text-gray-900">Appearance</h2>
          </div>
          <div className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {darkMode ? (
                  <Moon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 mr-2 sm:mr-3" />
                ) : (
                  <Sun className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 mr-2 sm:mr-3" />
                )}
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-900">Dark Mode</p>
                  <p className="text-xs sm:text-sm text-gray-500">Toggle between light and dark themes</p>
                </div>
              </div>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`relative inline-flex h-5 w-10 sm:h-6 sm:w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  darkMode ? "bg-blue-600" : "bg-gray-200"
                }`}
              >
                <span
                  className={`inline-block h-3 w-3 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                    darkMode ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
