package com.sliit.smartcampus.repository;

import com.sliit.smartcampus.entity.User;
import com.sliit.smartcampus.enums.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    long countByRole(UserRole role);
    List<User> findAllByRole(UserRole role);
}
