package com.example.springrentMe.exceptions;

public class BookingNotCompletedException extends RuntimeException {
    public BookingNotCompletedException(String message) {
        super(message);
    }
}
