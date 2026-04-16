package tn.esprit.user.Service;

import tn.esprit.user.Entity.User;

import java.util.List;

public interface IUserService {

    public User addUser(User user);
    public void removeUser(Long userId);
    public User login(String email, String rawPassword);
    public List<User> retrieveAllUsers();
    public User retrieveUser(Long userId);
}
