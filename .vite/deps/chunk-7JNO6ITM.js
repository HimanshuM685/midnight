import {
  EncryptionSecretKey
} from "./chunk-GUGIKMIP.js";
import {
  require_buffer
} from "./chunk-AVUHMXEH.js";
import {
  __commonJS,
  __toESM
} from "./chunk-IKZWERSR.js";

// node_modules/@subsquid/scale-codec/lib/types.js
var require_types = __commonJS({
  "node_modules/@subsquid/scale-codec/lib/types.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TypeKind = void 0;
    var TypeKind;
    (function(TypeKind2) {
      TypeKind2[TypeKind2["Primitive"] = 0] = "Primitive";
      TypeKind2[TypeKind2["Compact"] = 1] = "Compact";
      TypeKind2[TypeKind2["Sequence"] = 2] = "Sequence";
      TypeKind2[TypeKind2["BitSequence"] = 3] = "BitSequence";
      TypeKind2[TypeKind2["Array"] = 4] = "Array";
      TypeKind2[TypeKind2["Tuple"] = 5] = "Tuple";
      TypeKind2[TypeKind2["Composite"] = 6] = "Composite";
      TypeKind2[TypeKind2["Variant"] = 7] = "Variant";
      TypeKind2[TypeKind2["Option"] = 8] = "Option";
      TypeKind2[TypeKind2["DoNotConstruct"] = 9] = "DoNotConstruct";
      TypeKind2[TypeKind2["BooleanOption"] = 10] = "BooleanOption";
      TypeKind2[TypeKind2["Bytes"] = 11] = "Bytes";
      TypeKind2[TypeKind2["BytesArray"] = 12] = "BytesArray";
      TypeKind2[TypeKind2["HexBytes"] = 13] = "HexBytes";
      TypeKind2[TypeKind2["HexBytesArray"] = 14] = "HexBytesArray";
      TypeKind2[TypeKind2["Struct"] = 15] = "Struct";
    })(TypeKind || (exports.TypeKind = TypeKind = {}));
  }
});

// browser-external:assert
var require_assert = __commonJS({
  "browser-external:assert"(exports, module) {
    module.exports = Object.create(new Proxy({}, {
      get(_, key) {
        if (key !== "__esModule" && key !== "__proto__" && key !== "constructor" && key !== "splice") {
          console.warn(`Module "assert" has been externalized for browser compatibility. Cannot access "assert.${key}" in client code. See https://vite.dev/guide/troubleshooting.html#module-externalized-for-browser-compatibility for more details.`);
        }
      }
    }));
  }
});

// node_modules/@subsquid/util-internal-hex/lib/hex.js
var require_hex = __commonJS({
  "node_modules/@subsquid/util-internal-hex/lib/hex.js"(exports) {
    "use strict";
    var __importDefault = exports && exports.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.toHex = toHex2;
    exports.isHex = isHex2;
    exports.decodeHex = decodeHex;
    var assert_1 = __importDefault(require_assert());
    function toHex2(data, offset = 0, size = data.length - offset) {
      return `0x${Buffer.from(data.buffer, data.byteOffset + offset, size).toString("hex")}`;
    }
    function isHex2(value) {
      return typeof value == "string" && value.length % 2 == 0 && /^0x[a-f\d]*$/i.test(value);
    }
    function decodeHex(value) {
      (0, assert_1.default)(isHex2(value));
      return Buffer.from(value.slice(2), "hex");
    }
  }
});

// node_modules/@subsquid/scale-codec/lib/util.js
var require_util = __commonJS({
  "node_modules/@subsquid/scale-codec/lib/util.js"(exports) {
    "use strict";
    var __importDefault = exports && exports.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isObject = exports.unsignedIntByteLength = exports.UTF8_ENCODER = exports.UTF8_DECODER = exports.toUnsignedBigInt = exports.toSignedBigInt = exports.checkUnsignedBigInt = exports.checkUnsignedInt = exports.checkSignedBigInt = exports.checkSignedInt = exports.throwUnexpectedCase = exports.assertNotNull = void 0;
    var assert_1 = __importDefault(require_assert());
    function assertNotNull(val, msg) {
      (0, assert_1.default)(val != null, msg);
      return val;
    }
    exports.assertNotNull = assertNotNull;
    function throwUnexpectedCase(val) {
      throw new Error(val ? `Unexpected case: ${val}` : `Unexpected case`);
    }
    exports.throwUnexpectedCase = throwUnexpectedCase;
    function checkInt(val, sign, bitSize, min, max) {
      let ok = Number.isInteger(val) && min <= val && max >= val;
      if (!ok)
        throw new Error(`Invalid ${sign}${bitSize}: ${val}`);
    }
    function checkBigInt(val, sign, bitSize, min, max) {
      let ok = typeof val == "bigint" && min <= val && max >= val;
      if (!ok)
        throw new Error(`Invalid ${sign}${bitSize}: ${val}`);
    }
    function checkSignedInt(val, bitSize) {
      let min;
      let max;
      switch (bitSize) {
        case 8:
          min = -128;
          max = 127;
          break;
        case 16:
          min = -32768;
          max = 32767;
          break;
        case 32:
          min = -2147483648;
          max = 2147483647;
          break;
        default:
          throwUnexpectedCase(bitSize);
      }
      checkInt(val, "I", bitSize, min, max);
    }
    exports.checkSignedInt = checkSignedInt;
    function checkSignedBigInt(val, bitSize) {
      let min;
      let max;
      switch (bitSize) {
        case 64:
          min = -(2n ** 63n);
          max = 2n ** 63n - 1n;
          break;
        case 128:
          min = -(2n ** 127n);
          max = 2n ** 127n - 1n;
          break;
        case 256:
          min = -(2n ** 255n);
          max = 2n ** 255n - 1n;
          break;
        default:
          throwUnexpectedCase(bitSize);
      }
      checkBigInt(val, "I", bitSize, min, max);
    }
    exports.checkSignedBigInt = checkSignedBigInt;
    function checkUnsignedInt(val, bitSize) {
      let max;
      switch (bitSize) {
        case 8:
          max = 255;
          break;
        case 16:
          max = 65535;
          break;
        case 32:
          max = 4294967295;
          break;
        default:
          throwUnexpectedCase(bitSize);
      }
      checkInt(val, "U", bitSize, 0, max);
    }
    exports.checkUnsignedInt = checkUnsignedInt;
    function checkUnsignedBigInt(val, bitSize) {
      let max;
      switch (bitSize) {
        case 64:
          max = 0xffffffffffffffffn;
          break;
        case 128:
          max = 2n ** 128n - 1n;
          break;
        case 256:
          max = 2n ** 256n - 1n;
          break;
        default:
          throwUnexpectedCase(bitSize);
      }
      checkBigInt(val, "U", bitSize, 0n, max);
    }
    exports.checkUnsignedBigInt = checkUnsignedBigInt;
    function toSignedBigInt(val, bitSize) {
      (0, assert_1.default)(typeof val == "string" || typeof val == "number");
      val = BigInt(val);
      checkSignedBigInt(val, bitSize);
      return val;
    }
    exports.toSignedBigInt = toSignedBigInt;
    function toUnsignedBigInt(val, bitSize) {
      (0, assert_1.default)(typeof val == "string" || typeof val == "number");
      val = BigInt(val);
      checkUnsignedBigInt(val, bitSize);
      return val;
    }
    exports.toUnsignedBigInt = toUnsignedBigInt;
    exports.UTF8_DECODER = new TextDecoder("utf-8", {
      fatal: true,
      ignoreBOM: false
    });
    exports.UTF8_ENCODER = new TextEncoder();
    function unsignedIntByteLength(val) {
      let len = 0;
      while (val > 0n) {
        val = val >> 8n;
        len += 1;
      }
      return len;
    }
    exports.unsignedIntByteLength = unsignedIntByteLength;
    function isObject(value) {
      return value != null && typeof value == "object";
    }
    exports.isObject = isObject;
  }
});

// node_modules/@subsquid/scale-codec/lib/src.js
var require_src = __commonJS({
  "node_modules/@subsquid/scale-codec/lib/src.js"(exports) {
    "use strict";
    var __importDefault = exports && exports.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Src = void 0;
    var util_internal_hex_1 = require_hex();
    var assert_1 = __importDefault(require_assert());
    var util_1 = require_util();
    var Src2 = class {
      constructor(buf) {
        this.idx = 0;
        if (typeof buf == "string") {
          this.buf = (0, util_internal_hex_1.decodeHex)(buf);
        } else {
          this.buf = buf;
        }
      }
      byte() {
        let b = this.buf[this.idx];
        if (b === void 0) {
          throw eof();
        }
        this.idx += 1;
        return b;
      }
      i8() {
        let b = this.byte();
        return b | (b & 2 ** 7) * 33554430;
      }
      u8() {
        return this.byte();
      }
      i16() {
        let val = this.u16();
        return val | (val & 2 ** 15) * 131070;
      }
      u16() {
        let first = this.byte();
        let last = this.byte();
        return first + last * 2 ** 8;
      }
      i32() {
        return this.byte() + this.byte() * 2 ** 8 + this.byte() * 2 ** 16 + (this.byte() << 24);
      }
      u32() {
        return this.byte() + this.byte() * 2 ** 8 + this.byte() * 2 ** 16 + this.byte() * 2 ** 24;
      }
      i64() {
        let lo = this.u32();
        let hi = this.i32();
        return BigInt(lo) + (BigInt(hi) << 32n);
      }
      u64() {
        let lo = this.u32();
        let hi = this.u32();
        return BigInt(lo) + (BigInt(hi) << 32n);
      }
      i128() {
        let lo = this.u64();
        let hi = this.i64();
        return lo + (hi << 64n);
      }
      u128() {
        let lo = this.u64();
        let hi = this.u64();
        return lo + (hi << 64n);
      }
      i256() {
        let lo = this.u128();
        let hi = this.i128();
        return lo + (hi << 128n);
      }
      u256() {
        let lo = this.u128();
        let hi = this.u128();
        return lo + (hi << 128n);
      }
      compact() {
        let b = this.byte();
        let mode = b & 3;
        switch (mode) {
          case 0:
            return b >> 2;
          case 1:
            return (b >> 2) + this.byte() * 2 ** 6;
          case 2:
            return (b >> 2) + this.byte() * 2 ** 6 + this.byte() * 2 ** 14 + this.byte() * 2 ** 22;
          case 3:
            return this.bigCompact(b >> 2);
          default:
            throw new Error("Reached unreachable statement");
        }
      }
      bigCompact(len) {
        let i = this.u32();
        switch (len) {
          case 0:
            return i;
          case 1:
            return i + this.byte() * 2 ** 32;
          case 2:
            return i + this.byte() * 2 ** 32 + this.byte() * 2 ** 40;
        }
        let n = BigInt(i);
        let base = 32n;
        while (len--) {
          n += BigInt(this.byte()) << base;
          base += 8n;
        }
        return n;
      }
      compactLength() {
        let len = this.compact();
        (0, assert_1.default)(typeof len == "number");
        return len;
      }
      str() {
        let len = this.compactLength();
        let buf = this.bytes(len);
        return util_1.UTF8_DECODER.decode(buf);
      }
      bytes(len) {
        let beg = this.idx;
        let end = this.idx += len;
        if (this.buf.length < end) {
          throw eof();
        }
        return this.buf.subarray(beg, end);
      }
      skip(len) {
        this.idx += len;
      }
      bool() {
        return !!this.byte();
      }
      hasBytes() {
        return this.buf.length > this.idx;
      }
      assertEOF() {
        if (this.hasBytes()) {
          throw new Error("Unprocessed data left");
        }
      }
    };
    exports.Src = Src2;
    function eof() {
      return new Error("Unexpected EOF");
    }
  }
});

// node_modules/@subsquid/scale-codec/lib/sink.js
var require_sink = __commonJS({
  "node_modules/@subsquid/scale-codec/lib/sink.js"(exports) {
    "use strict";
    var __importDefault = exports && exports.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ByteSink = exports.HexSink = exports.Sink = void 0;
    var assert_1 = __importDefault(require_assert());
    var util_1 = require_util();
    var Sink = class {
      uncheckedU16(val) {
        this.write(val & 255);
        this.write(val >>> 8);
      }
      uncheckedU32(val) {
        this.write(val & 255);
        this.write(val >>> 8 & 255);
        this.write(val >>> 16 & 255);
        this.write(val >>> 24);
      }
      uncheckedU64(val) {
        this.uncheckedU32(Number(val & 0xffffffffn));
        this.uncheckedU32(Number(val >> 32n));
      }
      uncheckedU128(val) {
        this.uncheckedU64(val & 0xffffffffffffffffn);
        this.uncheckedU64(val >> 64n);
      }
      uncheckedU256(val) {
        this.uncheckedU128(val & 2n ** 128n - 1n);
        this.uncheckedU128(val >> 128n);
      }
      u8(val) {
        (0, util_1.checkUnsignedInt)(val, 8);
        this.write(val);
      }
      u16(val) {
        (0, util_1.checkUnsignedInt)(val, 16);
        this.uncheckedU16(val);
      }
      u32(val) {
        (0, util_1.checkUnsignedInt)(val, 32);
        this.uncheckedU32(val);
      }
      u64(val) {
        (0, util_1.checkUnsignedBigInt)(val, 64);
        this.uncheckedU64(val);
      }
      u128(val) {
        (0, util_1.checkUnsignedBigInt)(val, 128);
        this.uncheckedU128(val);
      }
      u256(val) {
        (0, util_1.checkUnsignedBigInt)(val, 256);
        this.uncheckedU256(val);
      }
      i8(val) {
        (0, util_1.checkSignedInt)(val, 8);
        this.write((val + 256) % 256);
      }
      i16(val) {
        (0, util_1.checkSignedInt)(val, 16);
        let base = 2 ** 16;
        val = (val + base) % base;
        this.uncheckedU16(val);
      }
      i32(val) {
        (0, util_1.checkSignedInt)(val, 32);
        let base = 2 ** 32;
        val = (val + base) % base;
        this.uncheckedU32(val);
      }
      i64(val) {
        (0, util_1.checkSignedBigInt)(val, 64);
        let base = 2n ** 64n;
        val = (val + base) % base;
        this.uncheckedU64(val);
      }
      i128(val) {
        (0, util_1.checkSignedBigInt)(val, 128);
        let base = 2n ** 128n;
        val = (val + base) % base;
        this.uncheckedU128(val);
      }
      i256(val) {
        (0, util_1.checkSignedBigInt)(val, 256);
        let base = 2n ** 256n;
        val = (val + base) % base;
        this.uncheckedU256(val);
      }
      str(val) {
        (0, assert_1.default)(typeof val == "string");
        let bytes = util_1.UTF8_ENCODER.encode(val);
        this.compact(bytes.length);
        this.bytes(bytes);
      }
      bool(val) {
        (0, assert_1.default)(typeof val == "boolean");
        this.write(Number(val));
      }
      compact(val) {
        (0, assert_1.default)((typeof val == "number" || typeof val == "bigint") && val >= 0, "invalid compact");
        if (val < 64) {
          this.write(Number(val) * 4);
        } else if (val < 2 ** 14) {
          val = Number(val);
          this.write((val & 63) * 4 + 1);
          this.write(val >>> 6);
        } else if (val < 2 ** 30) {
          val = Number(val);
          this.write((val & 63) * 4 + 2);
          this.write(val >>> 6 & 255);
          this.uncheckedU16(val >>> 14);
        } else if (val < 2n ** 536n) {
          val = BigInt(val);
          this.write((0, util_1.unsignedIntByteLength)(val) * 4 - 13);
          while (val > 0) {
            this.write(Number(val & 0xffn));
            val = val >> 8n;
          }
        } else {
          throw new Error(`${val.toString(16)} is too large for a compact`);
        }
      }
    };
    exports.Sink = Sink;
    var HexSink = class extends Sink {
      constructor() {
        super(...arguments);
        this.out = "0x";
      }
      write(byte) {
        this.out += (byte >>> 4).toString(16);
        this.out += (byte & 15).toString(16);
      }
      bytes(b) {
        if (Buffer.isBuffer(b)) {
          this.out += b.toString("hex");
        } else {
          this.out += Buffer.from(b.buffer, b.byteOffset, b.byteLength).toString("hex");
        }
      }
      toHex() {
        return this.out;
      }
    };
    exports.HexSink = HexSink;
    var ByteSink2 = class extends Sink {
      constructor() {
        super(...arguments);
        this.buf = Buffer.allocUnsafe(128);
        this.pos = 0;
      }
      alloc(size) {
        if (this.buf.length - this.pos < size) {
          let buf = Buffer.allocUnsafe(Math.max(size, this.buf.length) * 2);
          buf.set(this.buf);
          this.buf = buf;
        }
      }
      write(byte) {
        this.alloc(1);
        this.buf[this.pos] = byte;
        this.pos += 1;
      }
      bytes(b) {
        this.alloc(b.length);
        this.buf.set(b, this.pos);
        this.pos += b.length;
      }
      toBytes() {
        return this.buf.subarray(0, this.pos);
      }
    };
    exports.ByteSink = ByteSink2;
  }
});

// node_modules/@subsquid/scale-codec/lib/types-codec.js
var require_types_codec = __commonJS({
  "node_modules/@subsquid/scale-codec/lib/types-codec.js"(exports) {
    "use strict";
    var __importDefault = exports && exports.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.toCodecTypes = exports.getCodecType = void 0;
    var assert_1 = __importDefault(require_assert());
    var types_1 = require_types();
    var util_1 = require_util();
    function getCodecType(types, ti) {
      let def = types[ti];
      switch (def.kind) {
        case types_1.TypeKind.Compact: {
          let compact = types[def.type];
          (0, assert_1.default)(compact.kind == types_1.TypeKind.Primitive);
          (0, assert_1.default)(compact.primitive[0] == "U");
          return { kind: types_1.TypeKind.Compact, integer: compact.primitive };
        }
        case types_1.TypeKind.Composite:
          if (def.fields.length == 0 || def.fields[0].name == null) {
            return {
              kind: types_1.TypeKind.Tuple,
              tuple: def.fields.map((f) => {
                (0, assert_1.default)(f.name == null);
                return f.type;
              })
            };
          } else {
            return {
              kind: types_1.TypeKind.Struct,
              fields: def.fields.map((f) => {
                let name = (0, util_1.assertNotNull)(f.name);
                return { name, type: f.type };
              })
            };
          }
        case types_1.TypeKind.Variant: {
          let variants = def.variants.filter((v) => v != null);
          let variantsByName = {};
          let uniqueIndexes = new Set(variants.map((v) => v.index));
          if (uniqueIndexes.size != variants.length) {
            throw new Error(`Variant type ${ti} has duplicate case indexes`);
          }
          let len = variants.reduce((len2, v) => Math.max(len2, v.index), 0) + 1;
          let placedVariants = new Array(len);
          variants.forEach((v) => {
            let cv;
            if (v.fields[0]?.name == null) {
              switch (v.fields.length) {
                case 0:
                  cv = { kind: "empty", name: v.name, index: v.index };
                  break;
                case 1:
                  cv = { kind: "value", name: v.name, index: v.index, type: v.fields[0].type };
                  break;
                default:
                  cv = {
                    kind: "tuple",
                    name: v.name,
                    index: v.index,
                    def: {
                      kind: types_1.TypeKind.Tuple,
                      tuple: v.fields.map((f) => {
                        (0, assert_1.default)(f.name == null);
                        return f.type;
                      })
                    }
                  };
              }
            } else {
              cv = {
                kind: "struct",
                name: v.name,
                index: v.index,
                def: {
                  kind: types_1.TypeKind.Struct,
                  fields: v.fields.map((f) => {
                    let name = (0, util_1.assertNotNull)(f.name);
                    return { name, type: f.type };
                  })
                }
              };
            }
            placedVariants[v.index] = cv;
            variantsByName[cv.name] = cv;
          });
          return {
            kind: types_1.TypeKind.Variant,
            variants: placedVariants,
            variantsByName
          };
        }
        default:
          return def;
      }
    }
    exports.getCodecType = getCodecType;
    function toCodecTypes(types) {
      let codecTypes = new Array(types.length);
      for (let i = 0; i < types.length; i++) {
        codecTypes[i] = getCodecType(types, i);
      }
      return codecTypes;
    }
    exports.toCodecTypes = toCodecTypes;
  }
});

// node_modules/@subsquid/scale-codec/lib/codec.js
var require_codec = __commonJS({
  "node_modules/@subsquid/scale-codec/lib/codec.js"(exports) {
    "use strict";
    var __importDefault = exports && exports.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Codec = void 0;
    var util_internal_hex_1 = require_hex();
    var assert_1 = __importDefault(require_assert());
    var sink_1 = require_sink();
    var src_1 = require_src();
    var types_1 = require_types();
    var types_codec_1 = require_types_codec();
    var util_1 = require_util();
    var Codec = class {
      constructor(types) {
        this.types = (0, types_codec_1.toCodecTypes)(types);
      }
      decodeBinary(type, data) {
        let src = new src_1.Src(data);
        let val = this.decode(type, src);
        src.assertEOF();
        return val;
      }
      encodeToHex(type, val) {
        let sink = new sink_1.HexSink();
        this.encode(type, val, sink);
        return sink.toHex();
      }
      encodeToBinary(type, val) {
        let sink = new sink_1.ByteSink();
        this.encode(type, val, sink);
        return sink.toBytes();
      }
      decode(type, src) {
        let def = this.types[type];
        switch (def.kind) {
          case types_1.TypeKind.Primitive:
            return decodePrimitive(def.primitive, src);
          case types_1.TypeKind.Compact:
            return decodeCompact(def, src);
          case types_1.TypeKind.BitSequence:
            return decodeBitSequence(src);
          case types_1.TypeKind.Array:
            return this.decodeArray(def, src);
          case types_1.TypeKind.Sequence:
            return this.decodeSequence(def, src);
          case types_1.TypeKind.Tuple:
            return this.decodeTuple(def, src);
          case types_1.TypeKind.Struct:
            return this.decodeStruct(def, src);
          case types_1.TypeKind.Variant:
            return this.decodeVariant(def, src);
          case types_1.TypeKind.Option:
            return this.decodeOption(def, src);
          case types_1.TypeKind.BooleanOption:
            return decodeBooleanOption(src);
          case types_1.TypeKind.Bytes:
            return decodeBytes(src);
          case types_1.TypeKind.BytesArray:
            return src.bytes(def.len);
          case types_1.TypeKind.HexBytes:
            return (0, util_internal_hex_1.toHex)(decodeBytes(src));
          case types_1.TypeKind.HexBytesArray:
            return (0, util_internal_hex_1.toHex)(src.bytes(def.len));
          case types_1.TypeKind.DoNotConstruct:
            (0, util_1.throwUnexpectedCase)("DoNotConstruct type reached");
          default:
            (0, util_1.throwUnexpectedCase)(def.kind);
        }
      }
      decodeArray(def, src) {
        let { len, type } = def;
        let result = new Array(len);
        for (let i = 0; i < len; i++) {
          result[i] = this.decode(type, src);
        }
        return result;
      }
      decodeSequence(def, src) {
        let len = src.compactLength();
        let result = new Array(len);
        for (let i = 0; i < len; i++) {
          result[i] = this.decode(def.type, src);
        }
        return result;
      }
      decodeTuple(def, src) {
        if (def.tuple.length == 0)
          return null;
        let result = new Array(def.tuple.length);
        for (let i = 0; i < def.tuple.length; i++) {
          result[i] = this.decode(def.tuple[i], src);
        }
        return result;
      }
      decodeStruct(def, src) {
        let result = {};
        for (let i = 0; i < def.fields.length; i++) {
          let f = def.fields[i];
          result[f.name] = this.decode(f.type, src);
        }
        return result;
      }
      decodeVariant(def, src) {
        let idx = src.u8();
        let variant = def.variants[idx];
        if (variant == null)
          (0, util_1.throwUnexpectedCase)(`unknown variant index: ${idx}`);
        switch (variant.kind) {
          case "empty":
            return {
              __kind: variant.name
            };
          case "tuple":
            return {
              __kind: variant.name,
              value: this.decodeTuple(variant.def, src)
            };
          case "value":
            return {
              __kind: variant.name,
              value: this.decode(variant.type, src)
            };
          case "struct": {
            let value = this.decodeStruct(variant.def, src);
            value.__kind = variant.name;
            return value;
          }
          default:
            (0, util_1.throwUnexpectedCase)();
        }
      }
      decodeOption(def, src) {
        let byte = src.u8();
        switch (byte) {
          case 0:
            return void 0;
          case 1:
            return this.decode(def.type, src);
          default:
            (0, util_1.throwUnexpectedCase)(byte.toString());
        }
      }
      encode(type, val, sink) {
        let def = this.types[type];
        switch (def.kind) {
          case types_1.TypeKind.Primitive:
            encodePrimitive(def.primitive, val, sink);
            break;
          case types_1.TypeKind.Compact:
            sink.compact(val);
            break;
          case types_1.TypeKind.BitSequence:
            encodeBitSequence(val, sink);
            break;
          case types_1.TypeKind.Array:
            this.encodeArray(def, val, sink);
            break;
          case types_1.TypeKind.Sequence:
            this.encodeSequence(def, val, sink);
            break;
          case types_1.TypeKind.Tuple:
            this.encodeTuple(def, val, sink);
            break;
          case types_1.TypeKind.Struct:
            this.encodeStruct(def, val, sink);
            break;
          case types_1.TypeKind.Variant:
            this.encodeVariant(def, val, sink);
            break;
          case types_1.TypeKind.BytesArray:
            encodeBytesArray(def, val, sink);
            break;
          case types_1.TypeKind.HexBytesArray:
            encodeBytesArray(def, (0, util_internal_hex_1.decodeHex)(val), sink);
            break;
          case types_1.TypeKind.Bytes:
            encodeBytes(val, sink);
            break;
          case types_1.TypeKind.HexBytes:
            encodeBytes((0, util_internal_hex_1.decodeHex)(val), sink);
            break;
          case types_1.TypeKind.BooleanOption:
            encodeBooleanOption(val, sink);
            break;
          case types_1.TypeKind.Option:
            this.encodeOption(def, val, sink);
            break;
          default:
            (0, util_1.throwUnexpectedCase)(def.kind);
        }
      }
      encodeArray(def, val, sink) {
        (0, assert_1.default)(Array.isArray(val) && val.length == def.len);
        for (let i = 0; i < val.length; i++) {
          this.encode(def.type, val[i], sink);
        }
      }
      encodeSequence(def, val, sink) {
        (0, assert_1.default)(Array.isArray(val));
        sink.compact(val.length);
        for (let i = 0; i < val.length; i++) {
          this.encode(def.type, val[i], sink);
        }
      }
      encodeTuple(def, val, sink) {
        if (def.tuple.length == 0) {
          (0, assert_1.default)(val == null);
          return;
        }
        (0, assert_1.default)(Array.isArray(val) && def.tuple.length == val.length);
        for (let i = 0; i < val.length; i++) {
          this.encode(def.tuple[i], val[i], sink);
        }
      }
      encodeStruct(def, val, sink) {
        for (let i = 0; i < def.fields.length; i++) {
          let f = def.fields[i];
          this.encode(f.type, val[f.name], sink);
        }
      }
      encodeVariant(def, val, sink) {
        (0, assert_1.default)(typeof val?.__kind == "string", "not a variant type value");
        let variant = def.variantsByName[val.__kind];
        if (variant == null)
          throw new Error(`Unknown variant: ${val.__kind}`);
        sink.u8(variant.index);
        switch (variant.kind) {
          case "empty":
            break;
          case "value":
            this.encode(variant.type, val.value, sink);
            break;
          case "tuple":
            this.encodeTuple(variant.def, val.value, sink);
            break;
          case "struct":
            this.encodeStruct(variant.def, val, sink);
            break;
          default:
            (0, util_1.throwUnexpectedCase)();
        }
      }
      encodeOption(def, val, sink) {
        if (val === void 0) {
          sink.u8(0);
        } else {
          sink.u8(1);
          this.encode(def.type, val, sink);
        }
      }
    };
    exports.Codec = Codec;
    function decodeBytes(src) {
      let len = src.compactLength();
      return src.bytes(len);
    }
    function encodeBytes(val, sink) {
      (0, assert_1.default)(val instanceof Uint8Array);
      sink.compact(val.length);
      sink.bytes(val);
    }
    function encodeBytesArray(def, val, sink) {
      (0, assert_1.default)(val instanceof Uint8Array && val.length == def.len);
      sink.bytes(val);
    }
    function decodeBitSequence(src) {
      let bitLength = src.compactLength();
      let byteLength = Math.ceil(bitLength / 8);
      let bytes = src.bytes(byteLength);
      return {
        bytes,
        bitLength
      };
    }
    function encodeBitSequence(val, sink) {
      (0, assert_1.default)(val && typeof val == "object" && Number.isInteger(val.bitLength) && val.bytes instanceof Uint8Array);
      let bits = val;
      (0, assert_1.default)(Math.ceil(bits.bitLength / 8) == bits.bytes.length);
      sink.compact(bits.bitLength);
      sink.bytes(bits.bytes);
    }
    function decodeBooleanOption(src) {
      let byte = src.u8();
      switch (byte) {
        case 0:
          return null;
        case 1:
          return true;
        case 2:
          return false;
        default:
          (0, util_1.throwUnexpectedCase)(byte.toString());
      }
    }
    function encodeBooleanOption(val, sink) {
      if (val == null) {
        sink.u8(0);
      } else {
        (0, assert_1.default)(typeof val == "boolean");
        sink.u8(val ? 1 : 2);
      }
    }
    function decodeCompact(type, src) {
      let n = src.compact();
      switch (type.integer) {
        case "U8":
        case "U16":
        case "U32":
          return n;
        default:
          return BigInt(n);
      }
    }
    function decodePrimitive(type, src) {
      switch (type) {
        case "I8":
          return src.i8();
        case "U8":
          return src.u8();
        case "I16":
          return src.i16();
        case "U16":
          return src.u16();
        case "I32":
          return src.i32();
        case "U32":
          return src.u32();
        case "I64":
          return src.i64();
        case "U64":
          return src.u64();
        case "I128":
          return src.i128();
        case "U128":
          return src.u128();
        case "I256":
          return src.i256();
        case "U256":
          return src.u256();
        case "Bool":
          return src.bool();
        case "Str":
          return src.str();
        default:
          (0, util_1.throwUnexpectedCase)(type);
      }
    }
    function encodePrimitive(type, val, sink) {
      switch (type) {
        case "I8":
          sink.i8(val);
          break;
        case "U8":
          sink.u8(val);
          break;
        case "I16":
          sink.i16(val);
          break;
        case "U16":
          sink.u16(val);
          break;
        case "I32":
          sink.i32(val);
          break;
        case "U32":
          sink.u32(val);
          break;
        case "I64":
          sink.i64(val);
          break;
        case "U64":
          sink.u64(val);
          break;
        case "I128":
          sink.i128(val);
          break;
        case "U128":
          sink.u128(val);
          break;
        case "I256":
          sink.i256(val);
          break;
        case "U256":
          sink.u256(val);
          break;
        case "Bool":
          sink.bool(val);
          break;
        case "Str":
          sink.str(val);
          break;
        default:
          (0, util_1.throwUnexpectedCase)(type);
      }
    }
  }
});

// node_modules/@subsquid/util-internal-json/lib/json.js
var require_json = __commonJS({
  "node_modules/@subsquid/util-internal-json/lib/json.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.toJSON = toJSON;
    var util_internal_hex_1 = require_hex();
    function toJSON(val) {
      let json;
      switch (typeof val) {
        case "bigint":
          return val.toString();
        case "object":
          if (val == null)
            return null;
          if (val instanceof Uint8Array) {
            return (0, util_internal_hex_1.toHex)(val);
          } else if (val instanceof Date) {
            return val.toISOString();
          } else if (typeof val.toJSON == "function" && (json = val.toJSON()) !== val) {
            return toJSON(json);
          } else if (val instanceof Error) {
            json = {};
            if (val.stack) {
              json.stack = val.stack;
            } else {
              json.stack = val.toString();
            }
            if (val.cause != null) {
              json.cause = toJSON(val.cause);
            }
            json = toJsonObject(val, json);
            return json;
          } else if (val instanceof Map) {
            let entries = [];
            for (let [k, v] of val.entries()) {
              entries.push({ k, v });
            }
            return toJSON({ map: entries });
          } else if (val instanceof Set) {
            return toJSON({ set: [...val] });
          } else if (Array.isArray(val)) {
            return toJsonArray(val);
          } else {
            return toJsonObject(val);
          }
        default:
          return val;
      }
    }
    function toJsonArray(val) {
      let arr = new Array(val.length);
      for (let i = 0; i < val.length; i++) {
        arr[i] = toJSON(val[i]);
      }
      return arr;
    }
    function toJsonObject(val, result) {
      result = result || {};
      for (let key in val) {
        result[key] = toJSON(val[key]);
      }
      return result;
    }
  }
});

// node_modules/@subsquid/scale-codec/lib/codec-json.js
var require_codec_json = __commonJS({
  "node_modules/@subsquid/scale-codec/lib/codec-json.js"(exports) {
    "use strict";
    var __importDefault = exports && exports.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.decodeBinaryArray = exports.JsonCodec = void 0;
    var util_internal_hex_1 = require_hex();
    var util_internal_json_1 = require_json();
    var assert_1 = __importDefault(require_assert());
    var types_1 = require_types();
    var types_codec_1 = require_types_codec();
    var util_1 = require_util();
    var JsonCodec = class {
      static encode(val) {
        return (0, util_internal_json_1.toJSON)(val);
      }
      constructor(types) {
        this.types = (0, types_codec_1.toCodecTypes)(types);
      }
      decode(type, val) {
        let def = this.types[type];
        switch (def.kind) {
          case types_1.TypeKind.Primitive:
            return decodePrimitive(def.primitive, val);
          case types_1.TypeKind.Compact:
            return decodePrimitive(def.integer, val);
          case types_1.TypeKind.BitSequence:
            return (0, util_internal_hex_1.decodeHex)(val);
          case types_1.TypeKind.Array:
            return this.decodeArray(def, val);
          case types_1.TypeKind.Sequence:
            return this.decodeSequence(def, val);
          case types_1.TypeKind.Tuple:
            return this.decodeTuple(def, val);
          case types_1.TypeKind.Struct:
            return this.decodeStruct(def, val);
          case types_1.TypeKind.Variant:
            return this.decodeVariant(def, val);
          case types_1.TypeKind.Option:
            return this.decodeOption(def, val);
          case types_1.TypeKind.BooleanOption:
            return decodeBooleanOption(val);
          case types_1.TypeKind.Bytes:
            return (0, util_internal_hex_1.decodeHex)(val);
          case types_1.TypeKind.BytesArray:
            return decodeBinaryArray(def.len, val);
          case types_1.TypeKind.HexBytes:
          case types_1.TypeKind.HexBytesArray:
            (0, assert_1.default)((0, util_internal_hex_1.isHex)(val));
            return val;
          case types_1.TypeKind.DoNotConstruct:
            (0, util_1.throwUnexpectedCase)("DoNotConstruct type reached");
          default:
            (0, util_1.throwUnexpectedCase)();
        }
      }
      decodeArray(def, val) {
        let { len, type } = def;
        (0, assert_1.default)(Array.isArray(val));
        (0, assert_1.default)(val.length == len);
        let result = new Array(len);
        for (let i = 0; i < len; i++) {
          result[i] = this.decode(type, val[i]);
        }
        return result;
      }
      decodeSequence(def, val) {
        (0, assert_1.default)(Array.isArray(val));
        let result = new Array(val.length);
        for (let i = 0; i < val.length; i++) {
          result[i] = this.decode(def.type, val[i]);
        }
        return result;
      }
      decodeTuple(def, value) {
        let items = def.tuple;
        if (items.length == 0) {
          (0, assert_1.default)(value == null || Array.isArray(value) && value.length == 0);
          return null;
        } else {
          (0, assert_1.default)(Array.isArray(value));
          (0, assert_1.default)(value.length == items.length);
          let result = new Array(items.length);
          for (let i = 0; i < items.length; i++) {
            result[i] = this.decode(items[i], value[i]);
          }
          return result;
        }
      }
      decodeStruct(def, value) {
        (0, assert_1.default)((0, util_1.isObject)(value));
        let result = {};
        for (let i = 0; i < def.fields.length; i++) {
          let f = def.fields[i];
          result[f.name] = this.decode(f.type, value[f.name]);
        }
        return result;
      }
      decodeVariant(def, val) {
        (0, assert_1.default)((0, util_1.isObject)(val));
        (0, assert_1.default)(typeof val.__kind == "string");
        let variant = def.variantsByName[val.__kind];
        if (variant == null)
          throw new Error(`Unknown variant ${val.__kind}`);
        switch (variant.kind) {
          case "empty":
            return {
              __kind: val.__kind
            };
          case "value":
            return {
              __kind: val.__kind,
              value: this.decode(variant.type, val.value)
            };
          case "tuple":
            return {
              __kind: val.__kind,
              value: this.decodeTuple(variant.def, val.value)
            };
          case "struct": {
            let s = this.decodeStruct(variant.def, val);
            s.__kind = val.__kind;
            return s;
          }
          default:
            (0, util_1.throwUnexpectedCase)(variant.kind);
        }
      }
      decodeOption(def, value) {
        return value == null ? void 0 : this.decode(def.type, value);
      }
    };
    exports.JsonCodec = JsonCodec;
    function decodePrimitive(type, value) {
      switch (type) {
        case "I8":
          (0, util_1.checkSignedInt)(value, 8);
          return value;
        case "I16":
          (0, util_1.checkSignedInt)(value, 16);
          return value;
        case "I32":
          (0, util_1.checkSignedInt)(value, 32);
          return value;
        case "I64":
          return (0, util_1.toSignedBigInt)(value, 64);
        case "I128":
          return (0, util_1.toSignedBigInt)(value, 128);
        case "I256":
          return (0, util_1.toSignedBigInt)(value, 256);
        case "U8":
          (0, util_1.checkUnsignedInt)(value, 8);
          return value;
        case "U16":
          (0, util_1.checkUnsignedInt)(value, 16);
          return value;
        case "U32":
          (0, util_1.checkUnsignedInt)(value, 32);
          return value;
        case "U64":
          return (0, util_1.toUnsignedBigInt)(value, 64);
        case "U128":
          return (0, util_1.toUnsignedBigInt)(value, 128);
        case "U256":
          return (0, util_1.toUnsignedBigInt)(value, 256);
        case "Bool":
          (0, assert_1.default)(typeof value == "boolean");
          return value;
        case "Str":
          (0, assert_1.default)(typeof value == "string");
          return value;
        default:
          (0, util_1.throwUnexpectedCase)(type);
      }
    }
    function decodeBooleanOption(value) {
      if (value == null)
        return void 0;
      (0, assert_1.default)(typeof value == "boolean");
      return value;
    }
    function decodeBinaryArray(len, value) {
      let buf = (0, util_internal_hex_1.decodeHex)(value);
      (0, assert_1.default)(buf.length == len);
      return buf;
    }
    exports.decodeBinaryArray = decodeBinaryArray;
  }
});

// node_modules/@subsquid/scale-codec/lib/index.js
var require_lib = __commonJS({
  "node_modules/@subsquid/scale-codec/lib/index.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __exportStar = exports && exports.__exportStar || function(m, exports2) {
      for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p)) __createBinding(exports2, m, p);
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    __exportStar(require_types(), exports);
    __exportStar(require_src(), exports);
    __exportStar(require_sink(), exports);
    __exportStar(require_codec(), exports);
    __exportStar(require_codec_json(), exports);
  }
});

// node_modules/@scure/base/index.js
var freeze = (fn) => Object.freeze(fn());
function isBytes(a) {
  return a instanceof Uint8Array || ArrayBuffer.isView(a) && a.constructor.name === "Uint8Array" && "BYTES_PER_ELEMENT" in a && a.BYTES_PER_ELEMENT === 1;
}
function abytes(b) {
  if (!isBytes(b))
    throw new TypeError("Uint8Array expected");
}
function isArrayOf(isString, arr) {
  if (!Array.isArray(arr))
    return false;
  if (arr.length === 0)
    return true;
  if (isString) {
    return arr.every((item) => typeof item === "string");
  } else {
    return arr.every((item) => Number.isSafeInteger(item));
  }
}
function afn(input) {
  if (typeof input !== "function")
    throw new TypeError("function expected");
  return true;
}
function astr(label, input) {
  if (typeof input !== "string")
    throw new TypeError(`${label}: string expected`);
  return true;
}
function anumber(n, title = "number") {
  if (typeof n !== "number")
    throw new TypeError(`${title}: expected number, got ${typeof n}`);
  if (!Number.isSafeInteger(n))
    throw new RangeError(`${title}: expected safe integer, got ${n}`);
}
function anumArr(label, input) {
  if (!isArrayOf(false, input))
    throw new TypeError(`${label}: array of numbers expected`);
}
function chain(...args) {
  const id = (a) => a;
  const wrap = (a, b) => (c) => a(b(c));
  const encode = args.map((x) => x.encode).reduceRight(wrap, id);
  const decode = args.map((x) => x.decode).reduce(wrap, id);
  return { encode, decode };
}
function normalize(fn) {
  afn(fn);
  return { encode: (from) => from, decode: (to) => fn(to) };
}
var powers = (() => {
  let res = [];
  for (let i = 0; i < 40; i++)
    res.push(2 ** i);
  return res;
})();
function u8ToNumArr(u8, len = u8.length) {
  const res = new Array(len);
  for (let i = 0; i < len; i++)
    res[i] = u8[i];
  return res;
}
var asciiDecoder = (() => {
  try {
    const decoder = new TextDecoder();
    return decoder.decode(Uint8Array.of(65, 48, 43, 127)) === "A0+" ? decoder : void 0;
  } catch (e) {
    return void 0;
  }
})();
var B2S_CHUNK = 8192;
function charcodesToString(codes) {
  const len = codes.length;
  if (asciiDecoder !== void 0 && len >= 12)
    return asciiDecoder.decode(codes);
  if (len <= B2S_CHUNK)
    return String.fromCharCode.apply(null, codes);
  let res = "";
  for (let i = 0; i < len; i += B2S_CHUNK)
    res += String.fromCharCode.apply(null, codes.subarray(i, i + B2S_CHUNK));
  return res;
}
function radix2(bits) {
  anumber(bits);
  if (bits <= 0 || bits > 8)
    throw new RangeError("radix2: bits should be in (0..8]");
  const mask = powers[bits] - 1;
  return {
    encode: (bytes) => {
      abytes(bytes);
      const len = bytes.length;
      const res = new Uint8Array(Math.ceil(len * 8 / bits));
      let carry = 0;
      let pos = 0;
      let j = 0;
      for (let i = 0; i < len; ) {
        if (i + 2 < len) {
          carry = carry << 24 | bytes[i] << 16 | bytes[i + 1] << 8 | bytes[i + 2];
          pos += 24;
          i += 3;
        } else {
          carry = (carry << 8 | bytes[i]) & 65535;
          pos += 8;
          i++;
        }
        for (; ; ) {
          pos -= bits;
          res[j++] = carry >> pos & mask;
          if (pos < bits)
            break;
        }
      }
      if (pos > 0)
        res[j] = carry << bits - pos & mask;
      return res;
    },
    decode: (digits) => {
      const len = digits.length;
      const res = new Uint8Array(Math.floor(len * bits / 8));
      let carry = 0;
      let pos = 0;
      let j = 0;
      for (let i = 0; i < len; i++) {
        carry = (carry << bits | digits[i]) & 65535;
        pos += bits;
        for (; pos >= 8; pos -= 8)
          res[j++] = carry >> pos - 8 & 255;
      }
      carry = carry << 8 - pos & 255;
      if (pos >= bits)
        throw new Error("Excess padding");
      if (carry > 0)
        throw new Error(`Non-zero padding: ${carry}`);
      return res;
    }
  };
}
function alphabet(letters, aliases) {
  const len = letters.length;
  if (len > 128)
    throw new Error("alphabet: max 128 letters");
  const encTable = new Uint8Array(len);
  const decTable = new Int8Array(128).fill(-1);
  for (let i = 0; i < len; i++) {
    const code = letters.charCodeAt(i);
    if (letters.codePointAt(i) !== code || code > 127)
      throw new Error("alphabet: single-char ASCII letters only");
    encTable[i] = code;
    decTable[code] = i;
  }
  if (aliases !== void 0) {
    for (const alias of Object.keys(aliases)) {
      const code = alias.charCodeAt(0);
      const target = decTable[aliases[alias].charCodeAt(0)];
      if (alias.length !== 1 || code > 127 || target === void 0 || target === -1)
        throw new Error(`alphabet: invalid alias ${alias}`);
      decTable[code] = target;
    }
  }
  return {
    encode: (digits) => {
      const codes = new Uint8Array(digits.length);
      for (let i = 0; i < digits.length; i++) {
        const d = digits[i];
        const code = encTable[d];
        if (code === void 0)
          throw new Error(`alphabet.encode: invalid digit ${d}`);
        codes[i] = code;
      }
      return charcodesToString(codes);
    },
    decode: (input) => {
      astr("decode", input);
      const slen = input.length;
      const digits = new Uint8Array(slen);
      for (let i = 0; i < slen; i++) {
        const code = input.charCodeAt(i);
        const digit = code < 128 ? decTable[code] : -1;
        if (digit === -1)
          throw new Error(`Unknown letter "${input[i]}". Allowed: ${letters}`);
        digits[i] = digit;
      }
      return digits;
    }
  };
}
function padding(bits, chr = "=") {
  anumber(bits);
  astr("padding", chr);
  return {
    encode(data) {
      while (data.length * bits % 8)
        data += chr;
      return data;
    },
    decode(input) {
      astr("decode", input);
      let end = input.length;
      if (end * bits % 8)
        throw new Error("padding: invalid length");
      for (; end > 0 && input[end - 1] === chr; end--) {
        const byte = (end - 1) * bits;
        if (byte % 8 === 0)
          throw new Error("padding: excess padding");
      }
      return input.slice(0, end);
    }
  };
}
function unsafeWrapper(fn) {
  afn(fn);
  return function(...args) {
    try {
      return fn.apply(null, args);
    } catch (e) {
    }
  };
}
function checksum(len, fn) {
  anumber(len);
  if (len <= 0)
    throw new RangeError(`checksum length must be positive: ${len}`);
  afn(fn);
  const _fn = fn;
  return {
    encode(data) {
      abytes(data);
      const sum = _fn(data).slice(0, len);
      const res = new Uint8Array(data.length + len);
      res.set(data);
      res.set(sum, data.length);
      return res;
    },
    decode(data) {
      abytes(data);
      const payload = data.slice(0, -len);
      const oldChecksum = data.slice(-len);
      const newChecksum = _fn(payload).slice(0, len);
      for (let i = 0; i < len; i++)
        if (newChecksum[i] !== oldChecksum[i])
          throw new Error("Invalid checksum");
      return payload;
    }
  };
}
var base16 = freeze(() => chain(radix2(4), alphabet("0123456789ABCDEF")));
var base32 = freeze(() => chain(radix2(5), alphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"), padding(5)));
var base32nopad = freeze(() => chain(radix2(5), alphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZ234567")));
var base32hex = freeze(() => chain(radix2(5), alphabet("0123456789ABCDEFGHIJKLMNOPQRSTUV"), padding(5)));
var base32hexnopad = freeze(() => chain(radix2(5), alphabet("0123456789ABCDEFGHIJKLMNOPQRSTUV")));
var BASE32_CROCKFORD_ASCII = /^[\x00-\x7f]*$/;
var base32crockford = freeze(() => chain(radix2(5), alphabet("0123456789ABCDEFGHJKMNPQRSTVWXYZ"), normalize((s) => {
  astr("base32crockford.decode", s);
  const upper = s.toUpperCase();
  if (s !== upper && !BASE32_CROCKFORD_ASCII.test(s))
    throw new Error("base32crockford.decode: ASCII expected");
  return upper.replace(/O/g, "0").replace(/[IL]/g, "1");
})));
var hasBase64Builtin = (() => typeof Uint8Array.from([]).toBase64 === "function" && typeof Uint8Array.fromBase64 === "function")();
var ASCII_WHITESPACE = /[\t\n\f\r ]/;
var decodeBase64Builtin = (s, isUrl) => {
  astr("base64", s);
  const alphabet2 = isUrl ? "base64url" : "base64";
  if (s.length > 0 && ASCII_WHITESPACE.test(s))
    throw new Error("invalid base64");
  return Uint8Array.fromBase64(s, { alphabet: alphabet2, lastChunkHandling: "strict" });
};
var base64Fallback = freeze(() => chain(radix2(6), alphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"), padding(6)));
var base64urlFallback = freeze(() => chain(radix2(6), alphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_"), padding(6)));
var base64 = freeze(() => hasBase64Builtin ? {
  encode(b) {
    abytes(b);
    return b.toBase64();
  },
  decode(s) {
    return decodeBase64Builtin(s, false);
  }
} : base64Fallback);
var base64nopad = freeze(() => chain(radix2(6), alphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/")));
var base64url = freeze(() => hasBase64Builtin ? {
  encode(b) {
    abytes(b);
    return b.toBase64({ alphabet: "base64url" });
  },
  decode(s) {
    return decodeBase64Builtin(s, true);
  }
} : base64urlFallback);
var base64urlnopad = freeze(() => chain(radix2(6), alphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_")));
var B58_GROUP = 656356768;
var B36_GROUP = 60466176;
var RADIX_BASE_N_MAX_LENGTH = 65536;
var BASE_N_MAX_BYTES = 2048;
var BASE_N_MAX_CHARS = 4096;
var radixBaseN = (BASE, GROUP) => ({
  encode: (bytes) => {
    abytes(bytes);
    const blen = bytes.length;
    if (blen === 0)
      return new Uint8Array(0);
    if (blen >= RADIX_BASE_N_MAX_LENGTH)
      throw new Error("invalid length");
    let zeros = 0;
    while (zeros < blen - 1 && bytes[zeros] === 0)
      zeros++;
    const nlimbs = Math.ceil(blen / 2);
    const limbs = new Uint16Array(nlimbs);
    const odd = blen & 1;
    if (odd)
      limbs[0] = bytes[0];
    for (let i = odd, j2 = odd; i < blen; i += 2, j2++)
      limbs[j2] = bytes[i] << 8 | bytes[i + 1];
    const groups = [];
    let pos = 0;
    while (pos < nlimbs) {
      let carry = 0;
      for (let i = pos; i < nlimbs; i++) {
        const cur = carry * 65536 + limbs[i];
        const q = Math.floor(cur / GROUP);
        carry = cur - q * GROUP;
        limbs[i] = q;
        if (q === 0 && i === pos)
          pos++;
      }
      groups.push(carry);
    }
    const top = groups.length - 1;
    let sig = top * 5;
    for (let v = groups[top]; ; v = Math.floor(v / BASE)) {
      sig++;
      if (v < BASE)
        break;
    }
    const res = new Uint8Array(zeros + sig);
    let j = res.length - 1;
    for (let g = 0; g < top; g++) {
      let v = groups[g];
      for (let k = 0; k < 5; k++) {
        res[j--] = v % BASE;
        v = Math.floor(v / BASE);
      }
    }
    for (let v = groups[top]; j >= zeros; v = Math.floor(v / BASE))
      res[j--] = v % BASE;
    return res;
  },
  decode: (digits) => {
    abytes(digits);
    const dlen = digits.length;
    if (dlen === 0)
      return new Uint8Array(0);
    if (dlen >= RADIX_BASE_N_MAX_LENGTH)
      throw new Error("invalid length");
    let zeros = 0;
    while (zeros < dlen - 1 && digits[zeros] === 0)
      zeros++;
    const limbs = new Uint16Array(Math.ceil(dlen * 6 / 16) + 1);
    let used = 0;
    let i = 0;
    let group = dlen % 5 || 5;
    while (i < dlen) {
      let gval = 0;
      let factor = 1;
      for (const end = i + group; i < end; i++) {
        const d = digits[i];
        if (d >= BASE)
          throw new Error(`invalid integer: ${d}`);
        gval = gval * BASE + d;
        factor *= BASE;
      }
      group = 5;
      let carry = gval;
      for (let k = 0; k < used; k++) {
        const cur = limbs[k] * factor + carry;
        carry = Math.floor(cur / 65536);
        limbs[k] = cur - carry * 65536;
      }
      for (; carry > 0; carry = Math.floor(carry / 65536))
        limbs[used++] = carry % 65536;
    }
    const valueBytes = used === 0 ? 1 : used * 2 - (limbs[used - 1] < 256 ? 1 : 0);
    const res = new Uint8Array(zeros + valueBytes);
    let j = res.length - 1;
    for (let k = 0; k < used; k++) {
      const limb = limbs[k];
      res[j--] = limb & 255;
      if (j >= zeros)
        res[j--] = limb >> 8;
    }
    return res;
  }
});
var genBaseN = (radix, abc) => {
  const letters = alphabet(abc);
  return {
    encode(bytes) {
      abytes(bytes);
      if (bytes.length > BASE_N_MAX_BYTES)
        throw new Error("invalid length");
      return letters.encode(radix.encode(bytes));
    },
    decode(str) {
      astr("baseN.decode", str);
      if (str.length > BASE_N_MAX_CHARS)
        throw new Error("invalid length");
      return radix.decode(letters.decode(str));
    }
  };
};
var radix58 = radixBaseN(58, B58_GROUP);
var base36 = freeze(() => genBaseN(radixBaseN(36, B36_GROUP), "0123456789abcdefghijklmnopqrstuvwxyz"));
var genBase58 = (abc) => genBaseN(radix58, abc);
var base58 = freeze(() => genBase58("123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"));
var base58flickr = freeze(() => genBase58("123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ"));
var base58xrp = freeze(() => genBase58("rpshnaf39wBUDNEGHJKLM4PQRST7VWXYZ2bcdeCg65jkm8oFqi1tuvAxyz"));
var XMR_BLOCK_LEN = [0, 2, 3, 5, 6, 7, 9, 10, 11];
var base58xmr = freeze(() => ({
  encode(data) {
    abytes(data);
    let res = "";
    for (let i = 0; i < data.length; i += 8) {
      const block = data.subarray(i, i + 8);
      res += base58.encode(block).padStart(XMR_BLOCK_LEN[block.length], "1");
    }
    return res;
  },
  decode(str) {
    astr("base58xmr.decode", str);
    const strLen = str.length;
    const tailChars = strLen % 11;
    const tailBytes = tailChars === 0 ? 0 : XMR_BLOCK_LEN.indexOf(tailChars);
    if (tailBytes === -1)
      throw new Error(`base58xmr: invalid block length ${tailChars}`);
    const res = new Uint8Array(Math.floor(strLen / 11) * 8 + tailBytes);
    let w = 0;
    for (let i = 0; i < strLen; i += 11) {
      const slice = str.slice(i, i + 11);
      const blockLen = slice.length === 11 ? 8 : tailBytes;
      const block = base58.decode(slice);
      for (let j = 0; j < block.length - blockLen; j++) {
        if (block[j] !== 0)
          throw new Error("base58xmr: wrong padding");
      }
      for (let j = block.length - blockLen; j < block.length; j++)
        res[w++] = block[j];
    }
    return res;
  }
}));
var BECH_ALPHABET = alphabet("qpzry9x8gf2tvdw0s3jn54khce6mua7l");
var BECH_UPPERCASE_PRINTABLE = /^[\x21-\x60\x7b-\x7e]+$/;
function assertBech32Printable(label, value) {
  for (let i = 0; i < value.length; i++) {
    const c = value.charCodeAt(i);
    if (c < 33 || c > 126)
      throw new Error(`${label}: printable ASCII expected`);
  }
}
function wordsToU8(words) {
  const len = words.length;
  const res = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    const w = words[i];
    if (w < 0 || w >= 32)
      throw new Error(`alphabet.encode: invalid digit ${w}`);
    res[i] = w;
  }
  return res;
}
var POLYMOD_GENERATORS = [996825010, 642813549, 513874426, 1027748829, 705979059];
function bech32Polymod(pre) {
  const b = pre >> 25;
  let chk = (pre & 33554431) << 5;
  for (let i = 0; i < POLYMOD_GENERATORS.length; i++) {
    if ((b >> i & 1) === 1)
      chk ^= POLYMOD_GENERATORS[i];
  }
  return chk;
}
function bechChecksum(prefix, words, encodingConst = 1) {
  const len = prefix.length;
  let chk = 1;
  for (let i = 0; i < len; i++) {
    const c = prefix.charCodeAt(i);
    if (c < 33 || c > 126)
      throw new Error(`Invalid prefix (${prefix})`);
    chk = bech32Polymod(chk) ^ c >> 5;
  }
  chk = bech32Polymod(chk);
  for (let i = 0; i < len; i++)
    chk = bech32Polymod(chk) ^ prefix.charCodeAt(i) & 31;
  for (let v of words)
    chk = bech32Polymod(chk) ^ v;
  for (let i = 0; i < 6; i++)
    chk = bech32Polymod(chk);
  chk ^= encodingConst;
  const sum = new Uint8Array(6);
  for (let i = 0; i < 6; i++)
    sum[i] = chk >>> 5 * (5 - i) & 31;
  return BECH_ALPHABET.encode(sum);
}
function genBech32(encoding) {
  const ENCODING_CONST = encoding === "bech32" ? 1 : 734539939;
  const _words = radix2(5);
  const toWords = (from) => {
    abytes(from);
    const len = from.length;
    const res = new Array(Math.ceil(len * 8 / 5));
    let carry = 0;
    let pos = 0;
    let j = 0;
    for (let i = 0; i < len; i++) {
      carry = carry << 8 | from[i];
      pos += 8;
      for (; pos >= 5; pos -= 5)
        res[j++] = carry >> pos - 5 & 31;
    }
    if (pos > 0)
      res[j] = carry << 5 - pos & 31;
    return res;
  };
  const fromWords = (to) => {
    anumArr("radix2.decode", to);
    const len = to.length;
    const digits = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      const w = to[i];
      if (w < 0 || w >= 32)
        throw new Error(`convertRadix2: invalid word=${w}`);
      digits[i] = w;
    }
    return _words.decode(digits);
  };
  const fromWordsUnsafe = unsafeWrapper(fromWords);
  function encode(prefix, words, limit = 90) {
    astr("bech32.encode prefix", prefix);
    if (limit !== false)
      anumber(limit, "limit");
    if (isBytes(words))
      words = u8ToNumArr(words);
    anumArr("bech32.encode", words);
    const plen = prefix.length;
    if (plen === 0)
      throw new TypeError(`Invalid prefix length ${plen}`);
    const actualLength = plen + 7 + words.length;
    if (limit !== false && actualLength > limit)
      throw new TypeError(`Length ${actualLength} exceeds limit ${limit}`);
    assertBech32Printable("bech32.encode prefix", prefix);
    const lowered = prefix.toLowerCase();
    const sum = bechChecksum(lowered, words, ENCODING_CONST);
    return `${lowered}1${BECH_ALPHABET.encode(wordsToU8(words))}${sum}`;
  }
  function decode(str, limit = 90) {
    astr("bech32.decode input", str);
    if (limit !== false)
      anumber(limit, "limit");
    const slen = str.length;
    if (slen < 8 || limit !== false && slen > limit)
      throw new TypeError(`invalid string length ${slen}, expected (8..${limit})`);
    const lowered = str.toLowerCase();
    if (str !== lowered) {
      if (!BECH_UPPERCASE_PRINTABLE.test(str)) {
        assertBech32Printable("bech32.decode input", str);
        throw new Error(`mixed-case string not allowed`);
      }
    }
    const sepIndex = lowered.lastIndexOf("1");
    if (sepIndex === 0 || sepIndex === -1)
      throw new Error(`invalid separator "1"`);
    const prefix = lowered.slice(0, sepIndex);
    const data = lowered.slice(sepIndex + 1);
    if (data.length < 6)
      throw new Error("invalid data length");
    const digits = BECH_ALPHABET.decode(data);
    const words = u8ToNumArr(digits, digits.length - 6);
    const sum = bechChecksum(prefix, words, ENCODING_CONST);
    if (!data.endsWith(sum))
      throw new Error(`Invalid checksum in ${str}`);
    return { prefix, words };
  }
  const decodeUnsafe = unsafeWrapper(decode);
  function decodeToBytes(str, limit = 90) {
    const { prefix, words } = decode(str, limit);
    return {
      prefix,
      words,
      bytes: fromWords(words)
    };
  }
  function encodeFromBytes(prefix, bytes) {
    return encode(prefix, toWords(bytes));
  }
  return {
    encode,
    decode,
    encodeFromBytes,
    decodeToBytes,
    decodeUnsafe,
    fromWords,
    fromWordsUnsafe,
    toWords
  };
}
var bech32 = freeze(() => genBech32("bech32"));
var bech32m = freeze(() => genBech32("bech32m"));
var ascii = freeze(() => ({
  encode(data) {
    abytes(data);
    for (let i = 0; i < data.length; i++) {
      const byte = data[i];
      if (byte > 127)
        throw new RangeError(`non-ASCII byte ${byte} at ${i}`);
    }
    return charcodesToString(data);
  },
  decode(str) {
    if (typeof str !== "string")
      throw new TypeError("ascii string expected, got " + typeof str);
    const res = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i++) {
      const charCode = str.charCodeAt(i);
      if (charCode > 127)
        throw new RangeError(`non-ASCII char "${str[i]}" (${charCode}) at ${i}`);
      res[i] = charCode;
    }
    return res;
  }
}));
var _isWellFormedShim = (str) => {
  try {
    return encodeURI(str) !== null;
  } catch {
    return false;
  }
};
var _isWellFormed = (() => (
  // Pick the native check once so utf8.decode doesn't re-probe String.prototype on every call.
  typeof "".isWellFormed === "function" ? (str) => str.isWellFormed() : _isWellFormedShim
))();
var utf8err = (i) => new TypeError(`invalid utf8 at byte ${i}`);
var utf8Fallback = freeze(() => ({
  encode(data) {
    abytes(data);
    let res = "";
    for (let i = 0; i < data.length; ) {
      const a = data[i++];
      if (a < 128) {
        res += String.fromCharCode(a);
        continue;
      }
      if (a < 194 || i >= data.length)
        throw utf8err(i - 1);
      const b = data[i++];
      if ((b & 192) !== 128)
        throw utf8err(i - 1);
      let cp = (a & 31) << 6 | b & 63;
      if (a >= 224) {
        if (i >= data.length)
          throw utf8err(i - 1);
        const c = data[i++];
        if ((c & 192) !== 128 || a === 224 && b < 160 || a === 237 && b >= 160)
          throw utf8err(i - 1);
        cp = (a & 15) << 12 | (b & 63) << 6 | c & 63;
        if (a >= 240) {
          if (i >= data.length)
            throw utf8err(i - 1);
          const d = data[i++];
          if (a > 244 || (d & 192) !== 128 || a === 240 && b < 144 || a === 244 && b >= 144)
            throw utf8err(i - 1);
          cp = (a & 7) << 18 | (b & 63) << 12 | (c & 63) << 6 | d & 63;
        }
      }
      if (cp < 65536)
        res += String.fromCharCode(cp);
      else {
        cp -= 65536;
        res += String.fromCharCode((cp >> 10) + 55296, (cp & 1023) + 56320);
      }
    }
    return res;
  },
  decode(str) {
    astr("utf8", str);
    if (!_isWellFormed(str))
      throw new TypeError("utf8 expected well-formed string");
    const res = new Uint8Array(str.length * 3);
    let pos = 0;
    for (let i = 0; i < str.length; i++) {
      let c = str.charCodeAt(i);
      if (c < 128) {
        res[pos++] = c;
        continue;
      }
      if (c >= 55296 && c <= 57343) {
        const d = str.charCodeAt(++i);
        c = 65536 + (c - 55296 << 10) + d - 56320;
      }
      if (c >= 65536) {
        res[pos++] = c >> 18 | 240;
        res[pos++] = c >> 12 & 63 | 128;
      } else if (c >= 2048)
        res[pos++] = c >> 12 | 224;
      else
        res[pos++] = c >> 6 | 192;
      if (c >= 2048)
        res[pos++] = c >> 6 & 63 | 128;
      res[pos++] = c & 63 | 128;
    }
    return res.subarray(0, pos);
  }
}));
var utf8 = freeze(() => {
  let _utf8Encoder;
  let _utf8Decoder;
  const utf8Builtin = {
    // ignoreBOM preserves an explicit leading U+FEFF;
    // fatal rejects invalid UTF-8 bytes instead of replacing them.
    encode(data) {
      abytes(data);
      return (_utf8Decoder || (_utf8Decoder = new TextDecoder("utf-8", { ignoreBOM: true, fatal: true }))).decode(data);
    },
    decode(str) {
      astr("utf8", str);
      if (!_isWellFormed(str))
        throw new TypeError("utf8 expected well-formed string");
      return (_utf8Encoder || (_utf8Encoder = new TextEncoder())).encode(str);
    }
  };
  return {
    // Select each direction once at module init, since
    // TextEncoder and TextDecoder can exist independently.
    encode: typeof TextDecoder === "function" ? utf8Builtin.encode : utf8Fallback.encode,
    decode: typeof TextEncoder === "function" ? utf8Builtin.decode : utf8Fallback.decode
  };
});
var hexFallback = freeze(() => chain(
  radix2(4),
  // Case-insensitive decode via table aliases instead of a toLowerCase pass.
  alphabet("0123456789abcdef", { A: "a", B: "b", C: "c", D: "d", E: "e", F: "f" }),
  normalize((s) => {
    astr("hex", s);
    if (s.length % 2 !== 0)
      throw new TypeError(`hex.decode: odd-length string (${s.length})`);
    return s;
  })
));
var __TESTS = freeze(() => ({
  alphabet,
  base64Fallback,
  base64urlFallback,
  hexFallback,
  radix2,
  radix58,
  checksum,
  utf8Fallback,
  _isWellFormedShim
}));
var hasHexBuiltin = (() => (
  // Require both directions before enabling the native hex path so encode/decode stay symmetric.
  typeof Uint8Array.from([]).toHex === "function" && typeof Uint8Array.fromHex === "function"
))();
var hexBuiltin = {
  // Keep local type guards so the native path preserves library-level input errors.
  // Native toHex emits lowercase hex, matching the fallback alphabet and Node's hex strings.
  encode(data) {
    abytes(data);
    return data.toHex();
  },
  // Native fromHex accepts either hex case and rejects odd-length / non-hex syntax.
  decode(s) {
    astr("hex", s);
    return Uint8Array.fromHex(s);
  }
};
var hex = freeze(() => hasHexBuiltin ? hexBuiltin : hexFallback);

// node_modules/@midnight-ntwrk/wallet-sdk-address-format/dist/index.js
var subsquidScale = __toESM(require_lib());
var mainnet = Symbol("Mainnet");
var NetworkId = {
  toString: (networkId) => {
    return networkId === mainnet ? "mainnet" : networkId;
  }
};
var BLSScalar = {
  bytes: 32,
  modulus: BigInt("0x73eda753299d7d483339d80809a1d80553bda402fffe5bfeffffffff00000001")
};
var ScaleBigInt = {
  encode: (data) => {
    const sink = new subsquidScale.ByteSink();
    sink.compact(data);
    return Buffer.from(sink.toBytes());
  },
  decode: (repr) => {
    const src = new subsquidScale.Src(repr);
    const res = src.compact();
    src.assertEOF();
    return BigInt(res);
  }
};
var Bech32mSymbol = Symbol("MidnightBech32m");
var MidnightBech32m = class _MidnightBech32m {
  static prefix = "mn";
  static encode(networkId, item) {
    return item[Bech32mSymbol].encode(networkId, item);
  }
  static validateSegment(segmentName, segment) {
    const result = /^[A-Za-z1-9-]+$/.test(segment);
    if (!result) {
      throw new Error(`Segment ${segmentName}: ${segment} contains disallowed characters. Allowed characters are only numbers, latin letters and a hyphen`);
    }
  }
  static parse(bech32string) {
    const bech32parsed = bech32m.decodeToBytes(bech32string);
    const [prefix, type, network = mainnet] = bech32parsed.prefix.split("_");
    if (prefix != _MidnightBech32m.prefix) {
      throw new Error(`Expected prefix ${_MidnightBech32m.prefix}`);
    }
    _MidnightBech32m.validateSegment("type", type);
    if (network != mainnet) {
      _MidnightBech32m.validateSegment("network", network);
    }
    return new _MidnightBech32m(type, network, Buffer.from(bech32parsed.bytes));
  }
  type;
  network;
  data;
  constructor(type, network, data) {
    this.data = data;
    this.network = network;
    this.type = type;
    _MidnightBech32m.validateSegment("type", type);
    if (network != mainnet) {
      _MidnightBech32m.validateSegment("network", network);
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  decode(tclass, networkId) {
    return tclass[Bech32mSymbol].decode(networkId, this);
  }
  asString() {
    const networkSegment = this.network == mainnet ? "" : `_${this.network}`;
    return bech32m.encode(`${_MidnightBech32m.prefix}_${this.type}${networkSegment}`, bech32m.toWords(this.data), false);
  }
  toString() {
    return this.asString();
  }
};
var Bech32mCodec = class _Bech32mCodec {
  type;
  dataToBytes;
  dataFromBytes;
  constructor(type, dataToBytes, dataFromBytes) {
    this.dataFromBytes = dataFromBytes;
    this.dataToBytes = dataToBytes;
    this.type = type;
  }
  encode(networkId, data) {
    const context = _Bech32mCodec.createContext(networkId);
    return new MidnightBech32m(this.type, context.networkId, this.dataToBytes(data));
  }
  decode(networkId, repr) {
    const context = _Bech32mCodec.createContext(networkId);
    if (repr.type != this.type) {
      throw new Error(`Expected type ${this.type}, got ${repr.type}`);
    }
    if (context.networkId != repr.network) {
      throw new Error(`Expected ${NetworkId.toString(context.networkId)} address, got ${NetworkId.toString(repr.network)} one`);
    }
    return this.dataFromBytes(repr.data);
  }
  static createContext(networkId) {
    if (networkId === "mainnet") {
      return { networkId: mainnet };
    } else {
      return { networkId };
    }
  }
};
var ShieldedAddress = class _ShieldedAddress {
  static codec = new Bech32mCodec("shield-addr", (addr) => Buffer.concat([addr.coinPublicKey.data, addr.encryptionPublicKey.data]), (bytes) => {
    const coinPublicKey = new ShieldedCoinPublicKey(bytes.subarray(0, ShieldedCoinPublicKey.keyLength));
    const encryptionPublicKey = new ShieldedEncryptionPublicKey(bytes.subarray(ShieldedCoinPublicKey.keyLength));
    return new _ShieldedAddress(coinPublicKey, encryptionPublicKey);
  });
  static [Bech32mSymbol] = _ShieldedAddress.codec;
  [Bech32mSymbol] = _ShieldedAddress.codec;
  coinPublicKey;
  encryptionPublicKey;
  constructor(coinPublicKey, encryptionPublicKey) {
    this.encryptionPublicKey = encryptionPublicKey;
    this.coinPublicKey = coinPublicKey;
  }
  coinPublicKeyString() {
    return this.coinPublicKey.data.toString("hex");
  }
  encryptionPublicKeyString() {
    return this.encryptionPublicKey.data.toString("hex");
  }
  equals(other) {
    return this.coinPublicKey.equals(other.coinPublicKey) && this.encryptionPublicKey.equals(other.encryptionPublicKey);
  }
};
var ShieldedEncryptionSecretKey = class _ShieldedEncryptionSecretKey {
  static codec = new Bech32mCodec("shield-esk", (esk) => Buffer.from(esk.zswap.yesIKnowTheSecurityImplicationsOfThis_serialize()), (repr) => new _ShieldedEncryptionSecretKey(EncryptionSecretKey.deserialize(repr)));
  // There are some bits in serialization of field elements and elliptic curve points, that are hard to replicate
  // Thus using zswap implementation directly for serialization purposes
  zswap;
  constructor(zswap) {
    this.zswap = zswap;
  }
};
var ShieldedCoinPublicKey = class _ShieldedCoinPublicKey {
  static keyLength = 32;
  static codec = new Bech32mCodec("shield-cpk", (cpk) => cpk.data, (repr) => new _ShieldedCoinPublicKey(repr));
  static fromHexString(hexString) {
    return new _ShieldedCoinPublicKey(Buffer.from(hexString, "hex"));
  }
  data;
  constructor(data) {
    this.data = data;
    if (data.length != _ShieldedCoinPublicKey.keyLength) {
      throw new Error("Coin public key needs to be 32 bytes long");
    }
  }
  toHexString() {
    return this.data.toString("hex");
  }
  equals(other) {
    const otherKey = typeof other === "string" ? _ShieldedCoinPublicKey.fromHexString(other) : other;
    return otherKey.data.equals(this.data);
  }
};
var ShieldedEncryptionPublicKey = class _ShieldedEncryptionPublicKey {
  static keyLength = 32;
  static codec = new Bech32mCodec("shield-epk", (cpk) => cpk.data, (repr) => new _ShieldedEncryptionPublicKey(repr));
  static fromHexString(hexString) {
    return new _ShieldedEncryptionPublicKey(Buffer.from(hexString, "hex"));
  }
  data;
  constructor(data) {
    this.data = data;
  }
  toHexString() {
    return this.data.toString("hex");
  }
  equals(other) {
    const otherKey = typeof other === "string" ? _ShieldedEncryptionPublicKey.fromHexString(other) : other;
    return otherKey.data.equals(this.data);
  }
};
var UnshieldedAddress = class _UnshieldedAddress {
  data;
  static keyLength = 32;
  static codec = new Bech32mCodec("addr", (addr) => addr.data, (repr) => new _UnshieldedAddress(repr));
  static [Bech32mSymbol] = _UnshieldedAddress.codec;
  [Bech32mSymbol] = _UnshieldedAddress.codec;
  constructor(data) {
    if (data.length != _UnshieldedAddress.keyLength) {
      throw new Error("Unshielded address needs to be 32 bytes long");
    }
    this.data = data;
  }
  get hexString() {
    return this.data.toString("hex");
  }
  equals(other) {
    const otherAddress = typeof other === "string" ? new _UnshieldedAddress(Buffer.from(other, "hex")) : other;
    return otherAddress.data.equals(this.data);
  }
};
var DustAddress = class _DustAddress {
  data;
  static codec = new Bech32mCodec("dust", (daddr) => daddr.serialize(), (repr) => new _DustAddress(ScaleBigInt.decode(repr)));
  static [Bech32mSymbol] = _DustAddress.codec;
  [Bech32mSymbol] = _DustAddress.codec;
  static encodePublicKey = (networkId, publicKey) => {
    return _DustAddress.codec.encode(networkId, new _DustAddress(publicKey)).asString();
  };
  constructor(data) {
    if (data >= BLSScalar.modulus) {
      throw new Error("Dust address is too large");
    }
    this.data = data;
  }
  serialize() {
    return ScaleBigInt.encode(this.data);
  }
  equals(other) {
    const otherAddress = typeof other === "bigint" ? other : other.data;
    return otherAddress === this.data;
  }
};

// node_modules/@midnight-ntwrk/midnight-js-utils/dist/index.mjs
var import_buffer = __toESM(require_buffer(), 1);
function assertDefined(value, message) {
  if (value === null || value === void 0) {
    throw new Error(message ?? "Expected value to be defined");
  }
}
function assertUndefined(value, message) {
  if (value !== null && value !== void 0) {
    throw new Error(message ?? "Expected value to be null or undefined");
  }
}
var ttlOneHour = () => new Date(Date.now() + 60 * 60 * 1e3);
var HEX_STRING_REGEXP = /^(?<prefix>(0x)?)(?<byteChars>([0-9A-Fa-f]{2})*)(?<incompleteChars>.*)$/;
var parseHex = (source) => {
  const groups = HEX_STRING_REGEXP.exec(source)?.groups;
  return {
    hasPrefix: groups.prefix === "0x",
    byteChars: groups.byteChars,
    incompleteChars: groups.incompleteChars
  };
};
var toHex = (bytes) => import_buffer.Buffer.from(bytes).toString("hex");
var fromHex = (str) => import_buffer.Buffer.from(str, "hex");
var isHex = (source, byteLen) => {
  if (!source || byteLen !== void 0 && byteLen <= 0) {
    return false;
  }
  const parsedHex = parseHex(source);
  const validByteLen = byteLen ? parsedHex.byteChars.length / 2 === byteLen : parsedHex.byteChars.length > 0;
  return validByteLen && !parsedHex.incompleteChars;
};
function assertIsHex(source, byteLen) {
  if (!source) {
    throw new TypeError("Input string must have non-zero length.");
  }
  if (byteLen !== void 0 && byteLen <= 0) {
    throw new Error("Expected byte length must be greater than zero.");
  }
  const parsedHex = parseHex(source);
  if (parsedHex.incompleteChars) {
    if (parsedHex.incompleteChars.length % 2 > 0) {
      throw new TypeError(`The last byte of input string '${source}' is incomplete.`);
    }
    const invalidCharPos = parsedHex.byteChars.length + (parsedHex.hasPrefix ? 2 : 0);
    throw new TypeError(`Invalid hex-digit '${source[invalidCharPos]}' found in input string at index ${invalidCharPos}.`);
  }
  if (!parsedHex.byteChars) {
    throw new TypeError(`Input string '${source}' is not a valid hex-string.`);
  }
  if (byteLen) {
    const actualByteLen = parsedHex.byteChars.length / 2;
    if (byteLen !== actualByteLen) {
      throw new TypeError(`Expected an input string with byte length of ${byteLen}, got ${actualByteLen}.`);
    }
  }
}
var parseCoinPublicKeyToHex = (possibleBech32, zswapNetworkId) => {
  if (isHex(possibleBech32))
    return possibleBech32;
  const parsedBech32 = MidnightBech32m.parse(possibleBech32);
  const decoded = ShieldedCoinPublicKey.codec.decode(zswapNetworkId, parsedBech32);
  return import_buffer.Buffer.from(decoded.data).toString("hex");
};
var parseEncPublicKeyToHex = (possibleBech32, zswapNetworkId) => {
  if (isHex(possibleBech32))
    return possibleBech32;
  const parsedBech32 = MidnightBech32m.parse(possibleBech32);
  const decoded = ShieldedEncryptionPublicKey.codec.decode(zswapNetworkId, parsedBech32);
  return import_buffer.Buffer.from(decoded.data).toString("hex");
};
var MIN_PASSWORD_LENGTH = 16;
var MIN_CHARACTER_CLASSES = 3;
var MAX_CONSECUTIVE_REPEATED = 3;
var MIN_SEQUENTIAL_LENGTH = 4;
var PasswordValidationError = class extends Error {
  reason;
  constructor(message, reason) {
    super(message);
    this.reason = reason;
    this.name = "PasswordValidationError";
  }
};
var countCharacterClasses = (password) => {
  let count = 0;
  if (/[a-z]/.test(password))
    count++;
  if (/[A-Z]/.test(password))
    count++;
  if (/[0-9]/.test(password))
    count++;
  if (/[^a-zA-Z0-9]/.test(password))
    count++;
  return count;
};
var hasRepeatedCharacters = (password) => {
  let consecutiveCount = 1;
  for (let i = 1; i < password.length; i++) {
    if (password[i] === password[i - 1]) {
      consecutiveCount++;
      if (consecutiveCount > MAX_CONSECUTIVE_REPEATED) {
        return true;
      }
    } else {
      consecutiveCount = 1;
    }
  }
  return false;
};
var hasSequentialPattern = (password) => {
  const lowerPassword = password.toLowerCase();
  for (let i = 0; i <= lowerPassword.length - MIN_SEQUENTIAL_LENGTH; i++) {
    let ascendingCount = 1;
    let descendingCount = 1;
    for (let j = 1; j < MIN_SEQUENTIAL_LENGTH; j++) {
      const currentCode = lowerPassword.charCodeAt(i + j);
      const prevCode = lowerPassword.charCodeAt(i + j - 1);
      if (currentCode === prevCode + 1) {
        ascendingCount++;
      } else {
        ascendingCount = 1;
      }
      if (currentCode === prevCode - 1) {
        descendingCount++;
      } else {
        descendingCount = 1;
      }
      if (ascendingCount >= MIN_SEQUENTIAL_LENGTH || descendingCount >= MIN_SEQUENTIAL_LENGTH) {
        return true;
      }
    }
  }
  return false;
};
var validatePassword = (password) => {
  if (!password) {
    throw new PasswordValidationError("Password is required for private state encryption.\nPlease provide a password via privateStoragePasswordProvider in the configuration.", "missing");
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new PasswordValidationError(`Password is shorter than ${MIN_PASSWORD_LENGTH} characters`, "too_short");
  }
  if (hasRepeatedCharacters(password)) {
    throw new PasswordValidationError(`Password contains too many repeated characters (more than ${MAX_CONSECUTIVE_REPEATED} identical in a row)`, "repeated_characters");
  }
  const characterClasses = countCharacterClasses(password);
  if (characterClasses < MIN_CHARACTER_CLASSES) {
    throw new PasswordValidationError(`Password must contain at least ${MIN_CHARACTER_CLASSES} of: uppercase letters, lowercase letters, digits, special characters. Found: ${characterClasses}`, "insufficient_classes");
  }
  if (hasSequentialPattern(password)) {
    throw new PasswordValidationError("Password contains sequential patterns (e.g., '1234', 'abcd'). Use a more random password", "sequential_pattern");
  }
};
var MAX_SAFE_NAME_LENGTH = 255;
var SAFE_NAME_PATTERN = /^[a-zA-Z0-9._-]+$/;
var SEMVER_PATTERN = /^\d+\.\d+\.\d+(?:-[A-Za-z0-9._-]+)?$/;
var LOOPBACK_HOSTNAMES = /* @__PURE__ */ new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);
var INSECURE_SCHEMES = /* @__PURE__ */ new Set(["http:", "ws:"]);
function assertSafeName(name, label) {
  if (typeof name !== "string" || name.length === 0 || name.length > MAX_SAFE_NAME_LENGTH) {
    throw new Error(`Invalid ${label}: ${JSON.stringify(name)}`);
  }
  if (name === "." || name === "..") {
    throw new Error(`Invalid ${label}: ${JSON.stringify(name)}`);
  }
  if (!SAFE_NAME_PATTERN.test(name)) {
    throw new Error(`Invalid ${label}: ${JSON.stringify(name)}`);
  }
}
function assertSemVer(version, label) {
  if (typeof version !== "string" || version.length === 0 || version.length > MAX_SAFE_NAME_LENGTH) {
    throw new Error(`Invalid ${label}: ${JSON.stringify(version)}`);
  }
  if (!SEMVER_PATTERN.test(version)) {
    throw new Error(`Invalid ${label}: ${JSON.stringify(version)}`);
  }
}
function warnIfInsecureRemoteUrl(url, label) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return;
  }
  if (!INSECURE_SCHEMES.has(parsed.protocol)) {
    return;
  }
  if (LOOPBACK_HOSTNAMES.has(parsed.hostname)) {
    return;
  }
  const scheme = parsed.protocol.replace(/:$/, "");
  const secureReplacement = scheme === "http" ? "https://" : "wss://";
  console.warn(`midnight-js: ${label} uses unencrypted ${scheme}:// for non-loopback host '${parsed.hostname}'; sensitive data may be transmitted in clear text. Use ${secureReplacement} in production.`);
}
function assertIsContractAddress(contractAddress) {
  const CONTRACT_ADDRESS_BYTE_LENGTH = 32;
  assertIsHex(contractAddress, CONTRACT_ADDRESS_BYTE_LENGTH);
  const parsedHex = parseHex(contractAddress);
  if (parsedHex.hasPrefix) {
    throw new TypeError(`Unexpected '0x' prefix in contract address '${contractAddress}'`);
  }
}

export {
  assertDefined,
  assertUndefined,
  ttlOneHour,
  parseHex,
  toHex,
  fromHex,
  isHex,
  assertIsHex,
  parseCoinPublicKeyToHex,
  parseEncPublicKeyToHex,
  MIN_PASSWORD_LENGTH,
  MIN_CHARACTER_CLASSES,
  MAX_CONSECUTIVE_REPEATED,
  MIN_SEQUENTIAL_LENGTH,
  PasswordValidationError,
  validatePassword,
  MAX_SAFE_NAME_LENGTH,
  assertSafeName,
  assertSemVer,
  warnIfInsecureRemoteUrl,
  assertIsContractAddress
};
/*! Bundled license information:

@scure/base/index.js:
  (*! scure-base - MIT License (c) 2022 Paul Miller (paulmillr.com) *)
*/
//# sourceMappingURL=chunk-7JNO6ITM.js.map
