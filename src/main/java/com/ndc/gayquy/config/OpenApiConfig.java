package com.ndc.gayquy.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.tags.Tag;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    private static final String SECURITY_SCHEME_NAME = "BearerAuth";

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Hệ thống gây quỹ Trường PT Chuyên Biệt Nguyễn Đình Chiểu")
                        .description("RESTful API chia theo tác nhân (Guest, Donor, ...)")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Ban Quản Trị Hệ Thống NDC")
                                .email("admin@ndc.edu.vn"))
                        .license(new License().name("Apache 2.0").url("https://springdoc.org")))
                .tags(List.of(
                        new Tag().name("Guest").description("Các API dành cho Khách vãng lai (Đăng ký, Đăng nhập, Bài đăng, Sao kê, Học sinh)"),
                        new Tag().name("Donor").description("Các API dành cho Nhà hảo tâm (Hồ sơ, Đóng góp tài trợ, Đề xuất, Tiến độ & Minh chứng, Lịch sử, Phản hồi)"),
                        new Tag().name("Parent").description("Các API dành cho Phụ huynh học sinh (Danh sách con, Lịch sử hỗ trợ, Minh chứng trao tặng, Phản hồi)"),
                        new Tag().name("Fundraiser").description("Các API dành cho Cán bộ quản lý gây quỹ (Bài đăng, Duyệt đề xuất & xác nhận tiền, Phân bổ, Minh chứng, Phản hồi)")
                ))
                .addSecurityItem(new SecurityRequirement().addList(SECURITY_SCHEME_NAME))
                .components(new Components()
                        .addSecuritySchemes(SECURITY_SCHEME_NAME,
                                new SecurityScheme()
                                        .name(SECURITY_SCHEME_NAME)
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")));
    }
}
