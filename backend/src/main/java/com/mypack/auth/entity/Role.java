package com.mypack.auth.entity;

/**
 * Drives the role-wise permission module: ADMIN can manage other users'
 * roles and see admin-only UI; MANAGER/USER are regular authenticated users.
 */
public enum Role {
    ADMIN,
    MANAGER,
    USER
}
