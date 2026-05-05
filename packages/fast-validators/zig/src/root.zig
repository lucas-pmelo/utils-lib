const std = @import("std");

var buffer: [256]u8 = undefined;

export fn bufferPtr() [*]u8 {
    return &buffer;
}

export fn bufferLen() u32 {
    return buffer.len;
}

fn isDigit(c: u8) bool {
    return c >= '0' and c <= '9';
}

fn isUpper(c: u8) bool {
    return c >= 'A' and c <= 'Z';
}

fn isLower(c: u8) bool {
    return c >= 'a' and c <= 'z';
}

fn isAlpha(c: u8) bool {
    return isUpper(c) or isLower(c);
}

fn isAlphaNum(c: u8) bool {
    return isAlpha(c) or isDigit(c);
}

fn allDigits(slice: []const u8) bool {
    for (slice) |c| {
        if (!isDigit(c)) return false;
    }
    return true;
}

fn allSame(slice: []const u8) bool {
    if (slice.len == 0) return true;
    for (slice[1..]) |c| {
        if (c != slice[0]) return false;
    }
    return true;
}

// ---------- CPF ----------

fn cpfDigit(base: []const u8, start_factor: u32) u8 {
    var total: u32 = 0;
    var factor: u32 = start_factor;
    for (base) |c| {
        total += (@as(u32, c) - '0') * factor;
        factor -= 1;
    }
    const rest = (total * 10) % 11;
    return @intCast(if (rest == 10) 0 else rest);
}

export fn isValidCPF(len: u32) u32 {
    if (len != 11) return 0;
    const cpf = buffer[0..11];

    if (!allDigits(cpf)) return 0;
    if (allSame(cpf)) return 0;

    const d1 = cpfDigit(cpf[0..9], 10);
    const d2 = cpfDigit(cpf[0..10], 11);

    if (d1 != cpf[9] - '0') return 0;
    if (d2 != cpf[10] - '0') return 0;
    return 1;
}

// ---------- CNPJ ----------

const cnpj_w1 = [_]u32{ 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2 };
const cnpj_w2 = [_]u32{ 6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2 };

fn cnpjDigit(base: []const u8, weights: []const u32) u8 {
    var total: u32 = 0;
    for (base, 0..) |c, i| {
        total += (@as(u32, c) - '0') * weights[i];
    }
    const rest = total % 11;
    return @intCast(if (rest < 2) 0 else 11 - rest);
}

export fn isValidCNPJ(len: u32) u32 {
    if (len != 14) return 0;
    const cnpj = buffer[0..14];

    if (!allDigits(cnpj)) return 0;
    if (allSame(cnpj)) return 0;

    const d1 = cnpjDigit(cnpj[0..12], &cnpj_w1);
    const d2 = cnpjDigit(cnpj[0..13], &cnpj_w2);

    if (d1 != cnpj[12] - '0') return 0;
    if (d2 != cnpj[13] - '0') return 0;
    return 1;
}

// ---------- Email ----------
// Pragmatic validation. Length 5..254, exactly one '@', local + domain
// validated char-by-char, TLD must be 2+ alphabetic chars.

fn isLocalChar(c: u8) bool {
    return isAlphaNum(c) or c == '.' or c == '_' or c == '-' or c == '+';
}

fn isDomainChar(c: u8) bool {
    return isAlphaNum(c) or c == '.' or c == '-';
}

export fn isValidEmail(len: u32) u32 {
    if (len < 5 or len > 254) return 0;
    const email = buffer[0..len];

    var at_pos: i32 = -1;
    for (email, 0..) |c, i| {
        if (c == '@') {
            if (at_pos != -1) return 0;
            at_pos = @intCast(i);
        }
    }
    if (at_pos <= 0 or at_pos >= @as(i32, @intCast(len)) - 1) return 0;

    const at: usize = @intCast(at_pos);
    const local = email[0..at];
    const domain = email[at + 1 ..];

    if (local[0] == '.' or local[local.len - 1] == '.') return 0;
    for (local, 0..) |c, i| {
        if (!isLocalChar(c)) return 0;
        if (c == '.' and i > 0 and local[i - 1] == '.') return 0;
    }

    if (domain[0] == '.' or domain[0] == '-') return 0;
    if (domain[domain.len - 1] == '.' or domain[domain.len - 1] == '-') return 0;

    var last_dot: i32 = -1;
    for (domain, 0..) |c, i| {
        if (!isDomainChar(c)) return 0;
        if (c == '.') {
            if (i > 0 and (domain[i - 1] == '.' or domain[i - 1] == '-')) return 0;
            if (i + 1 < domain.len and domain[i + 1] == '-') return 0;
            last_dot = @intCast(i);
        }
    }
    if (last_dot == -1) return 0;

    const tld = domain[@as(usize, @intCast(last_dot)) + 1 ..];
    if (tld.len < 2) return 0;
    for (tld) |c| {
        if (!isAlpha(c)) return 0;
    }

    return 1;
}

// ---------- Plate (BR) ----------
// Classic format:  AAA1234   (3 letters, 4 digits)
// Mercosul format: AAA1B23   (3 letters, digit, letter, 2 digits)
// Buffer must contain 7 uppercase ASCII chars.

export fn isValidPlate(len: u32) u32 {
    if (len != 7) return 0;
    const p = buffer[0..7];

    if (!isUpper(p[0]) or !isUpper(p[1]) or !isUpper(p[2])) return 0;
    if (!isDigit(p[3])) return 0;
    if (!isDigit(p[5]) or !isDigit(p[6])) return 0;

    // Position 4: digit (classic) or letter (mercosul)
    if (!isDigit(p[4]) and !isUpper(p[4])) return 0;

    return 1;
}

// ---------- Phone (BR) ----------
// Accepts 10 or 11 digits (DDD + number). Optionally allows leading "55"
// country code (12 or 13 digits total). Mobile (11 digits after country
// code) must have '9' immediately after the DDD. DDD must be 11..99.

export fn isValidPhone(len: u32) u32 {
    var actual_len: u32 = len;
    var offset: u32 = 0;

    if (len == 12 or len == 13) {
        if (buffer[0] != '5' or buffer[1] != '5') return 0;
        offset = 2;
        actual_len = len - 2;
    }

    if (actual_len != 10 and actual_len != 11) return 0;

    const p = buffer[offset .. offset + actual_len];
    if (!allDigits(p)) return 0;

    if (p[0] < '1' or p[0] > '9') return 0;
    if (p[1] < '1' or p[1] > '9') return 0;

    if (actual_len == 11 and p[2] != '9') return 0;

    return 1;
}

// ---------- Tests ----------

test "valid CPF" {
    @memcpy(buffer[0..11], "11144477735");
    try std.testing.expectEqual(@as(u32, 1), isValidCPF(11));
}

test "invalid CPF (all same)" {
    @memcpy(buffer[0..11], "11111111111");
    try std.testing.expectEqual(@as(u32, 0), isValidCPF(11));
}

test "valid CNPJ" {
    @memcpy(buffer[0..14], "11222333000181");
    try std.testing.expectEqual(@as(u32, 1), isValidCNPJ(14));
}

test "invalid CNPJ (bad checksum)" {
    @memcpy(buffer[0..14], "11222333000180");
    try std.testing.expectEqual(@as(u32, 0), isValidCNPJ(14));
}

test "valid email" {
    const e = "lucas.pmelo@gmail.com";
    @memcpy(buffer[0..e.len], e);
    try std.testing.expectEqual(@as(u32, 1), isValidEmail(e.len));
}

test "invalid email - no @" {
    const e = "lucasgmail.com";
    @memcpy(buffer[0..e.len], e);
    try std.testing.expectEqual(@as(u32, 0), isValidEmail(e.len));
}

test "invalid email - short tld" {
    const e = "a@b.c";
    @memcpy(buffer[0..e.len], e);
    try std.testing.expectEqual(@as(u32, 0), isValidEmail(e.len));
}

test "invalid email - consecutive dots" {
    const e = "a..b@x.com";
    @memcpy(buffer[0..e.len], e);
    try std.testing.expectEqual(@as(u32, 0), isValidEmail(e.len));
}

test "valid plate classic" {
    @memcpy(buffer[0..7], "ABC1234");
    try std.testing.expectEqual(@as(u32, 1), isValidPlate(7));
}

test "valid plate mercosul" {
    @memcpy(buffer[0..7], "ABC1B23");
    try std.testing.expectEqual(@as(u32, 1), isValidPlate(7));
}

test "invalid plate - lowercase" {
    @memcpy(buffer[0..7], "abc1234");
    try std.testing.expectEqual(@as(u32, 0), isValidPlate(7));
}

test "invalid plate - wrong shape" {
    @memcpy(buffer[0..7], "1234ABC");
    try std.testing.expectEqual(@as(u32, 0), isValidPlate(7));
}

test "valid phone landline" {
    @memcpy(buffer[0..10], "1133334444");
    try std.testing.expectEqual(@as(u32, 1), isValidPhone(10));
}

test "valid phone mobile" {
    @memcpy(buffer[0..11], "11933334444");
    try std.testing.expectEqual(@as(u32, 1), isValidPhone(11));
}

test "valid phone with country code" {
    @memcpy(buffer[0..13], "5511933334444");
    try std.testing.expectEqual(@as(u32, 1), isValidPhone(13));
}

test "invalid phone - mobile without 9" {
    @memcpy(buffer[0..11], "11833334444");
    try std.testing.expectEqual(@as(u32, 0), isValidPhone(11));
}

test "invalid phone - DDD starting with 0" {
    @memcpy(buffer[0..11], "01933334444");
    try std.testing.expectEqual(@as(u32, 0), isValidPhone(11));
}
