// cypress/e2e/critical-flows.cy.js
describe('Critical User Flows E2E Tests', () => {
  beforeEach(() => {
    // Visit the app
    cy.visit('/');
  });

  describe('Flow 1: User Registration and Login', () => {
    it('should complete registration and login flow', () => {
      // Navigate to register page
      cy.visit('/register');
      
      // Fill registration form
      cy.get('input[name="full_name"]').type('Test User');
      cy.get('input[name="email"]').type('testuser@university.edu');
      cy.get('input[name="password"]').type('Password123');
      cy.get('input[name="confirmPassword"]').type('Password123');
      cy.get('input[name="student_number"]').type('20219999');
      
      // Select department
      cy.get('select[name="department_id"]').select(1);
      
      // Accept terms
      cy.get('input[type="checkbox"]').check();
      
      // Submit form
      cy.get('button[type="submit"]').click();
      
      // Should show success message
      cy.contains(/Kayıt başarılı/i).should('be.visible');
      
      // Navigate to login
      cy.visit('/login');
      
      // Login
      cy.get('input[name="email"]').type('testuser@university.edu');
      cy.get('input[name="password"]').type('Password123');
      cy.get('button[type="submit"]').click();
      
      // Should redirect to dashboard
      cy.url().should('include', '/dashboard');
    });
  });

  describe('Flow 2: Course Enrollment', () => {
    beforeEach(() => {
      // Mock login
      cy.window().then((win) => {
        win.localStorage.setItem('accessToken', 'fake-token');
        win.localStorage.setItem('user', JSON.stringify({
          id: '1',
          email: 'student@test.edu',
          role: 'student',
          fullName: 'Test Student'
        }));
      });
    });

    it('should enroll in a course', () => {
      cy.visit('/enroll');
      
      // Wait for courses to load
      cy.contains(/CS101|Introduction/i, { timeout: 10000 }).should('be.visible');
      
      // Click enroll button
      cy.get('button').contains(/Enroll|Kayıt/i).first().click();
      
      // Should show success message
      cy.contains(/success|başarılı/i, { timeout: 5000 }).should('be.visible');
    });
  });

  describe('Flow 3: Event Registration', () => {
    beforeEach(() => {
      cy.window().then((win) => {
        win.localStorage.setItem('accessToken', 'fake-token');
        win.localStorage.setItem('user', JSON.stringify({
          id: '1',
          email: 'student@test.edu',
          role: 'student'
        }));
      });
    });

    it('should register for an event', () => {
      cy.visit('/events');
      
      // Wait for events to load
      cy.contains(/Event|Etkinlik/i, { timeout: 10000 }).should('be.visible');
      
      // Click on event or register button
      cy.get('button').contains(/Register|Kayıt/i).first().click();
      
      // Should show success message or redirect
      cy.url().should('satisfy', (url) => {
        return url.includes('/events') || url.includes('/my-events');
      });
    });
  });

  describe('Flow 4: Wallet Top-up', () => {
    beforeEach(() => {
      cy.window().then((win) => {
        win.localStorage.setItem('accessToken', 'fake-token');
        win.localStorage.setItem('user', JSON.stringify({
          id: '1',
          email: 'student@test.edu',
          role: 'student'
        }));
      });
    });

    it('should top up wallet', () => {
      cy.visit('/wallet');
      
      // Wait for wallet page to load
      cy.contains(/Balance|Bakiye/i, { timeout: 10000 }).should('be.visible');
      
      // Enter top-up amount
      cy.get('input[type="number"]').first().type('100');
      
      // Click top-up button
      cy.get('button').contains(/Top up|Yükle/i).click();
      
      // Should show payment session or success
      cy.contains(/session|success|başarılı/i, { timeout: 5000 }).should('be.visible');
    });
  });

  describe('Flow 5: Attendance Marking', () => {
    beforeEach(() => {
      cy.window().then((win) => {
        win.localStorage.setItem('accessToken', 'fake-token');
        win.localStorage.setItem('user', JSON.stringify({
          id: '1',
          email: 'student@test.edu',
          role: 'student'
        }));
      });
    });

    it('should mark attendance', () => {
      cy.visit('/give-attendance');
      
      // Mock geolocation
      cy.window().then((win) => {
        cy.stub(win.navigator.geolocation, 'getCurrentPosition').callsFake((callback) => {
          callback({
            coords: {
              latitude: 41.0082,
              longitude: 28.9784,
              accuracy: 10
            }
          });
        });
      });
      
      // Wait for page to load
      cy.contains(/Attendance|Yoklama/i, { timeout: 10000 }).should('be.visible');
      
      // Click mark attendance button
      cy.get('button').contains(/Mark|İşaretle/i).click();
      
      // Should show success message
      cy.contains(/success|başarılı/i, { timeout: 5000 }).should('be.visible');
    });
  });

  describe('Flow 6: View Grades', () => {
    beforeEach(() => {
      cy.window().then((win) => {
        win.localStorage.setItem('accessToken', 'fake-token');
        win.localStorage.setItem('user', JSON.stringify({
          id: '1',
          email: 'student@test.edu',
          role: 'student'
        }));
      });
    });

    it('should view student grades', () => {
      cy.visit('/grades');
      
      // Wait for grades to load
      cy.contains(/Grade|Not|GPA/i, { timeout: 10000 }).should('be.visible');
      
      // Should display grade information
      cy.get('table, .grade, [class*="grade"]').should('exist');
    });
  });

  describe('Flow 7: Profile Update', () => {
    beforeEach(() => {
      cy.window().then((win) => {
        win.localStorage.setItem('accessToken', 'fake-token');
        win.localStorage.setItem('user', JSON.stringify({
          id: '1',
          email: 'student@test.edu',
          role: 'student',
          fullName: 'Test Student'
        }));
      });
    });

    it('should update user profile', () => {
      cy.visit('/profile');
      
      // Wait for profile page to load
      cy.contains(/Profile|Profil/i, { timeout: 10000 }).should('be.visible');
      
      // Update full name
      cy.get('input[name="full_name"]').clear().type('Updated Name');
      
      // Update phone
      cy.get('input[name="phone"]').clear().type('555-1234');
      
      // Submit form
      cy.get('button[type="submit"]').click();
      
      // Should show success message
      cy.contains(/success|başarılı|updated/i, { timeout: 5000 }).should('be.visible');
    });
  });
});

