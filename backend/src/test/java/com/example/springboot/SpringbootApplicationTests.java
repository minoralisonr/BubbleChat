package com.example.springboot;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;

@SpringBootTest
class SpringbootApplicationTests {
	@MockBean
	private WebAppService service;

	@Test
	void contextLoads() {
	}

}
