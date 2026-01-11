/**
 * Android App Icons Configuration for HpyRide
 * 
 * Standard Android app icon sizes:
 * 
 * For adaptive icons (Android 8.0+):
 * - Foreground layer: 108dp x 108dp (432px x 432px at xxxhdpi)
 * - Background layer: 108dp x 108dp (432px x 432px at xxxhdpi)
 * - Safe zone: 72dp x 72dp centered (icons should fit within this area)
 * 
 * Legacy icon sizes (mipmap folders):
 * - mipmap-mdpi: 48x48 px
 * - mipmap-hdpi: 72x72 px
 * - mipmap-xhdpi: 96x96 px
 * - mipmap-xxhdpi: 144x144 px
 * - mipmap-xxxhdpi: 192x192 px
 * 
 * After running npx cap add android, copy the generated icons to:
 * android/app/src/main/res/mipmap-*
 * 
 * Notification icon (required for push notifications):
 * - res/drawable-mdpi/ic_notification.png: 24x24 px
 * - res/drawable-hdpi/ic_notification.png: 36x36 px
 * - res/drawable-xhdpi/ic_notification.png: 48x48 px
 * - res/drawable-xxhdpi/ic_notification.png: 72x72 px
 * - res/drawable-xxxhdpi/ic_notification.png: 96x96 px
 * 
 * The notification icon should be white with transparent background.
 * 
 * To generate all required sizes:
 * 1. Use Android Asset Studio
 * 2. Or use a command-line tool
 * 
 * The app icon source is located at: public/icons/app-icon.png
 */

export const ANDROID_ICON_SIZES = {
  mdpi: 48,
  hdpi: 72,
  xhdpi: 96,
  xxhdpi: 144,
  xxxhdpi: 192,
} as const;

export const NOTIFICATION_ICON_SIZES = {
  mdpi: 24,
  hdpi: 36,
  xhdpi: 48,
  xxhdpi: 72,
  xxxhdpi: 96,
} as const;

export const APP_COLORS = {
  primary: '#3B82F6',
  primaryDark: '#1E40AF',
  accent: '#EC4899',
  background: '#FFFFFF',
} as const;
