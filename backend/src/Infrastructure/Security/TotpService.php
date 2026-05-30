<?php

declare(strict_types=1);

namespace App\Infrastructure\Security;

use App\Infrastructure\Config\Env;

final class TotpService
{
    private const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

    public function secret(int $length = 32): string
    {
        $secret = '';
        for ($i = 0; $i < $length; $i++) {
            $secret .= self::ALPHABET[random_int(0, strlen(self::ALPHABET) - 1)];
        }
        return $secret;
    }

    public function provisioningUri(string $email, string $secret): string
    {
        $issuer = (string) Env::get('TOTP_ISSUER', 'MultEmpresas');
        return 'otpauth://totp/' . rawurlencode($issuer . ':' . $email) . '?secret=' . $secret . '&issuer=' . rawurlencode($issuer) . '&algorithm=SHA1&digits=6&period=30';
    }

    public function verify(string $secret, string $code): bool
    {
        $code = preg_replace('/\D/', '', $code) ?? '';
        for ($i = -1; $i <= 1; $i++) {
            if (hash_equals($this->code($secret, (int) floor(time() / 30) + $i), $code)) {
                return true;
            }
        }
        return false;
    }

    private function code(string $secret, int $counter): string
    {
        $key = $this->base32Decode($secret);
        $binCounter = pack('N*', 0) . pack('N*', $counter);
        $hash = hash_hmac('sha1', $binCounter, $key, true);
        $offset = ord(substr($hash, -1)) & 0x0F;
        $part = unpack('N', substr($hash, $offset, 4))[1] & 0x7fffffff;
        return str_pad((string) ($part % 1000000), 6, '0', STR_PAD_LEFT);
    }

    private function base32Decode(string $secret): string
    {
        $secret = strtoupper($secret);
        $buffer = 0; $bits = 0; $output = '';
        foreach (str_split($secret) as $char) {
            $value = strpos(self::ALPHABET, $char);
            if ($value === false) { continue; }
            $buffer = ($buffer << 5) | $value;
            $bits += 5;
            if ($bits >= 8) {
                $output .= chr(($buffer >> ($bits - 8)) & 0xFF);
                $bits -= 8;
            }
        }
        return $output;
    }
}
