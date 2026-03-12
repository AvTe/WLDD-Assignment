import admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'tasktracker-67b04',
  });
}

export default admin;
