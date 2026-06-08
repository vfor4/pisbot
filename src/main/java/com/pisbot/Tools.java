package com.pisbot;

import dev.langchain4j.agent.tool.Tool;

class Tools {
    
    @Tool
    int add(int a, int b) {
        System.out.println("add call ne ku");
        return a + b;
    }

    @Tool
    int multiply(int a, int b) {
        System.out.println("multiply call ne ku");
        return a * b;
    }
}