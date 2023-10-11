describe("Auth Testing", () => {
  describe("Registration", () => {
    it("should register a new user", () => {
      cy.visit("/");
      cy.location("pathname").should("eq", "/register");
      cy.get('input[name="email"]').type("testing200@example.com");
      cy.get('input[name="password"]').type("testing@123");
      cy.get('input[name="confirm"]').type("testing@123");
      cy.get("form").submit();
      cy.location("pathname").should("include", "/write");
    });

    it("Shows error if user already exists", () => {
      cy.visit("/");
      cy.location("pathname").should("eq", "/register");
      cy.get('input[name="email"]').type("testing100@example.com");
      cy.get('input[name="password"]').type("testing@123");
      cy.get('input[name="confirm"]').type("testing@123");
      cy.get("form").submit();
      cy.contains("User already exists");
    });
  });

  describe("Login", () => {
    it("should login an existing user", () => {
      cy.visit("/login");
      cy.get('input[name="email"]').type("testing101@example.com");
      cy.get('input[name="password"]').type("testing@123");
      cy.get("form").submit();
      cy.location("pathname").should("include", "/write");
      const token = sessionStorage.getItem("token");
      cy.window()
        .its("sessionStorage")
        .invoke("getItem", "token")
        .should("exist");
    });

    it("should throw an error for incorrect password", () => {
      cy.visit("/login");
      cy.get('input[name="email"]').type("testing101@example.com");
      cy.get('input[name="password"]').type("wrong");
      cy.get("form").submit();
      cy.contains("Incorrect password");
    });

    it("should throw an error for invalid user", () => {
      cy.visit("/login");
      cy.get('input[name="email"]').type("testing300@example.com");
      cy.get('input[name="password"]').type("wrong");
      cy.get("form").submit();
      cy.contains("User does not exist");
    });
  });

  describe("Write", () => {
    it("should redirect to login on missing token", () => {
      cy.visit("/write");
      cy.location("pathname").should("include", "/login");
      cy.contains("Session expired. Please login again");
    });

    it("should redirect to login on invalid token", () => {
      sessionStorage.setItem("token", "invalid");
      cy.visit("/write");
      cy.location("pathname").should("include", "/login");
      cy.contains("Session expired. Please login again");
    });
  });
});
