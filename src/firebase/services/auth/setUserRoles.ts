
import { getFunctions, httpsCallable } from "firebase/functions";
import { auth } from "../../config";

// This function would be called from an admin interface to set a user as an admin
export const setAdminRole = async (email: string): Promise<boolean> => {
  try {
    const functions = getFunctions();
    const addAdminRole = httpsCallable(functions, 'addAdminRole');
    
    const result = await addAdminRole({ email });
    console.log('Admin role assigned:', result);
    return true;
  } catch (error) {
    console.error('Error assigning admin role:', error);
    return false;
  }
};

// Function to check if the current user has admin privileges
export const checkAdminRole = async (): Promise<boolean> => {
  try {
    // Force token refresh to get the latest custom claims
    await auth.currentUser?.getIdToken(true);
    
    // Get the current user's token
    const idTokenResult = await auth.currentUser?.getIdTokenResult();
    
    // Check if the user has the admin custom claim
    return idTokenResult?.claims?.admin === true || false;
  } catch (error) {
    console.error('Error checking admin role:', error);
    return false;
  }
};
