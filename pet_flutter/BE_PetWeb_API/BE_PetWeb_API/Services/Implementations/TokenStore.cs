using System;
using System.Collections.Concurrent;

namespace BE_PetWeb_API.Services.Implementations
{
    public static class TokenStore
    {
        // Sử dụng ConcurrentDictionary cho thread-safe
        private static readonly ConcurrentDictionary<string, DateTime> _usedTokens
            = new ConcurrentDictionary<string, DateTime>();

        // Sử dụng ConcurrentDictionary cho thread-safe
        private static readonly ConcurrentDictionary<string, string> _otpStore
            = new ConcurrentDictionary<string, string>();

        public static void AddUsedToken(string jti, DateTime expiryDate)
        {
            _usedTokens.TryAdd(jti, expiryDate);
            CleanupExpiredTokens();
        }

        public static bool IsTokenUsed(string jti)
        {
            return _usedTokens.ContainsKey(jti);
        }

        public static void StoreOtp(string email, string jwtToken)
        {
            _otpStore.AddOrUpdate(email, jwtToken, (key, oldValue) => jwtToken);
        }

        public static string GetOtpToken(string email)
        {
            _otpStore.TryGetValue(email, out string token);
            return token;
        }

        public static void RemoveOtp(string email)
        {
            _otpStore.TryRemove(email, out _);
        }

        private static void CleanupExpiredTokens()
        {
            var now = DateTime.UtcNow;
            foreach (var token in _usedTokens)
            {
                if (token.Value < now)
                {
                    _usedTokens.TryRemove(token.Key, out _);
                }
            }
        }
    }
}