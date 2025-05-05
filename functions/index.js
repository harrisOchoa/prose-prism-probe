
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.addAdminRole = functions.https.onCall((data, context) => {
  // Check if the request is made by an admin
  if (context.auth.token.admin !== true) {
    return { error: 'Only admins can add other admins' };
  }
  
  // Get the user by email
  return admin.auth().getUserByEmail(data.email)
    .then(user => {
      // Set custom claim for the user
      return admin.auth().setCustomUserClaims(user.uid, {
        admin: true
      });
    })
    .then(() => {
      return { 
        success: true,
        message: `User ${data.email} has been made an admin`
      };
    })
    .catch(err => {
      return { error: err.message };
    });
});
