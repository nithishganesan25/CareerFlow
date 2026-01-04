import {
    initializeApp
} from 'firebase/app';
import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    sendEmailVerification,
    updateProfile
} from 'firebase/auth';

// Your web app's Firebase configuration
// TODO: Replace with your actual Firebase config from Firebase Console
const firebaseConfig = {
    apiKey: "AIzaSyD0McoXj31HRXovilPTvfXSohiS4PbfK0Q",
    authDomain: "careerflow-app-6bdbb.firebaseapp.com",
    projectId: "careerflow-app-6bdbb",
    storageBucket: "careerflow-app-6bdbb.firebasestorage.app",
    messagingSenderId: "409717206418",
    appId: "1:409717206418:web:88c31308473dac4ee5254b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
// Add Gmail scope to read emails
googleProvider.addScope('https://www.googleapis.com/auth/gmail.readonly');

// Auth functions
export const signInWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        // Get the Google API Access Token (needed for Gmail API)
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;

        // Attach token to user object so we can use it in the app
        const user = result.user;
        user.gmailAccessToken = token;

        return user;
    } catch (error) {
        console.error("Error signing in with Google:", error);
        throw error;
    }
};

export const registerWithEmail = async (email, password, name) => {
    try {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        console.log("User created:", result.user.email);

        // Update the user profile with their name
        if (name) {
            await updateProfile(result.user, {
                displayName: name
            });
            console.log("User profile updated with name:", name);
        }

        // Send email verification (Welcome Email)
        await sendEmailVerification(result.user);
        console.log("Verification email sent to:", result.user.email);

        // Refresh the user object to include the display name
        return auth.currentUser;
    } catch (error) {
        console.error("Error registering with email:", error);
        throw error;
    }
};

export const loginWithEmail = async (email, password) => {
    try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        return result.user;
    } catch (error) {
        console.error("Error logging in with email:", error);
        throw error;
    }
};

export const sendPasswordReset = async (email) => {
    try {
        console.log("Attempting to send reset email to:", email);
        await sendPasswordResetEmail(auth, email);
        console.log("Password reset email sent successfully!");
    } catch (error) {
        console.error("Error sending password reset email:", error);
        throw error;
    }
};

export const updateUserProfile = async (user, displayName) => {
    try {
        await updateProfile(user, { displayName });
        return user;
    } catch (error) {
        console.error("Error updating profile:", error);
        throw error;
    }
};

export const logOut = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Error signing out:", error);
        throw error;
    }
};

export const onAuthChange = (callback) => {
    return onAuthStateChanged(auth, callback);
};

