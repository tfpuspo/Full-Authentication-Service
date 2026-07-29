package com.mypack.auth.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.Map;

/**
 * Minimal, dependency-free (no spring-security-oauth2-client) implementation
 * of the standard OAuth 2.0 Authorization Code flow against Google.
 *
 * Flow:
 *  1. buildAuthorizationUrl() -> browser is sent to Google's consent screen
 *  2. Google redirects back to our callback with a one-time `code`
 *  3. exchangeCodeForUserInfo(code) trades that code for the user's
 *     verified email/name/Google ID ("sub")
 */
@Service
@Slf4j
public class GoogleOAuthService {

    private static final String AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";
    private static final String TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
    private static final String USERINFO_ENDPOINT = "https://www.googleapis.com/oauth2/v3/userinfo";

    @Value("${google.oauth.client-id}")
    private String clientId;

    @Value("${google.oauth.client-secret}")
    private String clientSecret;

    @Value("${google.oauth.redirect-uri}")
    private String redirectUri;

    private final RestTemplate restTemplate = new RestTemplate();

    public record GoogleUserInfo(String sub, String email, boolean emailVerified, String name) {}

    public String buildAuthorizationUrl(String state) {
        return UriComponentsBuilder.fromHttpUrl(AUTH_ENDPOINT)
                .queryParam("client_id", clientId)
                .queryParam("redirect_uri", redirectUri)
                .queryParam("response_type", "code")
                .queryParam("scope", "openid email profile")
                .queryParam("state", state)
                .queryParam("prompt", "select_account")
                .build()
                .toUriString();
    }

    @SuppressWarnings("unchecked")
    public GoogleUserInfo exchangeCodeForUserInfo(String code) {
        // ── Step 1: authorization code -> access token ──────────
        HttpHeaders tokenHeaders = new HttpHeaders();
        tokenHeaders.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> tokenBody = new LinkedMultiValueMap<>();
        tokenBody.add("code", code);
        tokenBody.add("client_id", clientId);
        tokenBody.add("client_secret", clientSecret);
        tokenBody.add("redirect_uri", redirectUri);
        tokenBody.add("grant_type", "authorization_code");

        Map<String, Object> tokenResponse = restTemplate.postForObject(
                TOKEN_ENDPOINT, new HttpEntity<>(tokenBody, tokenHeaders), Map.class);

        if (tokenResponse == null || tokenResponse.get("access_token") == null) {
            throw new IllegalStateException("Google did not return an access token.");
        }
        String googleAccessToken = (String) tokenResponse.get("access_token");

        // ── Step 2: access token -> user profile ────────────────
        HttpHeaders userInfoHeaders = new HttpHeaders();
        userInfoHeaders.setBearerAuth(googleAccessToken);

        Map<String, Object> profile = restTemplate.exchange(
                USERINFO_ENDPOINT,
                HttpMethod.GET,
                new HttpEntity<>(userInfoHeaders),
                Map.class
        ).getBody();

        if (profile == null || profile.get("email") == null) {
            throw new IllegalStateException("Google did not return an email address.");
        }

        return new GoogleUserInfo(
                (String) profile.get("sub"),
                (String) profile.get("email"),
                Boolean.TRUE.equals(profile.get("email_verified")),
                (String) profile.getOrDefault("name", profile.get("email"))
        );
    }
}
