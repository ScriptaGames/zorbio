//! schemapack wire-format primitives.
//!
//! The original game serializes binary websocket messages with the `schemapack`
//! npm package (v1.4.2).  To remain byte-compatible with the existing client we
//! reimplement the exact wire format here:
//!
//! * all multi-byte scalars are **big endian** (`writeFloatBE`, `readUInt16BE`, ...)
//! * `varuint` is LEB128 (7 bits per byte, little-endian groups, 0x80 continuation)
//! * `string` is a varuint byte-length followed by UTF-8 bytes
//! * arrays are a varuint element count followed by the elements
//! * objects encode their fields **in lexicographically sorted key order**
//!   (schemapack sorts keys with `keys.sort()` before compiling a schema)
//!
//! Field order for every message below was derived by sorting the schema keys
//! from common/schemas.js the same way schemapack does.  See protocol.rs.

#[derive(Debug)]
pub struct DecodeError(pub String);

impl std::fmt::Display for DecodeError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "schemapack decode error: {}", self.0)
    }
}

impl std::error::Error for DecodeError {}

pub type Result<T> = std::result::Result<T, DecodeError>;

fn err<T>(msg: impl Into<String>) -> Result<T> {
    Err(DecodeError(msg.into()))
}

// ---------------------------------------------------------------------------
// Writing
// ---------------------------------------------------------------------------

pub fn put_u8(buf: &mut Vec<u8>, v: u8) {
    buf.push(v);
}

pub fn put_bool(buf: &mut Vec<u8>, v: bool) {
    buf.push(if v { 1 } else { 0 });
}

pub fn put_i16(buf: &mut Vec<u8>, v: i16) {
    buf.extend_from_slice(&v.to_be_bytes());
}

pub fn put_u16(buf: &mut Vec<u8>, v: u16) {
    buf.extend_from_slice(&v.to_be_bytes());
}

pub fn put_u32(buf: &mut Vec<u8>, v: u32) {
    buf.extend_from_slice(&v.to_be_bytes());
}

/// writeFloatBE - JS numbers are f64, the wire is f32.
pub fn put_f32(buf: &mut Vec<u8>, v: f64) {
    buf.extend_from_slice(&(v as f32).to_be_bytes());
}

/// schemapack writeVarUInt (LEB128).
pub fn put_varuint(buf: &mut Vec<u8>, mut value: u64) {
    while value > 127 {
        buf.push(((value & 127) as u8) | 128);
        value >>= 7;
    }
    buf.push((value & 127) as u8);
}

/// schemapack writeString - varuint byte length + UTF-8 bytes.
pub fn put_string(buf: &mut Vec<u8>, s: &str) {
    let bytes = s.as_bytes();
    put_varuint(buf, bytes.len() as u64);
    buf.extend_from_slice(bytes);
}

/// Array length prefix (varuint element count).
pub fn put_array_len(buf: &mut Vec<u8>, len: usize) {
    put_varuint(buf, len as u64);
}

// ---------------------------------------------------------------------------
// Reading
// ---------------------------------------------------------------------------

pub struct Reader<'a> {
    data: &'a [u8],
    pos: usize,
}

#[allow(dead_code)]
impl<'a> Reader<'a> {
    pub fn new(data: &'a [u8]) -> Self {
        Reader { data, pos: 0 }
    }

    pub fn remaining(&self) -> usize {
        self.data.len().saturating_sub(self.pos)
    }

    fn take(&mut self, n: usize) -> Result<&'a [u8]> {
        if self.pos + n > self.data.len() {
            return err(format!(
                "unexpected end of buffer (need {} bytes at offset {})",
                n, self.pos
            ));
        }
        let s = &self.data[self.pos..self.pos + n];
        self.pos += n;
        Ok(s)
    }

    pub fn u8(&mut self) -> Result<u8> {
        Ok(self.take(1)?[0])
    }

    pub fn bool(&mut self) -> Result<bool> {
        Ok(self.take(1)?[0] != 0)
    }

    pub fn i16(&mut self) -> Result<i16> {
        let b = self.take(2)?;
        Ok(i16::from_be_bytes([b[0], b[1]]))
    }

    pub fn u16(&mut self) -> Result<u16> {
        let b = self.take(2)?;
        Ok(u16::from_be_bytes([b[0], b[1]]))
    }

    pub fn u32(&mut self) -> Result<u32> {
        let b = self.take(4)?;
        Ok(u32::from_be_bytes([b[0], b[1], b[2], b[3]]))
    }

    /// readFloatBE, returned as f64 (JS numbers are doubles).
    pub fn f32(&mut self) -> Result<f64> {
        let b = self.take(4)?;
        Ok(f32::from_be_bytes([b[0], b[1], b[2], b[3]]) as f64)
    }

    /// schemapack readVarUInt (LEB128).  The JS implementation uses 32-bit
    /// shifts, so values above 2^31 wrap; we mirror the sane range only.
    pub fn varuint(&mut self) -> Result<u64> {
        let mut val: u64 = 0;
        let mut i = 0;
        loop {
            let b = self.u8()?;
            val |= ((b & 127) as u64) << (7 * i);
            i += 1;
            if b & 128 == 0 {
                break;
            }
            if i > 8 {
                return err("varuint too long");
            }
        }
        Ok(val)
    }

    pub fn string(&mut self) -> Result<String> {
        let len = self.varuint()? as usize;
        let bytes = self.take(len)?;
        String::from_utf8(bytes.to_vec()).map_err(|e| DecodeError(format!("invalid utf8: {}", e)))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn varuint_roundtrip() {
        for v in [0u64, 1, 127, 128, 300, 16384, 29791, 30000, u32::MAX as u64] {
            let mut buf = Vec::new();
            put_varuint(&mut buf, v);
            let mut r = Reader::new(&buf);
            assert_eq!(r.varuint().unwrap(), v);
        }
    }

    #[test]
    fn varuint_known_bytes() {
        // 300 = 0b100101100 -> LEB128: 0xAC 0x02
        let mut buf = Vec::new();
        put_varuint(&mut buf, 300);
        assert_eq!(buf, vec![0xAC, 0x02]);
        // 0 -> 0x00, 1 -> 0x01
        let mut buf = Vec::new();
        put_varuint(&mut buf, 0);
        assert_eq!(buf, vec![0x00]);
    }

    #[test]
    fn string_roundtrip() {
        let mut buf = Vec::new();
        put_string(&mut buf, "zorbio");
        assert_eq!(&buf[..2], &[6, b'z']);
        let mut r = Reader::new(&buf);
        assert_eq!(r.string().unwrap(), "zorbio");
    }

    #[test]
    fn f32_be() {
        let mut buf = Vec::new();
        put_f32(&mut buf, 7.0);
        assert_eq!(buf, vec![0x40, 0xE0, 0x00, 0x00]); // 7.0f32 BE
        let mut r = Reader::new(&buf);
        assert_eq!(r.f32().unwrap(), 7.0);
    }
}
