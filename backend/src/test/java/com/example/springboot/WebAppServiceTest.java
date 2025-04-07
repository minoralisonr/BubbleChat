package com.example.springboot;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;

import java.time.Instant;
import java.util.Date;
import java.util.List;
import java.util.UUID;

@SpringBootTest
public class WebAppServiceTest {
	@Autowired
	private WebAppService service;

	@MockBean
	private MessageRepository repository;

//	@Test
//	public void getChats() throws Exception {
//		// arrange
//		FriendRequest request = new FriendRequest(UUID.randomUUID().toString(), UUID.randomUUID().toString(), "");
//		MessageEntity message = new MessageEntity(0L, "test", "test", "test", Instant.now());
//		List<MessageRequest> expected = List.of(new MessageRequest(message.getId(), message.getSender(), message.getRecipient(), message.getMessage(), Date.from(message.getSentAt())));
//
//		when(repository.findBySenderAndRecipient(request.getUserId(), request.getFriendId())).thenReturn(List.of(message));
//
//		// act
//		List<MessageRequest> result = service.getChats(request);
//
//		// assert
//		for (int i = 0; i < expected.size() && i < result.size(); i++) {
//			assertEquals(expected.get(i).getId(), result.get(i).getId());
//			assertEquals(expected.get(i).getUser(), result.get(i).getUser());
//			assertEquals(expected.get(i).getText(), result.get(i).getText());
//			assertEquals(expected.get(i).getTimestamp(), result.get(i).getTimestamp());
//		}
//	}
}