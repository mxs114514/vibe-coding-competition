package Kilsme.SF.boot.dao;

import Kilsme.SF.boot.model.User;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Select;

public interface UserDao {
    @Select("SELECT * FROM user WHERE phone = #{phone}")
    User selectByPhone(String phone);
    @Insert("INSERT INTO user (id,phone, password,creat_at) VALUES (default,#{phone}, #{password},now())")
    int insert(User user);
}
