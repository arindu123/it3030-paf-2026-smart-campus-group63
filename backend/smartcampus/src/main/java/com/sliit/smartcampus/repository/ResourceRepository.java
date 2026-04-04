package com.sliit.smartcampus.repository;

import com.sliit.smartcampus.entity.Resource;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ResourceRepository extends JpaRepository<Resource, Long> {
}