package backend.controller;

import backend.exception.UserNotFoundException;
import backend.model.UserModel;
import backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;
import java.util.Objects;


@RestController
@CrossOrigin("http://localhost:3001")
public class UserController {
    @Autowired
    private UserRepository userRepository;

    //insert
    @PostMapping("/user")
    public UserModel newUserModel(@RequestBody UserModel newUserModel){
        return userRepository.save(newUserModel);
    }

    //User login
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login (@RequestBody UserModel loginDetails){
        UserModel user = userRepository.findByEmail(loginDetails.getEmail())
                .orElseThrow(()->new UserNotFoundException("Email not found : "+ loginDetails.getEmail()));

        //check the password is matches
        if (user.getPassword().equals(loginDetails.getPassword())){
            Map<String,Object> response = new HashMap<>();
            response.put("message","Login Successfull");
            response.put("id",user.getId());//return user id
            return ResponseEntity.ok(response);
        }else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "invalid credentials !"));
        }
    }
}
