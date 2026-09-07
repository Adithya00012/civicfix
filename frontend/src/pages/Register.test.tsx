import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, it, expect } from "vitest";
import Register from "./Register";

describe("Register page", () => {
    it("renders name, email, and password fields", () => {
        render(
            <BrowserRouter>
                <Register />
            </BrowserRouter>
        );

        expect(screen.getByPlaceholderText("Name")).toBeDefined();
        expect(screen.getByPlaceholderText("Email")).toBeDefined();
        expect(screen.getByPlaceholderText("Password")).toBeDefined();
        expect(screen.getByRole("button", { name: "Register" })).toBeDefined();
    });
});