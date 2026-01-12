# User Profile Features Implementation

## Features Added

### 1. Image Cropping During Signup
- Added `react-image-crop` library for image cropping functionality
- Created `ImageCropper` component with circular crop for avatars
- Updated signup flow to allow users to crop their profile picture before uploading
- Images are automatically saved as JPG format with 95% quality

### 2. User Settings Page
- Created new `/settings` route and Settings page
- Users can edit:
  - Profile photo (with cropping)
  - First name
  - Last name
  - Phone number
  - Email (read-only)
- Added "Settings" option in user dropdown menu (both desktop and mobile)
- Settings accessible by clicking user icon in navbar

## Files Modified

1. **src/components/ImageCropper.tsx** (NEW)
   - Reusable image cropping component
   - Circular crop with 1:1 aspect ratio
   - Dialog-based UI

2. **src/pages/Settings.tsx** (NEW)
   - User profile settings page
   - Load and update user profile data
   - Avatar upload with cropping

3. **src/pages/Auth.tsx** (MODIFIED)
   - Added image cropping to signup flow
   - Replaced direct file upload with crop workflow

4. **src/components/Navbar.tsx** (MODIFIED)
   - Added Settings menu item in user dropdown
   - Added Settings icon import

5. **src/App.tsx** (MODIFIED)
   - Added `/settings` route

6. **src/contexts/AuthContext.tsx** (MODIFIED)
   - Updated signUp return type to include data

## How to Use

### For Users Signing Up:
1. Go to signup page
2. Click on avatar placeholder
3. Select an image
4. Crop the image in the dialog
5. Click "Apply" to confirm
6. Complete signup form
7. Profile picture is automatically uploaded

### For Existing Users:
1. Click on user icon in navbar
2. Select "Settings"
3. Update profile information
4. Click "Change Photo" to update avatar
5. Crop new image if needed
6. Click "Save Changes"

## Database Requirements

The implementation uses the existing `user_profiles` table and `avatars` storage bucket from the COMPLETE_DATABASE_UPDATE.sql file. No additional database changes needed.

## Dependencies Added

- `react-image-crop`: ^11.0.7 (for image cropping functionality)
