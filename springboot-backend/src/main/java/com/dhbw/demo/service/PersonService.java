package com.dhbw.demo.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.dhbw.demo.model.Persons;
import com.dhbw.demo.repository.PersonRepository;

@Service
public class PersonService {

	
	@Autowired
	private PersonRepository personRepository;
	
	
	public List<Persons> findAll(){
		return personRepository.findAll();
	}
	
	
}
