package Kilsme.SF.boot.controller;

import Kilsme.SF.boot.model.User;
import Kilsme.SF.boot.service.UserService;
import Kilsme.SF.boot.utils.Result;
import cn.hutool.core.util.RandomUtil;
import jakarta.annotation.Resource;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class UserController {
    @Resource
    private UserService userService;
    @PostMapping("/captcha")
    public Result sendCaptcha(HttpSession session) {
        String code = RandomUtil.randomNumbers(6);
        session.setAttribute("captcha", code);
        return Result.ok(code);
    }
    @PostMapping("/login")
    public Result login(@RequestBody String phone, @RequestBody String code, HttpSession session) {
     if(!userService.isPhoneExist(phone)){
         //不存在
         User user = new User();
         user.setPhone(phone);
         user.setPassword("11111");
         user.setUsername("user"+RandomUtil.randomString(10));
     }
        User userByPhone = userService.getUserByPhone(phone);
     session.setAttribute("currentUser", userByPhone);
     return Result.ok("登录成功");
    }

    @GetMapping("/me")
    public Result getCurrentUser(HttpServletRequest request) {
        User currentUser = (User) request.getSession().getAttribute("currentUser");
        if (currentUser == null) {
            return Result.fail( "未登录");
        }
        return Result.ok("success");
    }

}
