package com.sliit.smartcampus.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class PageRedirectController {

    @GetMapping({"/Component/Login", "/login"})
    public String redirectToLoginPage() {
        return "redirect:http://localhost:3000/Component/Login";
    }

    @GetMapping({"/Component/Register", "/register"})
    public String redirectToRegisterPage() {
        return "redirect:http://localhost:3000/Component/Register";
    }
}
