package com.suances.personnel.dto.response;

public class LoginResponse {

    private String accessToken;
    private String tokenType = "Bearer";
    private long expiresIn;
    private UserInfoResponse userInfo;

    public LoginResponse(String accessToken, long expiresIn, UserInfoResponse userInfo) {
        this.accessToken = accessToken;
        this.expiresIn = expiresIn;
        this.userInfo = userInfo;
    }

    public String getAccessToken() {
        return accessToken;
    }

    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }

    public String getTokenType() {
        return tokenType;
    }

    public void setTokenType(String tokenType) {
        this.tokenType = tokenType;
    }

    public long getExpiresIn() {
        return expiresIn;
    }

    public void setExpiresIn(long expiresIn) {
        this.expiresIn = expiresIn;
    }

    public UserInfoResponse getUserInfo() {
        return userInfo;
    }

    public void setUserInfo(UserInfoResponse userInfo) {
        this.userInfo = userInfo;
    }
}
