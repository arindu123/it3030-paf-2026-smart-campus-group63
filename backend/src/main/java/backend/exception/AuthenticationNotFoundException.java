package backend.exception;

public class AuthenticationNotFoundException extends RuntimeException {
  public AuthenticationNotFoundException(String message) {
    super(message);
  }
}
