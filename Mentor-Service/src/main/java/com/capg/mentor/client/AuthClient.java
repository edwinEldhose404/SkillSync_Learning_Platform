package com.capg.mentor.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;
import java.util.Map;

@FeignClient(
        name = "authentication-service",
        configuration = FeignConfig.class
)
public interface AuthClient {

    @PutMapping("/api/auth/admin/role")
    void updateRole(@RequestParam("email") String email, @RequestParam("role") String role);

    @GetMapping("/api/auth/user/{id}")
    Map<String, Object> getUserById(@PathVariable("id") Long id);
}
