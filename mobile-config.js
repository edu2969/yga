App.info({
    id: 'com.ti4all.simen',
    name: 'SIMEN',
    description: 'SIMEN - Sistema de gestión',
    author: 'yGa, Eduardo Troncoso M',
    email: 'edtronco@gmail.com',
    website: 'https://gestion.simen.cl',
    version: '1.0'
});

App.icons({
    "iphone_2x": "public/resources/icons/icon-60@2x.png", // 120x120
    "iphone_3x": "public/resources/icons/icon-60@3x.png", // 180x180
    "ios_settings": "public/resources/icons/icon-small.png", // 29x29
    "ios_settings_2x": "public/resources/icons/icon-small@2x.png", // 58x58
    "ios_settings_3x": "public/resources/icons/icon-small@3x.png", // 87x87
    "ios_spotlight": "public/resources/icons/icon-small-40.png", // 40x40
    "ios_spotlight_2x": "public/resources/icons/icon-small-40@2x.png", // 80x80
    "ios_notification": "public/resources/icons/icon-xsmall.png", // 20x20
    "ios_notification_2x": "public/resources/icons/icon-small-40.png", // 40x40
    "ios_notification_3x":"public/resources/icons/icon-60.png", // 60x60
    "iphone_legacy": "public/resources/icons/icon.png", // 57x57
    "iphone_legacy_2x": "public/resources/icons/icon@2x.png", // 114x114
    "android_mdpi": "public/resources/icons/mdpi.png", // 48x48
    "android_hdpi": "public/resources/icons/hdpi.png", // 72x72
    "android_xhdpi": "public/resources/icons/xhdpi.png", // 96x96
    "android_xxhdpi": "public/resources/icons/xxhdpi.png", // 144x144
    "android_xxxhdpi": "public/resources/icons/xxxhdpi.png", // 192x192
});

App.launchScreens({
    "iphone": "public/resources/splashes/splash-port-mdpi.png", // 320x480
    "iphone_2x": "public/resources/splashes/s_640x490.png", // 640x490
    "iphone5": "public/resources/splashes/splash-640x1136.png", // 640x1136
    "iphone6": "public/resources/splashes/Default@2x~iphone~comany.png", // 750x1334
    "iphone6p_portrait": "public/resources/splashes/splash_2208x1242.png", // 2208x1242
    "iphone6p_landscape": "public/resources/splashes/splash_2208x1242.png", // 2208x1242
    "android_mdpi_portrait": "public/resources/splashes/splash-port-mdpi.png", // 320x480
    "android_mdpi_landscape": "public/resources/splashes/splash-480x320.png", // 480x320
    "android_hdpi_portrait": "public/resources/splashes/splash-port-hdpi.png", // 480x800
    "android_hdpi_landscape": "public/resources/splashes/splash-800x480.png", // 800x480
    "android_xhdpi_portrait": "public/resources/splashes/splash-port-xhdpi.png", // 720x1280
    "android_xhdpi_landscape": "public/resources/splashes/splash-1280x720.png", // 1280x720
    "android_xxhdpi_portrait": "public/resources/splashes/splash-1080x1440.png", // 1080x1440
    "android_xxhdpi_landscape": "public/resources/splashes/splash-1440x1080.png", // 1440x1080
});

App.setPreference('BackgroundColor', '0xffffff');
App.setPreference('HideKeyboardFormAccessoryBar', true);
App.setPreference('Orientation', 'default');
App.setPreference('Orientation', 'all', 'ios');
App.setPreference('AutoHideSplashScreen', 'true');
App.setPreference('android-minSdkVersion', '19');
App.setPreference('android-targetSdkVersion', '28');