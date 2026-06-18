package com.example.springrentMe;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class SpringrentMeApplication {

	public static void main(String[] args) {
		SpringApplication.run(SpringrentMeApplication.class, args);
	}

	@org.springframework.context.annotation.Bean
	public org.springframework.boot.CommandLineRunner dropCheckConstraint(org.springframework.jdbc.core.JdbcTemplate jdbcTemplate) {
		return args -> {
			try {
				jdbcTemplate.execute("ALTER TABLE documents DROP CONSTRAINT IF EXISTS documents_document_type_check;");
				System.out.println("Successfully dropped documents_document_type_check check constraint.");
			} catch (Exception e) {
				System.err.println("Could not drop constraint: " + e.getMessage());
			}
		};
	}

}


