import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config/environment';
import { User } from '../models/User';
import { RefreshToken } from '../models/RefreshToken';
import {
  BadRequestError, ConflictError, NotFoundError, UnauthorizedError,
} from '../utils/errors';
import { calculateExpiry, generateToken } from '../utils/helpers';
import logger from '../utils/logger';
import type { RegisterInput, LoginInput } from '../validators/auth.validator';

export class AuthService {
  /**
   * Register a new user
   */
  async register(data: RegisterInput) {
    const existing = await User.findOne({ where: { email: data.email } });
    if (existing) {
      throw new ConflictError('Email is already registered');
    }

    const user = await User.create({
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      password: data.password,
      phone: data.phone || null,
      role: data.role || 'site_engineer',
    });

    const tokens = await this.generateTokens(user);
    logger.info(`User registered: ${user.email}`);

    return { user: user.toSafeJSON(), ...tokens };
  }

  /**
   * Login with email and password
   */
  async login(data: LoginInput) {
    const user = await User.findOne({ where: { email: data.email } });
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (!user.is_active) {
      throw new UnauthorizedError('Account is deactivated');
    }

    const isMatch = await user.comparePassword(data.password);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password');
    }

    await user.update({ last_login: new Date() });
    const tokens = await this.generateTokens(user);
    logger.info(`User logged in: ${user.email}`);

    return { user: user.toSafeJSON(), ...tokens };
  }

  /**
   * Refresh access token using a refresh token
   */
  async refreshToken(token: string) {
    const refreshToken = await RefreshToken.findOne({
      where: { token },
      include: [{ model: User }],
    });

    if (!refreshToken || !refreshToken.isValid) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    const user = await User.findByPk(refreshToken.user_id);
    if (!user || !user.is_active) {
      throw new UnauthorizedError('User not found or inactive');
    }

    // Revoke the old refresh token
    await refreshToken.update({ is_revoked: true });

    // Generate new tokens
    const tokens = await this.generateTokens(user);
    return { user: user.toSafeJSON(), ...tokens };
  }

  /**
   * Logout — revoke refresh token
   */
  async logout(refreshTokenStr: string) {
    await RefreshToken.update(
      { is_revoked: true },
      { where: { token: refreshTokenStr } }
    );
  }

  /**
   * Forgot password — generate reset token
   */
  async forgotPassword(email: string) {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      // Don't reveal if email exists
      return { message: 'If the email exists, a reset link has been sent' };
    }

    const resetToken = generateToken();
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    await user.update({
      reset_password_token: hashedToken,
      reset_password_expires: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
    });

    // TODO: Send email with resetToken
    logger.info(`Password reset requested for: ${email}. Token: ${resetToken}`);

    return { message: 'If the email exists, a reset link has been sent', resetToken };
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      where: { reset_password_token: hashedToken },
    });

    if (!user || !user.reset_password_expires || user.reset_password_expires < new Date()) {
      throw new BadRequestError('Invalid or expired reset token');
    }

    await user.update({
      password: newPassword,
      reset_password_token: null,
      reset_password_expires: null,
    });

    // Revoke all refresh tokens
    await RefreshToken.update(
      { is_revoked: true },
      { where: { user_id: user.id } }
    );

    logger.info(`Password reset for: ${user.email}`);
    return { message: 'Password reset successful' };
  }

  /**
   * Change password (authenticated)
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await User.findByPk(userId);
    if (!user) throw new NotFoundError('User not found');

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) throw new BadRequestError('Current password is incorrect');

    await user.update({ password: newPassword });
    logger.info(`Password changed for: ${user.email}`);

    return { message: 'Password changed successfully' };
  }

  /**
   * Get current user profile
   */
  async getProfile(userId: string) {
    const user = await User.findByPk(userId);
    if (!user) throw new NotFoundError('User not found');
    return user.toSafeJSON();
  }

  // ─── Private Helpers ──────────────────────────────────
  private async generateTokens(user: User) {
    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      env.jwt.secret,
      { expiresIn: env.jwt.accessExpiry as jwt.SignOptions['expiresIn'] }
    );

    const refreshTokenStr = generateToken();
    await RefreshToken.create({
      user_id: user.id,
      token: refreshTokenStr,
      expires_at: calculateExpiry(env.jwt.refreshExpiry),
    });

    return { access_token: accessToken, refresh_token: refreshTokenStr };
  }
}

export const authService = new AuthService();
