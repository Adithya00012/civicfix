import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, it, expect } from "vitest";
import Login from "./Login";

describe("Login page", () => {
    it("renders email and password fields", () => {
        render(
            <BrowserRouter>
                <Login />
            </BrowserRouter>
        );

        expect(screen.getByPlaceholderText("Email")).toBeDefined();
        expect(screen.getByPlaceholderText("Password")).toBeDefined();
        expect(screen.getByRole("button", { name: "Login" })).toBeDefined();
    });
});