// __mocks__/firebase/auth.js
export const getAuth = jest.fn(() => {
	return {
		currentUser: { uid: 'test-uid', email: 'test@example.com' }
	};
});

export const onAuthStateChanged = jest.fn((auth, callback) => {
	// Simulate a user being logged in
	callback({ uid: 'test-uid', email: 'test@example.com' });
});