package Kilsme.SF.boot.service;

import Kilsme.SF.boot.dao.UserDao;
import Kilsme.SF.boot.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    @Autowired
    private UserDao userDao;

    public boolean isPhoneExist(String phone) {
        User user = userDao.selectByPhone(phone);
       if(user != null){
           return true;
       }
        return false;
    }

    public void insert(User user) {
        userDao.insert(user);

    }

    public User getUserByPhone(String phone) {
        return userDao.selectByPhone(phone);
    }
}
