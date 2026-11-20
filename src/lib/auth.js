export const EMAIL_DOMAIN = 'gymtracker.app'
export const USERNAME_REGEX = /^[a-z0-9_]{3,20}$/

export const usernameToEmail = (username) =>
  `${username.trim().toLowerCase()}@${EMAIL_DOMAIN}`