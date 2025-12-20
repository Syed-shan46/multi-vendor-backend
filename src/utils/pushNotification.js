const admin = require('firebase-admin');

// Initialize Firebase Admin (Singleton check)
if (!admin.apps.length) {
    try {
        // Warning: User must have serviceAccountKey.json in root
        const serviceAccount = require('../../serviceAccountKey.json');
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log("Firebase Admin Initialized");
    } catch (error) {
        console.warn("Firebase Admin Initialization Failed (Check serviceAccountKey.json): ", error.message);
    }
}

const sendPushNotification = async (fcmToken, title, body, data = {}) => {
    try {
        if (!fcmToken) {
            console.log("No FCM Token provided for notification");
            return;
        }

        if (!admin.apps.length) {
            console.log("Firebase Admin not initialized, skipping notification");
            return;
        }

        const message = {
            notification: {
                title,
                body
            },
            data: {
                ...data,
                click_action: 'FLUTTER_NOTIFICATION_CLICK'
            },
            token: fcmToken
        };

        const response = await admin.messaging().send(message);
        console.log('Successfully sent push notification:', response);
        return response;
    } catch (error) {
        console.log('Error sending push notification:', error.message);
        return null;
    }
};

module.exports = sendPushNotification;
